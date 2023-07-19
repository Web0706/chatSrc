<script setup lang="ts">
import { ref, computed, watch, onActivated } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import ElTable from '@renderer/components/ElTable/index.vue'
import Pager from '@renderer/components/Pager/index.vue'
import UserDetails from '@renderer/components/UserDetails/index.vue'
import { onLineVisitorSearchList } from '@renderer/utils/dictionary'
import type { OnLineQuery, SelectItem } from './components/type'
import {
  visitorList,
  followStatusList,
  labelList,
  componentList,
  editVisitorInfo,
  onlineVisitorCount,
} from '@renderer/api/onlineVisitor'
import { projectService } from '@renderer/api/chat'
import { useUserStore } from '@renderer/store/modules/user'
import { storeToRefs } from 'pinia'
import { nextTick } from 'process'
import router from '@renderer/router'
import { ElMessage } from 'element-plus'

const userStore = storeToRefs(useUserStore())

// 导航列表
const navList = ref([
  {
    id: 1,
    name: '在线访客',
    num: 7,
  },
  {
    id: 2,
    name: '在线客户',
    num: 15,
  },
  {
    id: 3,
    name: '客户库',
    num: 2,
  },
])
const activeIndex = ref(1)

// list
const clientList = ref([])

const select = ref({
  // 跟进状态
  followStatus: [],
  // 标签
  label: [],
  // 组件
  component: [],
})

// 弹框
const loading = ref(false)
const dialogSearch = ref(false)
const title = ref('')
const onlineVisible = ref(false)
const visitorBelongStatus = ref(false)

// 个人信息抽屉
const drawer = ref(false)

// 搜索框value
const queryCondition = ref('')
const userDetails = ref()

const onlineCount = ref({
  client_lib: '客户库',
  client_lib_count: 6,
  on_line_customer: '在线客户',
  on_line_customer_count: 5,
  on_line_visitor: '在线访客',
  on_line_visitor_count: 126,
})

const selectNode = ref<SelectItem>({} as SelectItem)
// 图标旋转
const iconTransform = ref(0)
const rotationStyle = computed(() => ({
  transform: `rotate(${iconTransform.value}deg)`,
}))

let timer: ReturnType<typeof setTimeout> | null = null
const handleIconTransform = () => {
  iconTransform.value += 360

  if (timer !== null) {
    clearTimeout(timer)
  }

  timer = setTimeout(() => {
    getVisitorList()
    getOnlineVisitorCount()
  }, 1000)
}

const query = ref<OnLineQuery>({
  page: 1,
  page_size: 10,
  email: '',
  feacebook: '',
  follow_status: '',
  labels_id: '',
  lib: 0,
  name: '',
  phone: '',
  status: 1,
  kf_name: '',
  twitter: '',
  weixin: '',
  widget_chan_id: '',
  online_visitors: 1,
})

const total = ref(0)
const params = ref({
  set_type: null,
  visitor_id: null,
  labels_ids: null,
  secret: null,
  follow_status: null,
})

const getVisitorList = async () => {
  const { data } = await visitorList(query.value)

  total.value = data.total_rows
  clientList.value = data.rows
}

const getOnlineVisitorCount = async () => {
  const {
    data: { info },
  } = await onlineVisitorCount(userStore.projectId.value)

  onlineCount.value = info
}

getOnlineVisitorCount()

const getSelectList = async () => {
  const query = {
    page: 1,
    page_sizep: 9999,
  }

  try {
    const [{ data }, { data: data1 }, { data: data2 }] = await Promise.all([
      componentList({ ...query, project_id: userStore.projectId.value }),
      labelList(),
      followStatusList(),
    ])

    select.value = {
      component: [{ id: '', name: '全部' }, ...data.rows],
      label: [{ id: '', labels_name: '全部' }, ...data1.rows],
      followStatus: [{ id: '', status_name: '全部' }, ...data2.rows],
    }
  } catch (_) {}
}

