<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick, onActivated, onMounted } from 'vue'
import {
  dispatchMsg,
  getVisitorList,
  chatRecords,
  upload,
  inviteEvaluate,
} from '@renderer/api/chat'
import OrderPopUp from './components/OrderPopUp.vue'
import SessionTransfer from './components/SessionTransfer.vue'
import TranslatorConfig from './components/TranslatorConfig.vue'
import UserDetails from '@renderer/components/UserDetails/index.vue'
import ChatRecord from './components/ChatRecord.vue'
import { useChatStore } from '@renderer/store/modules/chat'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import type { Query, Record } from './components/type'
import { getFlagItme } from '@renderer/utils/local-storage'
import { searchList } from '@renderer/utils/dictionary'
import { useUserStore } from '@renderer/store/modules/user'
import { debounce, throttle } from '@renderer/utils/performance'
import { quickReply } from '@renderer/api/config'
import { readMessage } from './components/index'
import dayjs from 'dayjs'
import './components/index'
import { useRoute } from 'vue-router'
const route = useRoute()

const chatStore = useChatStore()

const { messageList, sumMessages, visitorOnlineList, readVisitorId } =
  storeToRefs(chatStore)
const { projectId } = storeToRefs(useUserStore())

const listTabIndex = ref(0) // 0: 全部 1: 等待应答 2:已应答
const chatIndex = ref(0) //选中聊天客户

const message = ref('') // 输入框内容
const Order = ref(null) // 工单组件弹窗
const session = ref(null) // 会话转接弹窗
const translate = ref(null) // 翻译配置弹窗
const moreStatus = ref(false) // 更多操作弹窗(nav 导航)
const commonStatus = ref(false) //常用语弹窗
const alertSearch = ref(false) // 搜索弹窗
const visitorList = ref([]) // 访客列表
const scrollable = ref(null) // 聊天盒子
const listBox = ref() // 访客列表盒子
const list = ref([]) //聊天内容列表

const commonList = ref([]) // 常用语列表
const loading = ref(false)
const listLoading = ref(false)
const flag = ref(1)

const userDetails = ref() // 用户详情组件

const detailsOrRecord = ref(true)

const visitorName = ref('')
const visitorAvator = ref('')

// from_id and to_id
const secret = JSON.parse(getFlagItme('userInfo')).secret

const toId = ref('') // 客服id

const query = ref<Query>({
  content: '',
  email: '',
  feacebook: '',
  is_res: 0,
  page: 1,
  page_size: 20,
  phone: '',
  project_id: projectId.value,
  qq: '',
  remark: '',
  twitter: '',
  visitor_name: '',
  weixin: '',
})

const searchValue = ref('')

const showLoadingMessage = ref(false)
const loadingMessage = ref(true)

const handleLoading = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 400)
}

// 获取访客列表
const takeVisitorList = (implementFlag: boolean = true) => {
  return new Promise(async res => {
    try {
      listLoading.value = true

      const {
        data: { list, num_message },
      } = await getVisitorList(query.value)

      chatStore.setSumMessages(num_message)

      if (implementFlag) list.rows = [...visitorList.value, ...list.rows]

      if (list.rows.length === 0) {
        listLoading.value = false

        return ElMessage.warning('暂无访客')
      }

      visitorList.value = list.rows.map(item => {
        const currentTime = dayjs() // 获取当前时间

        const itemTime = dayjs(item.last_time) // 解析数组元素中的时间

        if (item.last_content.includes('img[')) {
          item.is_img = true
          item.last_content = '[图片]'
        } else if (item.last_content.includes('file[')) {
          item.is_file = true
          item.last_content = '[文件]'
        }

        // 判断时间是否为当天
        if (itemTime.isSame(currentTime, 'day')) {
          // 使用正则处理为 09:13 的格式保留时分
          const formattedTime = itemTime.format('HH:mm')

          return { ...item, last_time: formattedTime }
        } else if (itemTime.format('HH:mm') === 'Invalid Date') {
          return { ...item, last_time: currentTime.format('HH:mm') }
        } else {
          // 过滤为 2023-07-05 的格式
          const formattedTime = itemTime.format('YYYY-MM-DD')

          return { ...item, last_time: formattedTime }
        }
      })

      if (flag.value === 1) {
        toRefresh()
        flag.value++
      }

      setTimeout(() => {
        listLoading.value = false
      }, 200)
    } catch (_) {
      console.log(_)

      listLoading.value = false
    }
    res('')
  })
}

takeVisitorList()

// 封装获取访客信息  聊天记录
const toRefresh = () => {
  const id = visitorList.value[0].visitor_id
  toId.value = id

  console.log(visitorList.value[0])

  getChatRecords(id, true)

  visitorName.value =
    visitorList.value[0].visitor_name === ''
      ? visitorList.value[0].name
      : visitorList.value[0].visitor_name
  visitorAvator.value =
    typeof +visitorList.value[0].avatar === 'number'
      ? visitorList.value[0].name
      : visitorList.value[0].avatar
  readMessage(id)
  session.value.getTransferList(id)

  nextTick(() => {
    userDetails.value.getVisitorInfo(id)
  })
}

// 获取常用语列表
const getQuickReply = async () => {
  const {
    data: { rows },
  } = await quickReply({
    project_id: projectId.value,
    page: 1,
    page_size: 9999,
  })

  commonList.value = rows
}

