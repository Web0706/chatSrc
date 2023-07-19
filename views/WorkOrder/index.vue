<script setup lang="ts">
import { ref, watch, onActivated } from 'vue'
import ElTable from '@renderer/components/ElTable/index.vue'
import Pager from '@renderer/components/Pager/index.vue'
import AppendOrder from './components/AppendOrder.vue'
import OrderDetails from './components/OrderDetails.vue'
import OrderOverView from './components/OrderOverView.vue'
import { orderStatusMap, orderSearchList } from '@renderer/utils/dictionary'
import { projectService } from '@renderer/api/chat'
import { useUserStore } from '@renderer/store/modules/user'
import { useChatStore } from '@renderer/store/modules/chat'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import type {
  Orderquery,
  OrderParams,
  WorkOrderNode,
  Count,
} from './components/type'
import {
  orderList,
  orderPriority,
  editOrder,
  orderCount,
} from '@renderer/api/order'

const userStore = storeToRefs(useUserStore())

//  左侧导航index
const activeIndex = ref(1)

// 分页
const total = ref(0)
const loading = ref<any>(false)
const title = ref('')

const rejectNavTab = ref('only') // 工单大厅导航
const rebutTab = ref('me') // 被驳回工单导航

const addDialogVisible = ref(false) //新建工单弹窗
const detailsDialogVisible = ref(false) // 工单详情弹窗
const orderDialog = ref(false) // 工单弹窗
const dialogSearch = ref(false) // 搜索弹窗
const fillingDescription = ref(true) // 是否填写描述

const orderPriorityList = ref([]) // 工单优先级
const projectServiceList = ref([]) // 项目客服列表

const node = ref<WorkOrderNode>() // 选中节点

const navList = ref([
  {
    id: 1,
    title: '需要我处理的',
  },
  {
    id: 2,
    title: '我已经处理的',
  },
  {
    id: 3,
    title: '被驳回工单',
  },
  {
    id: 4,
    title: '工单大厅',
  },
  {
    id: 5,
    title: '工单数据总览',
  },
])

const list = ref([])

const query = ref<Orderquery>({
  delay_days: null, // 延期天数
  desc: null, // 工单描述
  is_own: 1, // 是否查自己 1查自己 不查自己就不传
  kefu_name: null, // 受理人
  own_reject: null, // 被驳回工单 1表示查询被驳回订单
  page: 1, // 页码
  page_size: 10, // 页条数
  priority: null, // 优先级 1.普通 2 一般 3紧急 4 非常紧急
  project_id: userStore.projectId.value, // 项目id
  project_name: null, // 项目名称
  status: 2, // 1:待处理 2:处理中 3:已处理 4:已驳回
  title: null, // 工单标题
  visitor_name: null, // 访客名称
})

const queryCondition = ref('')

const params = ref<OrderParams>({
  id: null,
  is_active: null,
  result_desc: null,
  status: null,
  kefu_id: null,
})

const details = ref()
const count = ref<Count>({} as Count)

// 获取工单列表
const getOrderList = async () => {
  const { data } = await orderList(query.value)

  list.value = data.rows
  total.value = data.total_rows
}

getOrderList()

const getSelectList = async () => {
  const { data } = await orderPriority()
  orderPriorityList.value = data

  const { data: data1 } = await projectService({
    project_id: userStore.projectId.value,
    page: 1,
    page_size: 9999,
  })
  projectServiceList.value = data1.rows
}

getSelectList()

// 获取工单数量统计
const getOrderCount = async () => {
  const {
    data: { info },
  } = await orderCount(userStore.projectId.value)
  count.value = info
  useChatStore().setWorkOrder(info.processing_count)
}

getOrderCount()

// 左侧导航点击事件
const handleActiveIndex = (index: number) => {
  if (activeIndex.value === index) {
    loading.value = false
  } else {
    handleLoading()

    setTimeout(() => {
      activeIndex.value = index
    }, 300)
  }

  resetPage(index)
}