getVisitorList()
getSelectList()

const changeNav = (id: number) => {
  activeIndex.value = id

  loading.value = true

  resetQuery()

  getVisitorList()

  getOnlineVisitorCount()

  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handlePageChange = ({ type, value }) => {
  query.value[type] = value
  getVisitorList()
}

const addTagList = ref([])
const projectKefuList = ref([])
const searchName = ref('')
const addstatusList = ref([])
const statusValue = ref('')

const setAttribution = async (value: string) => {
  title.value = value

  if (value === '修改标签') {
    addTagList.value = select.value.label.filter(item => item.id !== '')

    resetSelectTagList()

    params.value.set_type = 1
    params.value.visitor_id = selectNode.value.id
    params.value.labels_ids = selectNode.value?.tags_list
      ?.map(item => item.id)
      .join(',')
  } else if (value === '修改跟进状态') {
    const { data } = await followStatusList()

    addstatusList.value = data.rows

    params.value.set_type = 3
    params.value.visitor_id = selectNode.value.id
    statusValue.value = selectNode.value.follow_name
  } else {
    const { data } = await projectService({
      project_id: selectNode.value.project_id,
    })

    projectKefuList.value = data.rows

    params.value.set_type = 2
    params.value.visitor_id = selectNode.value.id
  }

  onlineVisible.value = true
}

const resetSelectTagList = () => {
  addTagList.value = addTagList.value.filter(item => {
    return !selectNode.value?.tags_list?.find(
      item1 => item1.labels_name === item.labels_name
    )
  })
}

const handleTagSelectChange = value => {
  selectNode.value.tags_list.push({
    id: value.id,
    labels_name: value.labels_name,
    color_value: '#ccc',
  })

  resetSelectTagList()

  params.value.labels_ids += `,${value.id}`
}

const delTags = id => {
  selectNode.value.tags_list = selectNode.value.tags_list.filter(
    itme => itme.id !== id
  )

  addTagList.value = [
    ...addTagList.value,
    select.value.label.find(item => item.id === id),
  ]

  params.value.labels_ids = selectNode.value.tags_list
    .map(item => item.id)
    .join(',')
}

const handleDialogClose = () => {
  visitorBelongStatus.value = false
  onlineVisible.value = false

  params.value = {
    set_type: null,
    visitor_id: null,
    labels_ids: null,
    secret: null,
    follow_status: null,
  }
}

const handleBlue = () => {
  setTimeout(() => {
    dialogSearch.value = false
  }, 200)
}

const handledialogSearch = ({ value }) => {
  if (!queryCondition.value) return ElMessage.warning('请输入要搜索的内容')

  query.value.name = null
  query.value.kf_name = null
  query.value.weixin = null
  query.value.email = null
  query.value.feacebook = null
  query.value.twitter = null

  query.value[value] = queryCondition.value
  getVisitorList()
}

const resetQuery = () => {
  if (activeIndex.value === 1) {
    query.value.lib = 0
    query.value.status = 1
    query.value.online_visitors = 1
  } else if (activeIndex.value === 2) {
    query.value.lib = 1
    query.value.status = 1
    query.value.online_visitors = null
  } else {
    query.value.lib = 1
    query.value.status = null
    query.value.online_visitors = null
  }
}
const reset = () => {
  query.value = {
    page: 1,
    page_size: 10,
    email: '',
    feacebook: '',
    follow_status: '',
    labels_id: '',
    lib: null,
    name: '',
    phone: '',
    status: null,
    kf_name: '',
    twitter: '',
    weixin: '',
    widget_chan_id: '',
    online_visitors: null,
  }
  resetQuery()
  getVisitorList()
  queryCondition.value = ''
}

const selectionChange = (node: any) => {
  try {
    if (!node.tags_list) node.tags_list = []

    selectNode.value = node
  } catch (_) {}
}

const submit = async () => {
  await editVisitorInfo(params.value)

  handleDialogClose()
  getVisitorList()
}

const searchCustomService = async () => {
  const { data } = await projectService({
    name: searchName.value,
    project_id: selectNode.value.project_id,
  })

  projectKefuList.value = data.rows
}

const selectCustomService = (kefuItem: any) => {
  console.log(kefuItem)

  visitorBelongStatus.value = false
  params.value.secret = kefuItem.secret

  selectNode.value.kf_name = kefuItem.user_name
}

const handleStatusChange = item => {
  statusValue.value = item.status_name

  params.value.follow_status = item.id
}

const lookUserDetail = (node: SelectItem) => {
  drawer.value = true
  nextTick(() => {
    userDetails.value.getVisitorInfo(node.visitor_id)
  })
}

const goToChat = (node: SelectItem) => {
  useUserStore().changeActive(2)
  router.push({
    path: '/chat',
    query: {
      id: node.visitor_id,
    },
  })
}

watch(
  () => onlineVisible.value,
  () => {
    if (!onlineVisible.value && title.value === '修改标签') {
      getVisitorList()
    }

    // if (onlineVisible.value && title.value === '修改标签') {
    // selectNode.value.tags_list = clientList.value.find(
    //   item => (item.visitor_id = selectNode.value.visitor_id)
    // ).tags_list
    // }
  }
)

watch(
  () => drawer.value,
  () => {
    getVisitorList()
    getOnlineVisitorCount()
  }
)

onActivated(() => {
  getVisitorList()
  getOnlineVisitorCount()
})
</script>

<template>
  <div class="online-visitors">
    <div class="online-left-nav">
      <p
        v-for="item in navList"
        :key="item.id"
        :class="{ active: activeIndex === item.id }"
        @click="changeNav(item.id)"
      >
        <span>{{ item.name }}</span>
        <span>{{
          `
        (
        ${
          item.name === '在线访客'
            ? onlineCount.on_line_visitor_count
            : item.name === '客户库'
            ? onlineCount.client_lib_count
            : onlineCount.on_line_customer_count
        } )`
        }}</span>
      </p>
    </div>
    <div class="online-right-main">
      <div class="online-top-search">
        <div>
          <p>
            <span>客户标签：</span>
            <el-select v-model="query.labels_id" @change="getVisitorList">
              <el-option
                v-for="item in select.label"
                :key="item.id"
                :label="item.labels_name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
          <p>
            <span>跟进状态：</span>
            <el-select v-model="query.follow_status" @change="getVisitorList">
              <el-option
                v-for="item in select.followStatus"
                :key="item.id"
                :label="item.status_name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>

          <p>
            <span>来源渠道：</span>
            <el-select v-model="query.widget_chan_id" @change="getVisitorList">
              <el-option
                v-for="item in select.component"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
        </div>
      </div>

      <div class="operate">
        <div class="button">
          <el-button
            @click="setAttribution('修改标签')"
            :disabled="!selectNode?.id"
            >修改标签</el-button
          >
          <el-button
            @click="setAttribution('设置访客归属')"
            :disabled="!selectNode?.id"
            >设置访客归属</el-button
          >
          <el-button
            @click="setAttribution('修改跟进状态')"
            :disabled="!selectNode?.id"
            >修改跟进状态</el-button
          >
        </div>
        <div>
          <div class="right-search">
            <el-input
              placeholder="请搜索"
              style="width: 360px"
              v-model="queryCondition"
              @focus="dialogSearch = true"
              @blur="handleBlue"
            >
              <template #prefix>
                <img src="@renderer/assets/img/chat/search.png" alt="" />
              </template>
            </el-input>

            <el-button
              style="
                font-size: 14px;
                font-family: Source Han Sans CN-Normal, Source Han Sans CN;
                font-weight: 350;
                color: #4faa74;
                width: 75px;
                height: 36px;
                border-radius: 8px;
                margin-left: 15px;
                border: 1px solid #4faa74;
              "
              @click="reset"
            >
              重置
            </el-button>

            <div class="dialog-search" v-show="dialogSearch">
              <div
                :class="{ item: true }"
                v-for="item in onLineVisitorSearchList"
                :key="item.id"
                @click="handledialogSearch(item)"
              >
                <p>
                  <img src="@renderer/assets/img/chat/search.png" alt="" />
                  <span>{{ item.label }}</span>
                </p>
                <p>包含</p>
                <p>{{ queryCondition }}</p>
              </div>
            </div>
          </div>

          <p @click="handleIconTransform" class="one">
            <Refresh class="icon" :style="rotationStyle" />
          </p>
        </div>
      </div>

      <ElTable
        class="online-table"
        v-loading="loading"
        element-loading-background="#fff"
        @current-change="selectionChange"
        :list="clientList"
      >
        <el-table-column width="14px" />

        <el-table-column label="客户昵称" min-width="133px">
          <template #default="{ row }">
            <div class="table-item" @click="lookUserDetail(row)">
              <img
                src="https://tupian.qqw21.com/article/UploadPic/2020-4/20204262140831973.jpg"
                alt=""
                class="img"
              />
              {{ row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="project_name"
          label="所属项目"
          min-width="128px"
        />
        <el-table-column
          prop="widget_chan_name"
          label="来源渠道"
          min-width="134px"
        />
        <el-table-column label="客户标签" min-width="242px ">
          <template #default="{ row: { tags_list } }">
            <div class="tag">
              <p
                v-for="item in tags_list"
                :key="item.id"
                class="tag-item"
                :style="{ backgroundColor: item.color_value }"
              >
                {{ item.labels_name }}
              </p>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="kf_name" label="客户归属" min-width="128px" />
        <el-table-column
          prop="follow_name"
          label="跟进状态"
          min-width="128px"
        />
        <el-table-column prop="serve_sum" label="接待次数" min-width="128px" />
        <el-table-column prop="enterprise" label="客户公司" min-width="152px" />
        <el-table-column prop="phone" label="手机号" min-width="152px" />
        <el-table-column prop="weixin" label="微信号" min-width="152px" />
        <el-table-column prop="email" label="邮箱" min-width="241px" />
        <el-table-column prop="feacebook" label="Facebook" min-width="134px" />
        <el-table-column prop="twitter" label="Twitter" min-width="120px" />
        <el-table-column prop="status" label="状态" min-width="104px" />
        <el-table-column prop="remark" label="备注" min-width="126px" />
        <el-table-column fixed="right" label="操作" width="88px" align="center">
          <template #default="{ row }">
            <p class="text" @click="goToChat(row)">发起会话</p>
          </template>
        </el-table-column>
      </ElTable>

      <div
        style="
          display: flex;
          justify-content: end;
          height: 46px;
          align-items: center;
          margin-top: 10px;
        "
      >
        <Pager :total="total" @change="handlePageChange" />
      </div>
    </div>
    <el-dialog
      v-model="onlineVisible"
      :title="title"
      width="600px"
      class="online-dialog"
      :before-close="handleDialogClose"
    >
      <div class="online-dialog-main">
        <p class="line"></p>

        <div class="belong" v-if="title === '设置访客归属'">
          <span>访客归属：</span>
          <div class="belong-main" style="background-color: #f9fafc">
            <div
              @click="visitorBelongStatus = !visitorBelongStatus"
              class="box"
            >
              <p>{{ selectNode.kf_name }}</p>
              <p class="img">
                <img
                  src="@renderer/assets/img/chat/xia.webp"
                  alt=""
                  :class="{ rotate: visitorBelongStatus }"
                />
              </p>
            </div>

            <div class="alert-ascription" v-if="visitorBelongStatus">
              <el-input
                placeholder="请输入客服名称"
                @input="searchCustomService"
                v-model="searchName"
              >
                <template #prefix>
                  <img src="@renderer/assets/img/chat/search.png" alt="" />
                </template>
              </el-input>

              <div class="custom-service">
                <p
                  v-for="item in projectKefuList"
                  :key="item.id"
                  @click="selectCustomService(item)"
                >
                  <img src="@renderer/assets/layout/touxiang.webp" alt="" />

                  <span>{{ item.user_name }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="follow-up" v-else-if="title === '修改跟进状态'">
          <span>跟进状态：</span>

          <el-select style="width: 280px" :model-value="statusValue">
            <el-option
              v-for="item in addstatusList"
              :key="item.id"
              :label="item.status_name"
              :value="item.id"
              @click="handleStatusChange(item)"
            />
          </el-select>
        </div>

        <div class="tag" v-else>
          <p>修改标签：</p>
          <div class="tag-main">
            <span
              :style="{ backgroundColor: item.color_value }"
              v-for="item in selectNode.tags_list"
              :key="item.id"
            >
              {{ item.labels_name }}
              <img
                src="@renderer/assets/layout/off.webp"
                alt=""
                @click="delTags(item.id)"
              />
            </span>
          </div>

          <div class="tag-footer">
            <p>
              <span>添加标签：</span>
              <el-select placeholder="请选择标签">
                <el-option
                  v-for="item in addTagList"
                  :key="item.id"
                  :label="item.labels_name"
                  :value="item.labels_name"
                  @click="handleTagSelectChange(item)"
                >
                </el-option>
              </el-select>
            </p>
            <p>
              <span @click="submit">保存</span>
            </p>
          </div>
        </div>
      </div>

      <template #footer v-if="title !== '修改标签'">
        <div class="dialog-footer">
          <p>取消</p>
          <p @click="submit">确认</p>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="drawer"
      :with-header="false"
      style="--el-drawer-padding-primary: 10px"
    >
      <UserDetails :id="selectNode.visitor_id" ref="userDetails" />
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.online-visitors {
  padding: 10px;

  height: calc(100% - 60px);
  overflow: hidden;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  max-width: 100%;
  .online-left-nav {
    width: 170px;
    height: 100%;
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    margin-right: 10px;
    padding: 10px;
    p {
      width: 150px;
      height: 36px;
      background: #ffffff;
      border-radius: 10px 10px 10px 10px;
      line-height: 36px;
      padding-left: 10px;
      font-size: 14px;
      font-family: Source Han Sans CN-Normal, Source Han Sans CN;
      font-weight: 350;
      color: #333333;
      cursor: pointer;

      margin-bottom: 4px;
      & span:last-child {
        margin-left: 2px;
      }
    }
    p:hover:not(.active) {
      background-color: rgba(79, 170, 116, 0.1);
    }
    .active {
      color: #ffffff;
      border-radius: 10px 10px 10px 10px;

      background: #4faa74;
    }
  }
  .online-right-main {
    width: calc(100% - 180px);
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    padding: 16px 20px 0 20px;

    .online-top-search {
      display: flex;
      justify-content: space-between;
      align-items: center;

      div {
        display: flex;
        p {
          margin-left: 40px;
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
          display: flex;
          align-items: center;
        }

        & p:first-child {
          margin-left: 0;
        }
        :deep(.el-input__wrapper) {
          width: 160px;
          height: 36px;
          background: #f6f7fa;
          border-radius: 8px 8px 8px 8px;
          box-shadow: none;
        }

        :deep(.el-input__inner::placeholder) {
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #999999;
        }
      }
    }

    .operate {
      display: flex;
      justify-content: space-between;
      margin: 20px 0 20px 0;
      & div:first-child {
        display: flex;
      }

      & div:last-child {
        display: flex;
        p {
          cursor: pointer;
        }
        .one {
          margin-left: 16px;
          width: 36px;
          height: 36px;
          background: #4faa74;
          border-radius: 8px 8px 8px 8px;
          padding: 10px;
          .icon {
            color: #fff;
            width: 16px;
            height: 16px;
            transition: transform 1.2s;
          }
        }

        .right-search {
          position: relative;
          .dialog-search {
            position: absolute;
            display: block;
            top: 42px;
            left: 0;
            width: 350px;
            background: #ffffff;
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            z-index: 10;
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
                align-items: center;
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

                margin: 0 4px 0 50px;
              }

              & p:last-child {
                text-align: right;
                width: 130px;
                font-size: 14px;
                font-family: Source Han Sans CN-Medium, Source Han Sans CN;
                font-weight: 500;
                color: #4faa74;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin: 0;
              }
            }

            .item:hover {
              background-color: rgba(79, 170, 116, 0.2);
              & p:first-child {
                color: #4faa74;
              }
            }
          }

          :deep(.el-input__wrapper) {
            height: 36px;
            background: #f6f7fa;
            border-radius: 8px;
            box-shadow: none;

            img {
              width: 16px;
              height: 16px;
            }
          }

          :deep(.el-input__inner::placeholder) {
            font-size: 14px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #999999;
          }
        }
      }

      .button {
        .el-button {
          width: 100px;
          height: 36px;
          background: #4faa74;
          border-radius: 8px 8px 8px 8px;
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #ffffff;
        }
      }
    }

    .online-table {
      max-width: 100%;
      height: 580px;

      .tag {
        width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .tag-item {
          height: 26px;
          border-radius: 20px 20px 20px 20px;
          color: #fff;
          padding: 4px 14px;
          margin: 4px 10px 4px 0;
          line-height: 20px;
        }

        & .tag-item:last-child {
          margin-right: 0;
        }
      }
      .text {
        font-size: 12px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #1887ff;
        cursor: pointer;
      }

      .table-item {
        display: flex;
        align-items: center;
        color: #1887ff;
        cursor: pointer;
        .img {
          width: 24px;
          height: 24px;
          object-fit: cover;
          border-radius: 50%;
          margin-right: 4px;
        }
      }

      :deep(.el-checkbox__inner) {
        border-radius: 0;
        border: 1px solid #999999;
      }
    }
  }

  .online-dialog {
    .online-dialog-main {
      position: relative;
      .line {
        width: 560px;
        height: 1px;
        background-color: #eeeeee;
        position: absolute;
        top: -30px;
      }

      .belong {
        display: flex;
        align-items: center;
        span {
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
        }

        .belong-main {
          position: relative;
          .box {
            width: 280px;
            height: 36px;
            border: 1px solid #4faa74;
            border-radius: 8px 8px 8px 8px;

            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            cursor: pointer;
            margin-left: 10px;
            & p:first-child {
              font-size: var(--fs-14);
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #333333;
            }

            .img {
              img {
                width: 14px;
                height: 14px;
                margin-left: 6px;
                transition: transform 0.2s ease;
              }
            }
          }

          .alert-ascription {
            top: 42px;
            left: 8px;
            position: absolute;
            width: 280px;
            height: 330px;
            background: #ffffff;
            box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px 4px 4px 4px;
            padding: 10px;
            display: block;
            overflow: hidden;

            .el-input__prefix-inner {
              img {
                width: 16px;
                height: 16px;
              }
            }

            :deep(.el-input__wrapper) {
              background-color: #f1f3f5;
              border-radius: 20px 20px 20px 20px;
              width: 246px;
              height: 36px;
              margin-left: 8px;
            }
            :deep(.el-input__inner::placeholder) {
              font-size: var(--fs-12);
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #999999;
              line-height: 18px;
            }

            .custom-service {
              overflow-y: auto;
              height: 280px;
              padding: 12px;

              &::-webkit-scrollbar {
                width: 6px;
              }

              &::-webkit-scrollbar-thumb {
                background: #dddddd;
                border-radius: 10px;
              }

              &::-webkit-scrollbar-track {
                background: transparent;
              }

              p {
                width: 100%;
                height: 46px;

                border-radius: 4px 4px 4px 4px;
                display: flex;
                align-items: center;
                padding-left: 10px;
                cursor: pointer;
                span {
                  color: #333;
                }
                img {
                  width: 28px;
                  height: 28px;
                  margin-right: 10px;
                }

                &:hover {
                  background: RGBA(79, 170, 116, 0.3);
                }
              }
            }
          }
        }
        .alert-ascription {
          top: 42px;
          left: 8px;
          position: absolute;
          width: 280px;
          height: 330px;
          background: #ffffff;
          box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
          border-radius: 4px 4px 4px 4px;
          padding: 10px;
          display: block;
          overflow: hidden;

          .el-input__prefix-inner {
            img {
              width: 16px;
              height: 16px;
            }
          }

          :deep(.el-input__wrapper) {
            background-color: #f1f3f5;
            border-radius: 20px 20px 20px 20px;
            width: 246px;
            height: 36px;
            margin-left: 8px;
          }
          :deep(.el-input__inner::placeholder) {
            font-size: var(--fs-12);
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #999999;
            line-height: 18px;
          }

          .custom-service {
            overflow-y: auto;
            height: 280px;
            padding: 12px;

            &::-webkit-scrollbar {
              width: 6px;
            }

            &::-webkit-scrollbar-thumb {
              background: #dddddd;
              border-radius: 10px;
            }

            &::-webkit-scrollbar-track {
              background: transparent;
            }

            p {
              width: 100%;
              height: 46px;

              border-radius: 4px 4px 4px 4px;
              display: flex;
              align-items: center;
              padding-left: 10px;
              cursor: pointer;
              span {
                color: #333;
              }
              img {
                width: 28px;
                height: 28px;
                margin-right: 10px;
              }

              &:hover {
                background: rgba(79, 170, 116, 0.3);
              }
            }
          }
        }
      }

      .follow-up {
        span {
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
          margin-right: 10px;
        }

        :deep(.el-input__wrapper) {
          box-shadow: 0 0 0 1px #249681;
        }
      }

      .tag {
        & p:first-child {
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
          line-height: 20px;
          margin-bottom: 10px;
        }

        .tag-main {
          width: 560px;
          height: 160px;
          background: #f7f7f7;
          border-radius: 8px 8px 8px 8px;
          padding: 10px;

          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          span {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 80px;
            height: 24px;
            background: #1ac230;
            border-radius: 20px 20px 20px 20px;

            font-size: 12px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #ffffff;
            padding: 0 10px 0 10px;
            margin-right: 8px;
            img {
              width: 8px;
              height: 8px;
              cursor: pointer;
            }
          }
        }
        :deep(.el-input__wrapper) {
          width: 190px;
          height: 36px;
          background: #f6f7fa;
          border-radius: 8px 8px 8px 8px;
          box-shadow: none;
        }

        :deep(.el-input__inner::placeholder) {
          font-size: 12px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
        }

        .tag-footer {
          display: flex;
          justify-content: space-between;
          & p:last-child {
            display: flex;
            margin-left: 80px;
            span {
              font-size: 14px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #ffffff;

              width: 100px;
              height: 36px;
              background: #4faa74;
              border-radius: 8px;
              text-align: center;
              line-height: 36px;
              cursor: pointer;
            }
          }
        }
      }
    }
    .dialog-footer {
      display: flex;
      justify-content: end;
      p {
        width: 100px;
        height: 36px;
        border-radius: 8px 8px 8px 8px;

        border: 1px solid #999999;
        text-align: center;
        line-height: 36px;
        font-size: 14px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        margin-left: 20px;
        cursor: pointer;
        color: #999999;
      }
      & p:last-child {
        background: #4faa74;
        color: #ffffff;
      }
    }
  }

  :deep(.el-drawer) {
    height: calc(100% - 50px) !important;
    margin-top: 50px;
    width: 320px !important;
    border-radius: 12px 0 0 12px;
  }
}
</style>