// 点击访客列表筛选
const handleTab = async (index: number) => {
  try {
    if (listTabIndex.value === index) return

    listTabIndex.value = index

    query.value.is_res = index
    query.value.page = 1
    visitorList.value = []

    await takeVisitorList()

    // toRefresh()

    handleChatIndex(0, visitorList.value[0].visitor_id, false)
  } catch (error) {
    console.log(error)
  }
}

const recordParams = ref<Record>({
  content_msg: null,
  forward_or_back: null,
  is_to_latest: null,
  msg_id: null,
  page: 1,
  page_size: 50,
  search_key: null,
  search_type: 0,
  visitor_id: null,
  is_kefu: 1,
})
// 获取聊天记录
const getChatRecords = async (id: string, execute: boolean) => {
  const { data } = await chatRecords({
    ...recordParams.value,
    visitor_id: id,
  })

  showLoadingMessage.value =
    recordParams.value.page >= data.total_pages ? false : true

  data.rows.reverse()
  data.rows.forEach((item: any) => {
    if (item.content.includes('img[')) {
      item.is_img = true
    } else if (item.content.includes('file[')) {
      item.is_file = true
    }
  })

  chatStore.resetList(data.rows)

  recordParams.value.page++
  if (execute) {
    nextTick(() => {
      scrollToBottom(true)
    })
  }
}

// 点击请求聊天记录
const handleLoadingMessage = async () => {
  loadingMessage.value = false

  const { data } = await chatRecords({
    ...recordParams.value,
    visitor_id: toId.value,
  })

  if (recordParams.value.page >= data.total_pages) {
    showLoadingMessage.value = false
  } else {
    showLoadingMessage.value = true
    recordParams.value.page++
  }

  scrollable.value.scrollTop =
    scrollable.value.scrollHeight - (scrollable.value.scrollHeight - 80)

  data.rows.reverse()
  setTimeout(() => {
    loadingMessage.value = true

    chatStore.addChatRecord(data.rows)
  }, 1000)
}

// 发送消息后  盒子滚动到底部
const scrollToBottom = (execute: boolean) => {
  if (execute && scrollable.value)
    scrollable.value.scrollTop = scrollable.value.scrollHeight
}

const checkListBoxScroll = debounce(() => {
  if (
    listBox.value.scrollTop + listBox.value.clientHeight >=
    listBox.value.scrollHeight - 400
  ) {
    query.value.page++

    takeVisitorList()
  }
}, 400)

// 点击选择访客
const handleChatIndex = (index: number, id: string, execution: boolean) => {
  // 点击切换 tab 栏时  会重新触发该函数
  if (execution && toId.value === id) return

  handleLoading()
  moreStatus.value = false
  commonStatus.value = false

  recordParams.value = {
    content_msg: null,
    forward_or_back: null,
    is_to_latest: null,
    msg_id: null,
    page: 1,
    page_size: 50,
    search_key: null,
    search_type: 0,
    visitor_id: null,
    is_kefu: 1,
  }

  chatIndex.value = index
  visitorName.value =
    visitorList.value[index].visitor_name === ''
      ? visitorList.value[index].name
      : visitorList.value[index].visitor_name

  visitorAvator.value =
    typeof +visitorList.value[index].avatar === 'number'
      ? visitorList.value[index].name
      : visitorList.value[index].avatar

  toId.value = id
  getChatRecords(id, true)
  readMessage(id)
  clearUnread(id)

  detailsOrRecord.value = true

  translate.value.getTranslateConfig(toId.value)
  session.value.getTransferList(id)

  nextTick(() => {
    userDetails.value.getVisitorInfo(id)
    scrollToBottom(true)
  })
}

// 更多操作弹窗显示  隐藏
const handleMoreStatus = () => {
  moreStatus.value = !moreStatus.value
}

// 更多操作弹窗内组件  显示
const handleDialogStatus = (type: string) => {
  if (type === 'Order') {
    Order.value.addDialogVisible = true
  } else if (type === 'session') {
    session.value.dialogVisible = true
  } else {
    translate.value.dialogVisible = true
    translate.value.getTranslateConfig(toId.value)
  }
}

// 常用语弹窗显示  隐藏
const handlcommonStatus = (node: any) => {
  commonStatus.value = !commonStatus.value

  if (commonStatus.value) getQuickReply()

  if (node.type === 'small') message.value = node.item.phrases_desc
}

let cansendMessageAsync = true // 添加状态标志

// 回车键发送
const handleEnter = async event => {
  event.preventDefault() // 阻止浏览器默认换行操作

  if (!message.value) return ElMessage.warning('消息不能为空')

  if (!cansendMessageAsync) return
  cansendMessageAsync = false

  await sendMessageAsync()

  cansendMessageAsync = true

  nextTick(() => {
    scrollToBottom(true)
  })
}

// let aaa = 0
// setInterval(async () => {
// 	const formData = new FormData()

// 	formData.append('type', 'kefu')
// 	formData.append('content', '' + aaa)
// 	formData.append('from_id', '5ac0364ec0bd73b7a682d26685464926')
// 	formData.append('to_id', 'ea4749ad-f534-4161-9959-e634acce7601')

// 	await dispatchMsg(formData)
// 	aaa++
// }, 1000)