const handlePageChange = ({ type, value }) => {
  query.value[type] = value

  getOrderList()
}

// 搜索框失焦
const handleBlue = () => {
  setTimeout(() => {
    dialogSearch.value = false
  }, 200)
}

const handledialogSearch = ({ value }) => {
  query.value.title = null
  query.value.desc = null
  query.value.project_name = null
  query.value.visitor_name = null
  query.value.kefu_name = null
  query.value.delay_days = null

  if (!queryCondition.value) return ElMessage.warning('请输入要搜索的内容')

  query.value[value] = queryCondition.value

  getOrderList()
}

const resetPage = (index: number) => {
  console.log(index)

  queryCondition.value = ''
  query.value.priority = null

  if (index === 1 || index === 2) {
    query.value.is_own = 1
  } else {
    query.value.is_own = null
  }

  switch (index) {
    case 1:
      query.value.status = 2
      break
    case 2:
      query.value.status = 3
      break
    case 3:
      rebutTab.value = 'me'
      query.value.own_reject = null
      query.value.status = 4
      query.value.is_own = 1
      break
    case 4:
      rejectNavTab.value = 'only'
      query.value.status = 1
      break
  }
}

const reset = () => {
  query.value = {
    delay_days: null, // 延期天数
    desc: null, // 工单描述
    is_own: 1, // 是否查自己 1查自己 不查自己就不传
    kefu_name: null, // 受理人
    own_reject: null, // 被驳回工单 1表示查询被驳回订单
    page: 1, // 页码
    page_size: 10, // 页条数
    priority: null, // 优先级 1.普通 2 一般 3紧急 4 非常紧急
    project_id: userStore.projectId.value, // 项目id
    project_name: null, // 项目名称
    status: null, // 1:待处理 2:处理中 3:已处理 4:已驳回
    title: null, // 工单标题
    visitor_name: null, // 访客名称
  }
  resetPage(activeIndex.value)
  getOrderList()
}

// 工单大厅导航事件
const changeSalaOrderTab = (tab: string) => {
  tab === 'all' ? (query.value.status = null) : (query.value.status = 1)
  handleLoading()

  setTimeout(() => {
    rejectNavTab.value = tab
  }, 300)
}

// 被驳回工单导航事件
const handleRebut = (tab: string) => {
  tab === 'me'
    ? ((query.value.own_reject = null), (query.value.is_own = null))
    : ((query.value.own_reject = 1), (query.value.is_own = 1))

  handleLoading()
  setTimeout(() => {
    rebutTab.value = tab
  }, 300)
}

const orderReceiving = async (value: string, item: any) => {
  node.value = item
  title.value = value
  orderDialog.value = true

  if (value === '更换处理人') {
    projectServiceList.value = projectServiceList.value.filter(item => {
      return item.user_id !== node.value.kefu_id
    })
  }

  if (value === '接单成功通知') {
    params.value.id = item.id

    params.value.status = 2

    await editOrder(params.value)
    getOrderList()
    getOrderCount()
  }
}

//  loading 函数
const handleLoading = () => {
  loading.value = true

  setTimeout(() => {
    getOrderList()
    loading.value = false
  }, 500)
}

const submit = async () => {
  params.value.id = node.value.id

  switch (title.value) {
    case '处理工单':
      try {
        if (!fillingDescription.value) params.value.result_desc = null

        if (!params.value.result_desc)
          return ElMessage.warning('请填写处理结果')

        if (!params.value.status) return ElMessage.warning('请选择工单状态')

        await editOrder(params.value)
        ElMessage.success('修改工单状态成功')
      } catch (error) {
        ElMessage.error('修改失败')
      }

      break

    case '驳回工单':
      try {
        if (!params.value.result_desc) {
          return ElMessage.warning('请填写驳回原因')
        }

        params.value.status = 4

        await editOrder(params.value)

        ElMessage.success('驳回成功')
      } catch (error) {
        ElMessage.error('驳回失败')
      }
      break

    case '更换处理人':
      try {
        params.value.is_active = 1
        if (!params.value.kefu_id) {
          return ElMessage.warning('请选择处理人')
        }

        await await editOrder(params.value)
        ElMessage.success('更换处理人成功')
      } catch (error) {
        ElMessage.error('更换处理人失败')
      }
      break

    default:
      break
  }

  handleClose()
  getOrderList()
  getOrderCount()
}

