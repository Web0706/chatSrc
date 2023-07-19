<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { AddOrder, Dictionary } from './type'
import { useUserStore } from '@renderer/store/modules/user'
import { addOrder, orderType } from '@renderer/api/order'
import { getVisitorList, upload } from '@renderer/api/chat'

const userStore = useUserStore()

defineProps<{
  addDialogVisible: Boolean
  orderPriorityList: Dictionary[]
  projectServiceList: any[]
}>()

const emit = defineEmits(['update:addDialogVisible'])

const params = ref<AddOrder>({
  desc: null, // 工单描述
  images: null, // 图片数组
  kefu_id: null, // 客服 ID
  priority: null, // 优先级
  project_id: userStore.projectId, // 项目 ID
  reckon_time: null, // 预计完成时间
  title: null, // 工单标题
  visitor_id: null, // 访客 ID
  work_status: null, // 工单种类
})

const ruleFormRef = ref<FormInstance>()
const rules = ref<FormRules>({
  title: [
    {
      required: true,
      message: '请输入工单标题',
      trigger: 'blur',
    },
  ],
  desc: [
    {
      required: true,
      message: '请输入工单描述',
      trigger: 'blur',
    },
  ],
  project_id: [
    {
      required: true,
      message: '请选择所属项目',
      trigger: 'change',
    },
  ],
  work_status: [
    {
      required: true,
      message: '请选择工单种类',
      trigger: 'change',
    },
  ],
  reckon_time: [
    {
      required: true,
      message: '请选择完成时间',
      trigger: 'change',
    },
  ],
})

const orderTypeList = ref([])

const visitorList = ref([])

const imgs = ref([])

const getSelectList = async () => {
  const { data } = await orderType()
  orderTypeList.value = data.rows

  const {
    data: {
      list: { rows },
    },
  } = await getVisitorList({
    project_id: userStore.projectId,
    page: 1,
    page_size: 9999,
  })

  visitorList.value = rows
}

getSelectList()
const submit = async () => {
  await ruleFormRef.value.validate()

  params.value.images = imgs.value

  await addOrder(params.value)

  handleClose()
}

const handleClose = () => {
  reset()

  emit('update:addDialogVisible', false)
}

const handleUpImg = async (e: any) => {
  const file = e.target.files[0]

  const formDate = new FormData()

  formDate.append('file', file)

  const {
    data: {
      file_info: { file_url },
    },
  } = await upload(formDate)

  ;(document.querySelector('#up-img') as HTMLInputElement).value = null

  const obj = {
    image: file_url,
  }

  if (imgs.value.find(item => item.image === file_url))
    return ElMessage.warning('不能上传重复的图片')

  imgs.value.push(obj)
}

const delImg = index => {
  imgs.value.splice(index, 1)
}

const reset = () => {
  ruleFormRef.value.resetFields()
  imgs.value = []

  params.value = {
    desc: null, // 工单描述
    images: null, // 图片数组
    kefu_id: null, // 客服 ID
    priority: null, // 优先级
    project_id: userStore.projectId, // 项目 ID
    reckon_time: null, // 预计完成时间
    title: null, // 工单标题
    visitor_id: null, // 访客 ID
    work_status: null, // 工单种类
  }
}
</script>

<template>
  <el-dialog
    :model-value="addDialogVisible"
    title="新增工单"
    width="440px"
    :before-close="handleClose"
    style="--el-dialog-padding-primary: 20px"
    class="add-dialog"
  >
    <el-form
      label-width="122px"
      label-position="left"
      ref="ruleFormRef"
      :model="params"
      :rules="rules"
    >
      <el-form-item label="标题：" prop="title">
        <el-input
          placeholder="请输入工单标题（10字以内）"
          style="width: 220px"
          v-model="params.title"
        ></el-input>
      </el-form-item>

      <el-form-item label="工单描述：" prop="desc">
        <el-input
          type="textarea"
          placeholder="请输入问题描述（30字以内）"
          style="width: 220px"
          :rows="4"
          maxlength="30"
          v-model="params.desc"
        ></el-input>
      </el-form-item>

      <el-form-item label="所属项目：" prop="project_id">
        <el-input
          style="width: 220px"
          v-model="params.project_id"
          :value="
            userStore.userInfo.user_project.find(
              item => item.id === userStore.projectId
            ).proj_nane
          "
          :disabled="true"
        ></el-input>
      </el-form-item>

      <el-form-item label="工单种类：" prop="work_status">
        <el-select class="select" v-model="params.work_status">
          <el-option
            v-for="item in orderTypeList"
            :key="item.id"
            :label="item.wd_nane"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="所属访客：">
        <el-select
          placeholder="请选择所属访客"
          class="select"
          v-model="params.visitor_id"
        >
          <el-option
            v-for="item in visitorList"
            :key="item.id"
            :label="item.visitor_name === '' ? item.name : item.visitor_name"
            :value="item.visitor_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="指派受理人：">
        <el-select
          placeholder="请选择受理人"
          class="select"
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

      <el-form-item label="优先级：">
        <el-select class="select" v-model="params.priority">
          <el-option
            v-for="item in orderPriorityList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="预计完成时间：" prop="reckon_time">
        <el-date-picker
          id="time"
          placeholder="请选择完成时间"
          v-model="params.reckon_time"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="添加图片：" style="position: relative">
        <div class="show-img">
          <img
            v-for="(item, index) in imgs"
            :key="index"
            :src="item.image"
            alt=""
            @click="delImg(index)"
          />
        </div>

        <label for="up-img" v-if="imgs.length !== 3">
          <img
            src="@renderer/assets/img/chat/upload.png"
            alt=""
            class="upload"
          />
        </label>
        <span class="tip">(最多添加3张图片)</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button
          @click="submit"
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
        >
          保存
        </el-button>
      </span>
    </template>

    <input
      type="file"
      style="display: none"
      id="up-img"
      @change="handleUpImg"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
.add-dialog {
  .el-form {
    .el-form-item {
      :deep(.el-form-item__label) {
        font-size: 14px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #000;
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

      .tip {
        position: absolute;
        left: -110px;
        top: 26px;
        font-size: 12px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #999999;
        line-height: 17px;
      }

      :deep(.el-input__inner) {
        font-size: 14px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
      }

      .select {
        :deep(.el-input__wrapper) {
          width: 220px;
          height: 36px;
          background: #ffffff;
          border-radius: 8px 8px 8px 8px;
        }
      }

      .upload {
        width: 100px;
        height: 100px;
        object-fit: cover;
        cursor: pointer;
      }

      .show-img {
        img {
          width: 100px;
          height: 100px;
          border-radius: 8px;

          object-fit: cover;
          margin-right: 20px;
          cursor: pointer;
        }
      }
    }
  }

  .dialog-footer {
    display: block;
    text-align: center;
    position: absolute;
    bottom: 30px;
    left: 150px;
  }
}
</style>