// 发送消息
const sendMessageAsync = () => {
  return new Promise(async resolve => {
    try {
      const formData = new FormData()

      formData.append('type', 'kefu')
      formData.append('content', message.value)
      formData.append('from_id', secret)
      formData.append('to_id', toId.value)

      await dispatchMsg(formData)

      const item = visitorList.value.find(
        item => item.visitor_id === toId.value
      )

      const lastItem = list.value.at(-1)

      item.last_time = dayjs().format('HH:mm')

      if (lastItem.type !== 10) item.last_content = message.value

      if (message.value.includes('img[')) {
        nextTick(() => {
          item.last_content = '[图片]'
        })
      }

      if (message.value.includes('file[')) {
        nextTick(() => {
          item.last_content = '[文件]'
        })
      }

      message.value = ''

      resolve('') // 解决 Promise，表示消息发送完成
    } catch (error) {
      console.log(error)
    }
  })
}

// 上传文件
const handleUpFile = async (event: any, type: string) => {
  const formData = new FormData()
  const file = event.target.files[0] // 获取选择的文件

  formData.append('file', file)
  const {
    data: { file_info },
  } = await upload(formData)

  type === 'img'
    ? (message.value = `img[${file_info.file_url}]`)
    : (message.value = `file[${file_info.file_url}]`)

  sendMessageAsync()
}

// 查看img
const lookImg = (url: string) => {
  const div = document.createElement('div')
  const img = document.createElement('img')
  div.className = 'look-img'
  img.src = url.replace('img[', '').replace(']', '')

  div.appendChild(img)

  const main = document.querySelector('.chat .main')
  main.appendChild(div)

  div.addEventListener('click', () => {
    main.removeChild(div)
  })
}