const lookDetails = item => {
  detailsDialogVisible.value = true

  details.value.getOrderDetail(item.id)
}

const handleClose = () => {
  orderDialog.value = false
  params.value = {
    id: null,
    is_active: null,
    result_desc: null,
    status: null,
    kefu_id: null,
  }
}

watch(addDialogVisible, () => {
  if (addDialogVisible.value === false) {
    getOrderList()
    getOrderCount()
  }
})

onActivated(() => {
  getOrderList()
  getOrderCount()
  getSelectList()
})
</script>

<template>
  <div class="work-order">
    <div class="left-nav">
      <p
        v-for="item in navList"
        :key="item.id"
        :class="{ active: activeIndex === item.id }"
        @click="handleActiveIndex(item.id)"
      >
        <span>{{ item.title }}</span>
        <span v-if="item.title !== '工单数据总览'"
          >({{
            item.title === '需要我处理的'
              ? count.processing_count
              : item.title === '我已经处理的'
              ? count.processed_count
              : item.title === '工单大厅'
              ? count.count_num
              : count.rejected_count + count.creator_rejected_count
          }})</span
        >
      </p>
    </div>
    <div class="right-main" v-if="activeIndex !== 5">
      <div class="top-search">
        <div class="button">
          <el-button @click="addDialogVisible = true"> 新增工单 </el-button>
        </div>

        <div class="search">
          <p>
            <span>优先级： </span>
            <el-select
              v-model="query.priority"
              placeholder="请选择"
              @change="getOrderList"
            >
              <el-option
                v-for="item in orderPriorityList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
          <p>
            <el-input
              placeholder="请搜索"
              style="width: 350px"
              @focus="dialogSearch = true"
              @blur="handleBlue"
              v-model="queryCondition"
            >
              <template #prefix>
                <img src="@renderer/assets/img/chat/search.png" alt="" />
              </template>
            </el-input>
          </p>

          <p class="button" @click="reset">重置</p>

          <div class="dialog-search" v-show="dialogSearch">
            <div
              :class="{ item: true }"
              v-for="item in orderSearchList"
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
      </div>
      <div class="table-main">
        <div class="add-order">
          <div class="tab" v-if="activeIndex === 3 || activeIndex === 4">
            <div class="top">
              <!-- 被驳回工单 -->
              <div class="one" v-if="activeIndex === 3">
                <p :class="{ active: rebutTab === 'me' }">
                  <span @click="handleRebut('me')">我驳回的工单</span>

                  <span></span>
                </p>
                <p :class="{ active: rebutTab === 'he' }">
                  <span @click="handleRebut('he')">被驳回的工单</span>

                  <span></span>
                </p>
              </div>

              <!-- 工单大厅 -->
              <div class="two" v-if="activeIndex === 4">
                <p :class="{ active: rejectNavTab === 'only' }">
                  <span @click="changeSalaOrderTab('only')"
                    >仅查看待接单数据</span
                  >

                  <span></span>
                </p>
                <p :class="{ active: rejectNavTab === 'all' }">
                  <span @click="changeSalaOrderTab('all')"
                    >查看所有工单数据</span
                  >

                  <span></span>
                </p>
              </div>
            </div>
            <p class="line"></p>
          </div>
        </div>

        <ElTable
          :list="list"
          class="order-table"
          v-loading="loading"
          element-loading-background="#FFF"
        >
          <el-table-column fixed label="标题" min-width="150px">
            <template #default="{ row }">
              <span
                style="color: #1887ff; cursor: pointer"
                @click="lookDetails(row)"
                >{{ row.title }}</span
              >
            </template>
          </el-table-column>

          <el-table-column
            prop="work_status_name"
            label="工单类型"
            min-width="128px"
          />

          <el-table-column prop="priority" label="优先级" min-width="138px">
            <template #default="{ row }">
              {{
                orderPriorityList.find(item => item.id === row.priority)?.name
              }}
            </template>
          </el-table-column>

          <el-table-column prop="desc" label="工单描述" min-width="128px" />

          <el-table-column
            prop="reckon_time"
            label="预计处理完成时间"
            min-width="176px"
          />

          <el-table-column
            prop="reality_time"
            label="实际处理完成时间"
            min-width="176px"
            v-if="
              activeIndex === 2 || (activeIndex === 4 && rejectNavTab === 'all')
            "
          />

          <el-table-column
            prop="work_status_name"
            label="处理结果描述"
            min-width="152px"
            v-if="
              activeIndex === 2 || (activeIndex === 4 && rejectNavTab === 'all')
            "
          />

          <el-table-column
            prop="delay_days"
            label="延期天数"
            min-width="128px"
          />

          <el-table-column
            prop="project_name"
            label="所属项目"
            min-width="128px"
          />

          <el-table-column
            prop="visitor_name"
            label="所属访客"
            min-width="128px"
          />

          <el-table-column prop="kefu_name" label="处理人" min-width="116px" />

          <el-table-column
            prop="creator_name"
            label="创建人"
            min-width="116px"
          />

          <el-table-column
            prop="created_at"
            label="创建时间"
            min-width="135px"
          />

          <el-table-column
            prop="status"
            label="工单状态"
            min-width="128px"
            v-if="activeIndex !== 4"
          >
            <template #default="{ row }">
              <span>{{ orderStatusMap[row.status] }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="f"
            label="驳回原因"
            min-width="128px"
            v-if="activeIndex === 3"
          />

          <el-table-column
            fixed="right"
            prop="i"
            label="操作"
            min-width="188px"
            align="center"
            v-if="activeIndex === 1"
          >
            <template #default="{ row }">
              <div class="manipulate">
                <span @click="orderReceiving('处理工单', row)">处理</span>
                <span
                  style="margin: 0 20px"
                  @click="orderReceiving('驳回工单', row)"
                  >驳回</span
                >
                <span @click="orderReceiving('更换处理人', row)"
                  >更换处理人</span
                >
              </div>
            </template>
          </el-table-column>

          <el-table-column
            fixed="right"
            prop="i"
            label="操作"
            min-width="190px"
            align="center"
            v-if="activeIndex === 4"
          >
            <template #default="{ row }">
              <div class="manipulate" v-if="row.status === 2">
                <span @click="orderReceiving('处理工单', row)">处理</span>

                <span
                  @click="orderReceiving('驳回工单', row)"
                  style="margin: 0 20px"
                  >驳回</span
                >
                <span @click="orderReceiving('更换处理人', row)"
                  >更换处理人</span
                >
              </div>

              <div v-else-if="row.status === 3 || row.status === 4"></div>

              <div class="manipulate" v-else>
                <span @click="orderReceiving('接单成功通知', row)">接单</span>
                <span
                  style="margin: 0 20px"
                  @click="orderReceiving('更换处理人', row)"
                  >指派</span
                >
                <span @click="orderReceiving('驳回工单', row)">驳回</span>
              </div>
            </template>
          </el-table-column>
        </ElTable>
      </div>
      <div
        style="
          display: flex;
          justify-content: end;
          height: 54px;
          align-items: center;
          padding-right: 20px;
        "
      >
        <Pager :total="total" @change="handlePageChange" />
      </div>
    </div>

    <OrderOverView
      :projectServiceList="projectServiceList"
      v-show="activeIndex === 5"
    />

    <AppendOrder
      v-model:add-dialog-visible="addDialogVisible"
      :orderPriorityList="orderPriorityList"
      :projectServiceList="projectServiceList"
    />

    <OrderDetails
      v-model:details-dialog-visible="detailsDialogVisible"
      ref="details"
    />

    <el-dialog
      v-model="orderDialog"
      :title="title"
      width="460px"
      class="order-dialog"
      :before-close="handleClose"
    >
      <div class="dialog-main">
        <div class="line"></div>

        <div class="main">
          <p class="success" v-if="title === '接单成功通知'">
            您已成功接单，【标题】的预计处理完成时间为【预计处理完成时间】，请您在“需要我处理的”模块中查看及处理！
          </p>

          <el-form
            label-width="82px"
            label-position="left"
            v-else-if="
              title === '指派处理人' ||
              title === '更换处理人' ||
              title === '驳回工单'
            "
          >
            <el-form-item
              label="选择人员："
              v-if="title === '更换处理人' || title === '指派处理人'"
            >
              <el-select
                placeholder="请选择人员"
                style="width: 100%"
                v-model="params.kefu_id"
              >
                <el-option
                  v-for="item in projectServiceList"
                  :key="item.user_id"
                  :label="item.user_name"
                  :value="item.user_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="备注："
              v-if="title === '更换处理人' || title === '指派处理人'"
            >
              <el-input
                type="textarea"
                :rows="4"
                maxlength="50"
                placeholder="请输入备注"
                v-model="params.result_desc"
              ></el-input>
            </el-form-item>

            <el-form-item label="工单状态：" v-if="title === '驳回工单'">
              <el-input
                style="height: 36px"
                value="已驳回"
                :disabled="true"
              ></el-input>
            </el-form-item>

            <el-form-item label="驳回原因：" v-if="title === '驳回工单'">
              <el-input
                type="textarea"
                :rows="4"
                maxlength="50"
                placeholder="请输入驳回原因"
                v-model="params.result_desc"
              ></el-input>
            </el-form-item>
          </el-form>

          <div class="deal-with" v-else>
            <p>
              <span>是否将处理状态填充结果描述文本中</span>
              <el-switch
                v-model="fillingDescription"
                style="
                  --el-switch-on-color: #13ce66;
                  margin-bottom: 0;
                  position: absolute;
                  top: -4px;
                  right: 0;
                "
              />
            </p>
            <el-form
              label-width="110px"
              label-position="left"
              style="margin-top: 30px"
            >
              <el-form-item label="工单状态：">
                <el-select
                  style="
                    width: 314px;
                    height: 36px;
                    border-radius: 8px 8px 8px 8px;
                  "
                  v-model="params.status"
                >
                  <el-option
                    v-for="item in [
                      {
                        value: 2,
                        label: '处理中',
                      },
                      {
                        value: 3,
                        label: '已处理',
                      },
                      {
                        value: 4,
                        label: '已驳回',
                      },
                    ]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="处理结果描述：">
                <el-input
                  type="textarea"
                  :rows="4"
                  maxlength="50"
                  placeholder="请输入处理结果描述"
                  v-model="params.result_desc"
                ></el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer" v-if="title === '接单成功通知'">
          <el-button
            style="
              width: 140px;
              height: 40px;
              background: #4faa74;
              border-radius: 8px 8px 8px 8px;
              font-size: 14px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #ffffff;
            "
            @click="orderDialog = false"
          >
            我知道了
          </el-button>
        </span>

        <span class="dialog-footer" v-else>
          <el-button
            @click="orderDialog = false"
            style="
              width: 100px;
              height: 32px;
              border-radius: 8px 8px 8px 8px;
              border: 1px solid #4faa74;
              font-size: 12px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #4faa74;
              margin-left: 10px;
            "
            >取消</el-button
          >
          <el-button
            @click="submit"
            style="
              width: 100px;
              height: 32px;
              background: #4faa74;
              border-radius: 8px 8px 8px 8px;
              font-size: 12px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #ffffff;
            "
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.work-order {
  height: calc(100% - 60px);
  overflow: hidden;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  max-width: 100%;
  .left-nav {
    width: 170px;
    height: 100%;
    border-radius: 10px 10px 10px 10px;
    background: #ffffff;
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

  .right-main {
    width: calc(100% - 180px);
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    .top-search {
      width: 1170px;
      height: 72px;
      display: flex;
      justify-content: space-between;
      padding: 16px 12px 0 20px;
      margin: 0;
      .search {
        display: flex;
        position: relative;

        .dialog-search {
          position: absolute;
          right: 86px;
          top: 42px;

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

              margin: 0 4px 0 60px;
            }

            & p:last-child {
              text-align: right;
              flex: 1;
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

        p {
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
          line-height: 20px;
        }

        & p:nth-child(2) {
          margin: 0 10px;
        }

        .button {
          width: 75px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #4faa74;

          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #4faa74;
          line-height: 36px;
          text-align: center;
          cursor: pointer;
        }

        :deep(.el-input__wrapper) {
          width: 180px;
          height: 36px;
          background: #f6f7fa;
          border-radius: 8px 8px 8px 8px;
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

      .button {
        .el-button {
          width: 80px;
          height: 36px;
          background: #4faa74;
          border-radius: 8px;

          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #ffffff;
        }
      }
    }

    .table-main {
      width: 100%;
      padding: 0 20px;
      .tab {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        .line {
          width: 100%;
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px 2px 2px 2px;
          margin-top: -2px;
        }
        .top {
          .one,
          .two {
            display: flex;
            p {
              cursor: pointer;
              margin-right: 30px;
              display: flex;
              flex-direction: column;

              font-size: 14px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #333333;
            }

            .active {
              font-family: Source Han Sans CN-Medium, Source Han Sans CN;
              font-weight: 500;
              color: #4faa74;
              & span:last-child {
                margin-top: 4px;
                display: block;
                width: 100%;
                height: 2px;
                background: #4faa74;
                border-radius: 2px 2px 2px 2px;
              }
            }
          }
        }
      }
      .order-table {
        height: 580px;
        max-width: 100%;
        margin-top: 20px;

        .manipulate {
          span {
            font-size: 12px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #1887ff;
            line-height: 17px;
            cursor: pointer;
          }
        }
      }
    }

    .pandect-table {
      max-width: 100%;
      padding: 0 20px;
    }
  }

  .order-dialog {
    .dialog-main {
      position: relative;
      .line {
        width: 420px;
        height: 1px;
        background-color: #eee;
        position: absolute;
        top: -30px;
      }
      .main {
        .success {
          width: 420px;
          height: 40px;
          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #ff9a52;
          line-height: 20px;
          text-align: center;
        }

        .el-form {
          :deep(.el-form-item__label) {
            font-size: 14px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #000;
          }

          .el-form-item {
            align-items: center;
            margin-bottom: 10px;
            .select {
              width: 338px;
              height: 36px;
              background: #ffffff;
              border-radius: 8px 8px 8px 8px;
              border: 1px solid #dddddd;
              padding: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              cursor: pointer;
              img {
                width: 16px;
                height: 16px;
              }
            }

            .el-textarea {
              width: 100%;
              height: 100%;

              :deep(.el-textarea__inner) {
                box-shadow: none;
                resize: none;
                padding-left: 10px;
                border: 1px solid #dddddd;
                border-radius: 8px;
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
        }

        .deal-with {
          & p:first-child {
            font-size: 14px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #333333;

            height: 20px;
            display: flex;
            align-items: center;
          }
        }
      }
    }
    .dialog-footer {
      display: block;
      text-align: center;
    }
  }
}
</style>