// 下载文件  todo
const downloadFile = (item: any) => {
  const url = item.content.replace('file[', '').replace(']', '')

  const link = document.createElement('a')
  link.href = url
  link.download = url.match(/\/([^\/]+)$/)[1] // eslint-disable-line
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 点击搜索弹窗item
const handleSearchIndex = async ({ value }) => {
  query.value.phone = ''
  query.value.visitor_name = ''
  query.value.qq = ''
  query.value.weixin = ''
  query.value.email = ''
  query.value.feacebook = ''
  query.value.twitter = ''
  query.value.remark = ''
  query.value.content = ''

  query.value.page = 1
  query.value[value] = searchValue.value

  visitorList.value = []

  await takeVisitorList()

  toRefresh()

  chatIndex.value = 0

  scrollToBottom(true)
}

// 搜索框失焦
const handleBlue = async () => {
  setTimeout(() => {
    alertSearch.value = false
  }, 200)

  if (!searchValue.value) {
    resetQuery()

    visitorList.value = []

    await takeVisitorList()

    toRefresh()

    chatIndex.value = 0

    scrollToBottom(true)
  }
}

const resetQuery = () => {
  query.value = {
    content: '',
    email: '',
    feacebook: '',
    is_res: 0,
    page: 1,
    page_size: 20,
    phone: '',
    project_id: projectId.value,
    qq: '',
    remark: '',
    twitter: '',
    visitor_name: '',
    weixin: '',
  }
}

// 修改名字后更新访客名字
const updateName = ({ id, name }) => {
  visitorName.value = name
  visitorList.value.filter(item => item.id === id)[0].visitor_name = name
}

// 显示聊天记录组件
const showChatRecord = (flag: boolean) => {
  detailsOrRecord.value = flag

  if (flag) {
    nextTick(() => {
      userDetails.value.getVisitorInfo(toId.value)
    })
  }
}

// 邀请评价
const InviteComments = async () => {
  await inviteEvaluate({
    visitor_id: toId.value,
  })
}

// 清除未读消息
const clearUnread = (id: string) => {
  visitorList.value.find(item => item.visitor_id === id).un_read = 0
}

const handleCloseAlert = (event: Event) => {
  const ClassName = event.target['className']

  if (
    moreStatus.value &&
    !ClassName.includes('more') &&
    (event.target as any).tagName !== 'IMG'
  ) {
    moreStatus.value = false
  }

  if (
    commonStatus.value &&
    !(ClassName === 'alert-common') &&
    ClassName !== 'common' &&
    ClassName !== 'one'
  ) {
    commonStatus.value = false
  }
}

onUnmounted(() => {
  console.log('页面销毁')
})

watch(
  () => messageList.value.length,
  () => {
    list.value = messageList.value.filter(
      item => item.visitor_id === toId.value || item.id === toId.value
    )
    const flag = visitorList.value.find(
      item => item.visitor_id === messageList.value.at(-1)?.visitor_id
    )

    if (flag) {
      flag.un_read = messageList.value?.at(-1)?.un_read
      flag.last_content = messageList.value?.at(-1)?.content
    }
  }
)

watch(
  () => visitorOnlineList.value.length,
  async () => {
    const last = visitorOnlineList.value.at(-1)

    if (typeof last === 'number') {
      visitorList.value = []

      query.value.page_size = query.value.page * query.value.page_size

      query.value.page = 1

      await takeVisitorList()
      nextTick(() => {
        userDetails.value.getVisitorInfo(toId.value)
        scrollToBottom(true)
      })

      chatIndex.value = visitorList.value.findIndex(
        item => item.visitor_id === toId.value
      )
    } else {
      visitorList.value.find(item => item.visitor_id === last).status = 2
    }
  }
)

watch(
  () => readVisitorId.value,

  () => {
    list.value.filter(item => !item.read).forEach(item => (item.read = true))
    if (visitorList.value[chatIndex.value]?.visitor_id === toId.value) {
      visitorList.value[chatIndex.value].un_read = 0
      readMessage(toId.value)
    }
  }
)

watch(
  () => route.query,
  () => {
    if (route.query.id) {
      handleChatIndex(
        visitorList.value.findIndex(item => item.visitor_id === route.query.id),
        route.query.id.toString(),
        true
      )
    }
  }
)

onActivated(() => {
  setTimeout(async () => {
    if (!route.query.id) {
      await takeVisitorList(false)
      toRefresh()

      setTimeout(() => {
        chatIndex.value = visitorList.value.findIndex(
          item => item.visitor_id === toId.value
        )
      }, 200)
    }
  }, 500)
})
</script>

<template>
  <div class="chat">
    <div class="left-list" v-loading="listLoading">
      <div class="search">
        <el-input
          class="search-input"
          placeholder="请输入用户ID/聊天关键词"
          style="height: 32px"
          @focus="alertSearch = true"
          @blur="handleBlue"
          v-model="searchValue"
        >
          <template #prefix>
            <img src="@renderer/assets/img/chat/search.png" alt="" />
          </template>
        </el-input>
      </div>
      <div class="list-tab">
        <div class="tab">
          <div
            :class="{ 'tab-item': true, active: listTabIndex === 0 }"
            @click="handleTab(0)"
          >
            <img src="@renderer/assets/img/chat/all_messages.webp" alt="" />
            <p>全部</p>
            <span class="tip" v-show="sumMessages.all_num">{{
              sumMessages.all_num
            }}</span>
          </div>
          <div
            :class="{ 'tab-item': true, active: listTabIndex === 2 }"
            @click="handleTab(2)"
          >
            <img src="@renderer/assets/img/chat/wait.png" alt="" />
            <p>等待应答</p>

            <span class="tip" v-show="sumMessages.un_res_num">{{
              sumMessages.un_res_num
            }}</span>
          </div>
          <div
            :class="{ 'tab-item': true, active: listTabIndex === 1 }"
            @click="handleTab(1)"
          >
            <img src="@renderer/assets/img/chat/already.png" alt="" />
            <p>已应答</p>

            <span class="tip" v-show="sumMessages.res_num">{{
              sumMessages.res_num
            }}</span>
          </div>
        </div>
      </div>

      <div
        class="list"
        ref="listBox"
        @scroll="checkListBoxScroll"
        v-if="visitorList.length"
      >
        <div
          v-for="(item, index) in visitorList"
          :key="index"
          :class="{
            'list-item': true,
            'list-item-active': index === chatIndex,
          }"
          @click="handleChatIndex(index, item.visitor_id, true)"
        >
          <div class="left">
            <!-- <p>{{ item.name.substr(2, 3) }}</p> -->
            <img
              src="https://cdn.iconscout.com/icon/free/png-512/avatar-375-456327.png"
              alt=""
            />

            <span
              class="online"
              :style="{
                backgroundColor: item.status === 1 ? '#4cd964' : '#ccc',
              }"
            >
            </span>
          </div>
          <div class="right">
            <div class="top">
              <span>{{
                item.visitor_name === '' ? item.name : item.visitor_name
              }}</span>
              <span>{{ item.last_time }}</span>
            </div>
            <div class="bottom">
              <span v-if="item.last_content.includes('img[')">[图片]</span>
              <span v-else-if="item.last_content.includes('file[')"
                >[文件]</span
              >
              <span v-else>{{ item.last_content }}</span>
              <!-- 未读消息数量 -->
              <span v-show="item.un_read">{{
                item.un_read <= 99
                  ? item.un_read
                  : item.un_read > 99
                  ? '99+'
                  : ''
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="no-chat" v-else>
        <div>
          <img src="@renderer/assets/img/chat/No_Chat.webp" alt="" />

          <p>没有正在进行的聊天</p>
        </div>
      </div>

      <div class="dialog-search" v-if="alertSearch">
        <div
          :class="{ item: true }"
          v-for="item in searchList"
          :key="item.id"
          @click="handleSearchIndex(item)"
        >
          <p>
            <img src="@renderer/assets/img/chat/search.png" alt="" />
            <span>{{ item.label }}</span>
          </p>
          <p>包含</p>
          <p>{{ searchValue }}</p>
        </div>
      </div>
    </div>
    <div
      class="main"
      v-loading="loading"
      element-loading-background="#fff"
      @click="handleCloseAlert"
    >
      <div class="user-nav">
        <div v-if="visitorList.length">
          <img
            src="https://cdn.iconscout.com/icon/free/png-512/avatar-375-456327.png"
            alt=""
          />

          <!-- <p class="avator">{{ visitorAvator.substr(2, 3) }}</p> -->

          <p>{{ visitorName }}</p>
        </div>

        <div class="nav-no-chat" v-else>暂无聊天</div>
        <img
          src="@renderer/assets/img/chat/more.webp"
          alt=""
          @click="handleMoreStatus"
        />

        <div class="alert-more" v-if="moreStatus">
          <p @click="handleDialogStatus('translator')">
            <img src="@renderer/assets/img/chat/fanyi.webp" alt="" />
            <span>翻译设置</span>
          </p>
          <p @click="handleDialogStatus('Order')">
            <img src="@renderer/assets/img/chat/chuangjian.webp" alt="" />
            <span>创建工单</span>
          </p>
          <p @click="handleDialogStatus('session')">
            <img src="@renderer/assets/img/chat/zhuanyi.webp" alt="" />
            <span>会话转移</span>
          </p>
        </div>
      </div>
      <div class="user-chat" ref="scrollable" v-if="visitorList.length">
        <div class="loadingMessage" v-if="showLoadingMessage">
          <p v-if="loadingMessage" @click="handleLoadingMessage">
            点击加载更多历史消息
          </p>
          <p v-else>
            <img src="@renderer/assets/img/chat/Loading.png" alt="" />
            <span>正在加载历史消息</span>
          </p>
        </div>
        <div class="chat-list">
          <div v-for="item in list" :key="item.msg_id">
            <div
              class="visitor"
              v-if="
                (item.type === 1 ||
                  item.type === 2 ||
                  item.type === 3 ||
                  item.type === 4) &&
                (item.is_kefu === 'no' || item.mes_type === 'visitor')
              "
            >
              <img
                src="https://cdn.iconscout.com/icon/free/png-512/avatar-375-456327.png"
                alt=""
              />

              <!-- <p class="avator">{{ item.visitor_name.substr(2, 3) }}</p> -->
              <div v-if="item.type === 3" @click="lookImg(item.content)">
                <img
                  :src="item.content.replace('img[', '').replace(']', '')"
                  alt=""
                  class="up-img"
                />
              </div>
              <div
                v-else-if="item.type === 4"
                class="up-file"
                @click="downloadFile(item)"
              >
                <p><img src="@renderer/assets/img/chat/file.webp" alt="" /></p>
                <p>
                  {{
                    item.content
                      .replace('file[', '')
                      .replace(']', '')
                      .match(/\/([^\/]+)$/)[1]
                  }}
                </p>
              </div>
              <div v-else>
                <p>
                  <span
                    :style="{
                      paddingBottom: item.translate_status ? '10px' : '0px',
                    }"
                    >{{ item.content }}</span
                  >
                  <span v-show="item.translate_status"></span>
                  <span v-show="item.translate_status">{{
                    item.translation
                  }}</span>
                </p>
                <p
                  @click="item.translate_status = !item.translate_status"
                  v-if="!item.translate_status && item.translation !== ''"
                >
                  查看译文
                </p>
                <p
                  @click="item.translate_status = !item.translate_status"
                  v-if="item.translate_status && item.translation !== ''"
                >
                  查看原文
                </p>
              </div>
            </div>

            <div
              v-else-if="
                item.type === 5 ||
                item.type === 7 ||
                item.type === 9 ||
                item.type === 10 ||
                item.type === 11
              "
              class="invite-comments"
            >
              <p>{{ item.content }}</p>
            </div>

            <div v-if="item.type === 8" class="invite-comments">
              <p>评价邀请已发送</p>
            </div>

            <div v-else-if="item.type === 6" class="invite-comments">
              <p>访客下线</p>
            </div>

            <div
              class="server"
              v-else-if="
                (item.type === 1 ||
                  item.type === 2 ||
                  item.type === 3 ||
                  item.type === 4) &&
                (item.is_kefu === 'yes' || item.mes_type === 'kefu')
              "
            >
              <div
                v-if="item.type === 3"
                @click="lookImg(item.content)"
                style="padding-top: 10px"
              >
                <img
                  :src="item.content.replace('img[', '').replace(']', '')"
                  alt=""
                  class="up-img"
                />
              </div>

              <div
                v-else-if="item.type === 4"
                class="up-file"
                @click="downloadFile(item)"
              >
                <p>
                  <img src="@renderer/assets/img/chat/file_two.webp" alt="" />
                </p>
                <p>
                  {{
                    item.content
                      .replace('file[', '')
                      .replace(']', '')
                      .match(/\/([^\/]+)$/)[1]
                  }}
                </p>
              </div>
              <div class="all" v-else>
                <p
                  v-if="item.read"
                  :style="{
                    marginBottom: item.translation === '' ? '4px' : '',
                  }"
                >
                  已读
                </p>
                <p
                  v-else
                  :style="{
                    marginBottom: item.translation === '' ? '4px' : '',
                  }"
                >
                  未读
                </p>
                <div class="message">
                  <p>
                    <span
                      :style="{
                        paddingBottom: item.translate_status ? '10px' : '0px',
                      }"
                    >
                      {{ item.content }}
                    </span>
                    <span v-show="item.translate_status"></span>
                    <span v-show="item.translate_status">
                      {{ item.translation }}
                    </span>
                  </p>
                  <p
                    @click="item.translate_status = !item.translate_status"
                    v-if="!item.translate_status && item.translation !== ''"
                  >
                    查看译文
                  </p>
                  <p
                    @click="item.translate_status = !item.translate_status"
                    v-if="item.translate_status && item.translation !== ''"
                  >
                    查看原文
                  </p>
                </div>
              </div>
              <img
                src="https://th.bing.com/th/id/OIP.rXzs4yDUHSTW3va636LSAQAAAA?pid=ImgDet&rs=1"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>

      <div class="user-chat" v-else></div>
      <div class="user-input">
        <div class="shortcut">
          <div class="function">
            <label for="imgFileInput">
              <img src="@renderer/assets/img/chat/image.webp" alt="" />
            </label>
            <label for="fileInput">
              <img src="@renderer/assets/img/chat/folder.webp" alt="" />
            </label>
            <img
              src="@renderer/assets/img/chat/chat_message.webp"
              alt=""
              @click="showChatRecord(false)"
            />
            <img
              src="@renderer/assets/img/chat/collect.webp"
              alt=""
              @click="InviteComments"
            />
          </div>
          <div class="common" @click="handlcommonStatus({ type: 'big' })">
            <p class="one">常用语</p>
            <img src="@renderer/assets/img/chat/down.webp" alt="" class="one" />
          </div>
          <div class="alert-common" v-show="commonStatus">
            <p
              v-for="item in commonList"
              :key="item.id"
              @click="handlcommonStatus({ type: 'small', item: item })"
            >
              {{ item.phrases_desc }}
            </p>
          </div>
        </div>
        <div class="chat-main">
          <el-input
            type="textarea"
            :rows="6"
            placeholder="请输入内容"
            v-model.trim="message"
            maxlength="2000"
            @keydown.enter="handleEnter"
          />
        </div>
        <div class="dispatch" @click="sendMessageAsync">
          <p>发送</p>
          <img src="@renderer/assets/img/chat/dispatch.webp" alt="" />
        </div>

        <input
          type="file"
          id="imgFileInput"
          accept=".png, .jpg, .gif, .bmp"
          style="display: none"
          @change="handleUpFile($event, 'img')"
        />

        <input
          type="file"
          id="fileInput"
          accept=".zip,.rar,.7z,.tar,.gz,.tar.bz2,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf,application/rtf,application/vnd.oasis.opendocument.text,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style="display: none"
          @change="handleUpFile($event, 'file')"
        />
      </div>
    </div>

    <UserDetails
      :id="toId"
      ref="userDetails"
      v-loading="loading"
      element-loading-background="#fff"
      @updateName="updateName"
      v-if="detailsOrRecord && visitorList.length"
    />

    <ChatRecord
      @changePage="showChatRecord"
      :visitorId="toId"
      v-else-if="!detailsOrRecord && visitorList.length"
    />

    <div class="no-chat-userinfo" v-else>
      <img src="@renderer/assets/img/chat/no_chat_userinfo.webp" alt="" />

      <p>暂无访客</p>
    </div>

    <OrderPopUp ref="Order" />

    <SessionTransfer ref="session" />

    <TranslatorConfig ref="translate" />
  </div>
</template>

<style scoped lang="scss">
.chat {
  display: flex;
  padding: 10px;
  height: calc(100% - 60px);
  overflow: hidden;

  .left-list {
    background-color: #fff;
    margin-right: 10px;
    border-radius: 10px;
    position: relative;

    .dialog-search {
      position: absolute;
      top: 50px;
      left: 10px;
      width: 300px;
      z-index: 4;
      background: #ffffff;
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      padding: 10px;

      .item {
        display: flex;
        height: 34px;
        align-items: center;
        border-radius: 6px;
        padding-left: 10px;
        cursor: pointer;
        & p:first-child {
          display: flex;
          align-items: flex-end;
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
          width: 90px;
          img {
            width: 16px;
            height: 16px;

            object-fit: cover;
            margin-right: 10px;
          }
        }

        & p:nth-child(2) {
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #999999;

          margin: 0 2px 0 30px;
        }

        & p:last-child {
          text-align: right;

          width: 120px;

          font-size: 14px;
          font-family: Source Han Sans CN-Medium, Source Han Sans CN;
          font-weight: 500;
          color: #4faa74;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .item:hover {
        background-color: rgba(79, 170, 116, 0.2);
        & p:first-child {
          color: #4faa74;
        }
      }
    }
    .search {
      width: 100%;
      padding: 12px 10px;
      margin-bottom: 30px;
      height: 32px;
      .el-input__prefix-inner {
        img {
          width: 16px;
          height: 16px;
        }
      }

      .search-input {
        :deep(.el-input__wrapper) {
          border-radius: 20px 20px 20px 20px;
          background-color: #fff;
        }
      }

      :deep(.el-input__inner::placeholder) {
        font-size: 12px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #999999;
      }
    }

    .list-tab {
      padding: 0 10px 0 10px;
      margin-bottom: 20px;
      height: 44px;

      .tab {
        padding: 2px;
        height: 40px;
        width: 100%;
        background: #f7f8fa;
        display: flex;
        font-size: 14px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #333333;
        line-height: 20px;

        .tab-item {
          width: 96px;
          display: flex;
          align-items: center;
          justify-content: center;

          background: #f7f8fa;
          cursor: pointer;
          position: relative;
          img {
            width: 20px;
            height: 20px;
            margin-right: 4px;
          }
        }
        & .tab-item:last-child {
          .tip {
            right: 0px;
          }
        }

        & .tab-item:nth-child(2) {
          margin: 0px 4px;
          .tip {
            z-index: 3;
            right: -6px;
          }
        }
        .active {
          color: #50aa74;
          background: #ffffff;
          border-radius: 8px 8px 8px 8px;
        }

        .tip {
          position: absolute;
          height: 16px;
          background: #ff0000;
          border-radius: 10px;
          display: block;
          right: 6px;
          top: -6px;
          padding: 0 6px;
          line-height: 16px;

          font-size: 12px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #ffffff;
        }
      }
    }

    .list {
      padding: 0 10px;
      overflow-y: auto;
      width: 320px;
      height: calc(100% - 138px);

      .list-item {
        width: 100%;
        height: 70px;
        cursor: pointer;
        border-radius: 10px 10px 10px 10px;
        padding: 10px;
        display: flex;
        margin-bottom: 10px;

        .left {
          display: flex;
          align-items: center;
          margin-right: 8px;
          position: relative;
          p {
            width: 48px;
            height: 48px;
            text-align: center;
            line-height: 48px;
            border-radius: 50%;
            background-color: #ccc;
            color: #fff;
            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          }

          img {
            width: 48px;
            height: 48px;

            object-fit: cover;
          }

          .online {
            display: block;
            width: 12px;
            height: 12px;

            border: 1px solid #ffffff;
            border-radius: 50%;
            position: absolute;
            right: 0;
            bottom: 0;
          }
        }
        .right {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3px 10px 12px 0;

          .top {
            width: 192px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            & span:first-child {
              font-size: 16px;
              font-family: Source Han Sans CN-Regular, Source Han Sans CN;
              font-weight: 400;
              color: #333333;
              line-height: 23px;
              width: 100px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              vertical-align: baseline;
            }

            & span:last-child {
              font-size: 12px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #666666;
              line-height: 20px;
            }
          }
          .bottom {
            width: 192px;
            display: flex;

            justify-content: space-between;
            & span:first-child {
              font-size: 12px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #999999;
              line-height: 17px;
              width: 160px;
              overflow: hidden;

              white-space: nowrap;

              text-overflow: ellipsis;

              vertical-align: baseline;
            }

            & span:last-child {
              display: block;
              border-radius: 20px;
              text-align: center;
              padding: 4px;
              height: 16px;
              background: #ff0000;
              font-size: 12px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #ffffff;
              line-height: 9px;
            }
          }
        }
      }

      .list-item-active {
        background: #f7f8fa;

        .left {
          background: #f7f8fa;
        }
        .right {
          background: #f7f8fa;
          .top {
            background: #f7f8fa;
          }
          .bottom {
            background: #f7f8fa;
          }
        }
      }
    }

    .list::-webkit-scrollbar {
      width: 6px;
    }

    .list::-webkit-scrollbar-thumb {
      background: #dddddd;
      border-radius: 10px;
    }

    .list::-webkit-scrollbar-track {
      background: transparent;
    }

    .no-chat {
      width: 100%;
      display: flex;
      justify-content: center;
      div {
        margin-top: 82px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        img {
          width: 130px;
          height: 100px;

          object-fit: cover;
        }

        p {
          margin-top: 20px;
          font-size: 12px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #999999;
        }
      }
    }
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    margin-right: 10px;
    border-radius: 10px;
    position: relative;

    .user-nav {
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;

      position: relative;
      .nav-no-chat {
        font-size: 16px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #333333;
      }
      .alert-more {
        width: 120px;
        height: 120px;
        background: #ffffff;
        display: block;
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
        border-radius: 10px 10px 10px 10px;
        padding: 10px;
        position: absolute;
        right: 10px;
        top: 48px;
        p {
          width: 100px;
          height: 30px;
          cursor: pointer;
          border-radius: 4px 4px 4px 4px;
          padding-left: 5px;
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
          line-height: 20px;
          img {
            width: 14px;
            height: 14px;
            margin-right: 10px;
          }
        }

        p:hover {
          background: rgba(79, 170, 116, 0.1);
        }
      }

      div {
        display: flex;
        align-items: center;
        img {
          margin-right: 10px;
          width: 40px;
          height: 40px;
        }

        .avator {
          width: 40px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          margin-right: 10px;
          border-radius: 50%;
          color: #fff;
          background-color: #ccc;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        }
      }
      img {
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
    }

    .user-chat {
      height: calc(100% - 276px);
      background-color: #f9fafc;
      width: 100%;
      padding: 0 18px 0 20px;
      overflow-y: auto;
      .loadingMessage {
        margin: 10px 0;
        p {
          text-align: center;
          cursor: pointer;
          font-size: 13px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 500;
          color: #333333;

          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 16px;
            height: 16px;
            margin-right: 4px;
            animation: spin 1s linear infinite;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      }

      .chat-list {
        width: 100%;
        .time {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
          height: 20px;

          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
          line-height: 20px;
        }

        .visitor {
          display: flex;
          margin: 20px 0 20px 0;
          max-width: 306px;
          img {
            width: 36px;
            height: 36px;
            margin-right: 10px;
          }

          .avator {
            width: 36px;
            height: 36px;
            margin-right: 10px;
            text-align: center;
            line-height: 36px;
            border-radius: 50%;
            background-color: #ccc;
            color: #fff;
          }
          div {
            padding-top: 10px;
            & p:first-child {
              span {
                display: block;
              }
              max-width: 260px;
              background: #4faa74;
              border-radius: 0px 8px 8px 8px;
              padding: 10px;
              margin-bottom: 5px;
              & span:first-child {
                font-size: 14px;
                font-family: Source Han Sans CN-Normal, Source Han Sans CN;
                font-weight: 350;
                color: #ffffff;
                word-wrap: break-word;
                line-height: 20px;
              }

              & span:nth-child(2) {
                width: 100%;
                height: 1px;
                background-color: rgba(255, 255, 255, 0.1);
              }

              & span:last-child {
                font-size: 14px;
                font-family: Source Han Sans CN-Normal, Source Han Sans CN;
                font-weight: 350;
                color: #ffffff;
                line-height: 20px;
                word-wrap: break-word;
                padding-top: 10px;
              }
            }

            & p:last-child {
              font-size: 12px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #4faa74;
              cursor: pointer;
              line-height: 16px;
            }
          }

          .up-img {
            width: 160px;
            height: 160px;
            object-fit: cover;
            border-radius: 4px;

            cursor: pointer;
          }

          .up-file {
            cursor: pointer;
            margin-top: 10px;
            max-width: 306px;
            height: 56px;
            background: #4faa74;
            border-radius: 0px 8px 8px 8px;

            display: flex;
            align-items: center;
            padding: 10px;

            & p:first-child {
              min-width: 36px;
              height: 36px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;

              margin: 0;
              margin-right: 10px;
              img {
                width: 20px;
                height: 20px;

                object-fit: cover;
                margin: 0;
              }
            }

            & p:last-child {
              font-size: 14px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #ffffff;

              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
        .server {
          display: flex;
          justify-content: end;
          margin: 20px 0;

          .up-img {
            width: 160px;
            height: 160px;
            object-fit: cover;
            border-radius: 4px;
          }
          img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            margin-left: 10px;
          }

          .up-file {
            cursor: pointer;
            margin-top: 10px;
            max-width: 306px;
            height: 56px;
            background: #fff;
            border-radius: 0px 8px 8px 8px;

            display: flex;
            align-items: center;
            padding: 10px;

            & p:first-child {
              min-width: 36px;
              height: 36px;
              background: rgba(79, 170, 116, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;

              margin: 0;
              margin-right: 10px;
              img {
                width: 20px;
                height: 20px;

                object-fit: cover;
                margin: 0;
              }
            }

            & p:last-child {
              font-size: 14px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #333;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          .all {
            display: flex;
            align-items: end;
            padding-top: 10px;
            & p:first-child {
              font-size: 12px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #999999;
              line-height: 18px;

              margin-bottom: 22px;
            }
            .message {
              display: flex;
              flex-direction: column;
              align-items: end;

              & p:last-child {
                font-size: 12px;
                font-family: Source Han Sans CN-Normal, Source Han Sans CN;
                font-weight: 350;
                color: #4faa74;
                line-height: 18px;

                cursor: pointer;
              }

              & p:first-child {
                max-width: 260px;
                padding: 10px;
                background-color: #fff;
                border-radius: 8px 0px 8px 8px;
                margin: 0 0 5px 10px;

                font-size: 14px;
                font-family: Source Han Sans CN-Normal, Source Han Sans CN;
                font-weight: 350;
                color: #333333;
                line-height: 20px;
                word-wrap: break-word;

                span {
                  display: block;
                }
                & span:first-child {
                  max-width: 240px;

                  padding-bottom: 10px;
                }

                & span:nth-child(2) {
                  width: 100%;
                  height: 1px;
                  background-color: rgba(0, 0, 0, 0.1);
                }

                & span:last-child {
                  padding-top: 10px;
                }
              }
            }
          }
        }
        .invite-comments {
          margin: 20px 0;
          display: flex;
          justify-content: center;
          p {
            height: 28px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 4px 8px;

            font-size: 12px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #333333;
            line-height: 18px;
          }
        }
      }
    }
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background: #dddddd;
      border-radius: 10px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }
    .user-input {
      height: 216px;
      width: 100%;
      position: relative;
      border-radius: 10px 10px 10px 10px;
      .shortcut {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 42px;
        padding: 12px 10px 0 20px;
        position: relative;
        .function {
          img {
            width: 24px;
            height: 24px;
            margin-right: 20px;

            cursor: pointer;
          }
        }
        .common {
          width: 86px;
          height: 30px;
          background: #50aa74;
          border-radius: 6px 6px 6px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 12px;
          margin: 0;
          cursor: pointer;

          p {
            font-size: 14px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #ffffff;
            line-height: 20px;
          }
          img {
            width: 10px;
            height: 10px;
          }
        }
        .alert-common {
          position: absolute;
          width: 86px;
          max-height: 160px;
          background: #ffffff;
          box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
          border-radius: 10px 10px 10px 10px;
          top: 48px;
          right: 10px;
          z-index: 2;
          padding: 5px 6px;
          overflow-y: auto;
          overflow-x: hidden;
          p {
            width: 74px;

            border-radius: 10px 10px 10px 10px;
            padding: 4px 0 4px 10px;
            font-size: 12px;
            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
            font-weight: 400;
            color: #333333;

            line-height: 30px;
            cursor: pointer;
          }
          p:hover {
            background: rgba(79, 170, 116, 0.1);
          }
        }
      }

      .chat-main {
        height: 128px;
        width: 100%;
        .el-textarea {
          width: 100%;
          height: 100%;
          :deep(.el-textarea__inner) {
            box-shadow: none;
            border: none;
            outline: none;
            resize: none;
            padding-left: 20px;
          }

          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-thumb {
            background: #dddddd;
            border-radius: 10px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }
        }
      }
      .dispatch {
        position: absolute;
        width: 78px;
        height: 36px;
        background: #4faa74;
        border-radius: 8px 8px 8px 8px;
        bottom: 10px;
        right: 10px;
        display: flex;
        justify-content: space-between;
        margin: 0;
        padding: 8px 12px 8px 12px;

        cursor: pointer;
        p {
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #ffffff;
          line-height: 20px;
        }
        img {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .no-chat-userinfo {
    width: 300px;
    margin-right: 0px;
    padding: 10px 0 10px 10px;
    background-color: #fff;

    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      width: 100px;
      height: 100px;

      object-fit: cover;
      margin-top: 50px;
    }

    p {
      font-size: 16px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #333333;

      margin-top: 20px;
    }
  }
}
</style>
