<script setup lang="ts">
import { ref } from 'vue'
import {
  autoReply,
  setAutoReply,
  translate,
  setTranslate,
  translateConfig,
  delQuickReply,
  quickReply,
  setQuickReply,
} from '@renderer/api/config'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { SelectItem, TranslateParams } from './components/type'
import { useUserStore } from '@renderer/store/modules/user'
import { storeToRefs } from 'pinia'

const userStore = storeToRefs(useUserStore())

const configNavList = ref([
  {
    id: 1,
    name: '自动回复设置',
  },
  {
    id: 2,
    name: '快捷回复管理',
  },
  {
    id: 3,
    name: '翻译设置',
  },
])

const disabledFlag = ref(true)

const autoReplyJson = ref({
  s_type: 2,
  auto_reply_list: [
    {
      status: 2,
      reply_desc: '',
    },
    {
      status: 3,
      reply_desc: '',
    },
    {
      status: 1,
      reply_desc: '',
    },
  ],
})

const quickReplyList = ref()
const quickReplyParams = ref({
  id: null,
  project_id: userStore.projectId.value,
  phrases_desc: '',
  subset_name: '',
  way: null,
  subset_id: null,
})

const selectList = ref<SelectItem[]>([])

const translateParams = ref<TranslateParams>({
  to_kefu_translate: '',
  to_visitor_translate: '',
  translate_status: false,
})

const activeNavIndex = ref(1)
const title = ref('')
const docs = ref('')

const handlePitchNav = async (id: number) => {
  activeNavIndex.value = id
}

const getAutoReply = async () => {
  const { data } = await autoReply()

  data.info === null
    ? (autoReplyJson.value.s_type = 1)
    : (autoReplyJson.value.s_type = 2)

  autoReplyJson.value.auto_reply_list = data.info.map(item => {
    const matchingItem = data.info.find(item1 => item1.status === item.status)

    if (matchingItem) {
      return {
        ...item,
        reply_desc: matchingItem.reply_desc,
      }
    }
    return item
  })
}

const getTranslateMap = async () => {
  const {
    data: { list },
  } = await translate()

  selectList.value = list
}

const getTranslateConfig = async () => {
  const {
    data: { info },
  } = await translateConfig(null)

  translateParams.value.to_kefu_translate = info.to_kefu_translate
  translateParams.value.to_visitor_translate = info.to_visitor_translate
  translateParams.value.translate_status =
    info.translate_status === 1 ? true : false
}

const getQuickReply = async () => {
  const { data } = await quickReply({
    page: 1,
    page_size: 9999,
    project_id: userStore.projectId.value,
  })

  quickReplyList.value = data.rows.reduce((groups, item) => {
    const { subset_name } = item

    if (!groups[subset_name]) {
      groups[subset_name] = []
    }

    groups[subset_name].push({ ...item, editShow: false, editFlag: false })

    return groups
  }, {})
}

getAutoReply()
getTranslateMap()
getTranslateConfig()
getQuickReply()

const saveEditAutoReply = async () => {
  try {
    await setAutoReply(autoReplyJson.value)

    ElMessage.success('修改成功')

    getAutoReply()

    disabledFlag.value = true
  } catch (_) {}
}

const changeTranslate = async () => {
  try {
    translateParams.value.translate_status = translateParams.value
      .translate_status
      ? 1
      : 2

    await setTranslate(translateParams.value)

    translateParams.value.translate_status =
      translateParams.value.translate_status === 1 ? true : false

    ElMessage.success('修改成功')
  } catch (_) {}
}

const addQuickReply = () => {
  try {
    if (
      !quickReplyParams.value.phrases_desc ||
      !quickReplyParams.value.subset_name
    ) {
      return ElMessage.error('请输入内容')
    }

    quickReplyParams.value.way = 1

    setQuickReply(quickReplyParams.value)

    resetQuickReplyParams()

    ElMessage.success('添加成功')

    setTimeout(() => {
      getQuickReply()
    }, 500)
  } catch (error) {
    console.log(error)
  }
}

const handleItemEdit = (item: any) => {
  Object.values(quickReplyList.value).forEach((item: any) => {
    item.forEach(item1 => {
      item1.editShow = false
    })
  })
  title.value = item.subset_name

  docs.value = item.phrases_desc

  item.editShow = !item.editShow
}

const resetQuickReplyParams = () => {
  quickReplyParams.value = {
    id: null,
    project_id: userStore.projectId.value,
    phrases_desc: '',
    subset_name: '',
    way: null,
    subset_id: null,
  }
}

const handleDelQuickReply = async (item, item1) => {
  try {
    await ElMessageBox.confirm('确定删除该条快捷回复吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    delQuickReply({
      id: item.id,
      subset_name: item.subset_name,
      set_type: item1.lenght === 1 ? 2 : 1,
    })

    ElMessage.success('删除成功')

    setTimeout(() => {
      getQuickReply()
    }, 500)
  } catch (error) {
    ElMessage.warning('取消删除')
  }
}

const handleEditQuickReply = async item => {
  try {
    if (!title.value || !docs.value) {
      return ElMessage.error('请输入内容')
    }

    await setQuickReply({
      id: item.id,
      project_id: item.value,
      phrases_desc: docs.value,
      subset_name: title.value,
      way: 2,
      subset_id: item.subset_id,
    })

    ElMessage.success('修改成功')

    setTimeout(() => {
      getQuickReply()
    }, 500)
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div class="config">
    <div class="config-nav">
      <p
        v-for="item in configNavList"
        :key="item.id"
        :class="{ active: activeNavIndex === item.id }"
        @click="handlePitchNav(item.id)"
      >
        {{ item.name }}
      </p>
    </div>
    <div class="config-main">
      <div class="automatic-reply" v-if="activeNavIndex === 1">
        <div class="item">
          <p>#当客服忙碌时</p>
          <el-input
            type="textarea"
            placeholder="输入内容"
            style="width: 380px"
            :rows="5"
            maxlength="30"
            v-model="autoReplyJson.auto_reply_list[2].reply_desc"
            @input="disabledFlag = false"
          ></el-input>
        </div>
        <div class="item">
          <p>#当客服离线时</p>
          <el-input
            type="textarea"
            placeholder="输入内容"
            style="width: 380px"
            :rows="5"
            maxlength="30"
            v-model="autoReplyJson.auto_reply_list[1].reply_desc"
            @input="disabledFlag = false"
          ></el-input>
        </div>
        <div class="item">
          <p>#当客户接入时</p>

          <el-input
            type="textarea"
            placeholder="输入内容"
            style="width: 380px"
            :rows="5"
            maxlength="30"
            v-model="autoReplyJson.auto_reply_list[0].reply_desc"
            @input="disabledFlag = false"
          ></el-input>
        </div>

        <el-button @click="saveEditAutoReply" :disabled="disabledFlag"
          >保存修改</el-button
        >
      </div>
      <div class="quick-reply" v-else-if="activeNavIndex === 2">
        <div class="title">添加快捷回复</div>

        <div class="content">
          <div>
            <p>快捷回复内容</p>
            <el-input
              type="textarea"
              placeholder="输入内容"
              style="width: 380px"
              :rows="5"
              maxlength="30"
              v-model="quickReplyParams.phrases_desc"
            ></el-input>
          </div>
          <div>
            <!-- <p>快捷方式</p> -->
            <p>快捷分组</p>
            <p>
              <el-input
                placeholder="输入内容"
                style="width: 380px"
                v-model="quickReplyParams.subset_name"
              >
                <!-- <template #prefix>
									<span>#</span>
								</template> -->
              </el-input>

              <el-button @click="addQuickReply">添加快捷回复</el-button>
            </p>
            <!-- <span>要在聊天时使用快捷回复，请输入<i>#</i>和<i>快捷方式</i></span> -->
            <!-- <span>要在聊天时使用快捷回复，请输入<i>#</i>和<i>快捷方式</i></span> -->
          </div>
        </div>

        <div class="manage">
          <p>快捷回复管理</p>
          <div class="manage-main">
            <div
              v-for="item in quickReplyList"
              :key="item.title"
              class="manage-item"
            >
              <!-- <p>#{{ item[0].subset_name }}</p> -->
              <p>&nbsp; {{ item[0].subset_name }}</p>
              <div
                v-for="item1 in item"
                :key="item1.id"
                style="margin-bottom: 8px"
                @mouseenter="item1.editFlag = true"
                @mouseleave="item1.editFlag = false"
              >
                <el-input
                  style="width: 380px"
                  :value="item1.phrases_desc"
                  disabled
                ></el-input>
                <span class="edit" v-if="item1.editFlag">
                  <i v-if="!item1.editShow" @click="handleItemEdit(item1)"
                    >编辑</i
                  >
                  <i v-else @click="item1.editShow = false">取消</i>
                  <i @click="handleDelQuickReply(item1, item)">删除</i>
                </span>

                <div v-if="item1.editShow" class="edit-main">
                  <div>
                    <el-input
                      placeholder="输入内容"
                      style="width: 380px"
                      v-model="title"
                    >
                      <template #prefix>
                        <span>#</span>
                      </template>
                    </el-input>

                    <el-button @click="handleEditQuickReply(item1)"
                      >保存修改</el-button
                    >
                  </div>

                  <el-input
                    type="textarea"
                    placeholder="输入内容"
                    style="width: 380px"
                    :rows="5"
                    maxlength="30"
                    v-model="docs"
                  ></el-input>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="translate" v-else>
        <p>
          <span>是否开启自动翻译</span>
          <el-switch
            style="--el-switch-on-color: #13ce66"
            v-model="translateParams.translate_status"
            @change="changeTranslate"
          />
        </p>
        <p>
          <span>对访客显示</span>
          <el-select
            placeholder="请选择"
            v-model="translateParams.to_visitor_translate"
            @change="changeTranslate"
          >
            <el-option
              v-for="item in selectList"
              :key="item.english"
              :label="item.translate_name"
              :value="item.translate_key"
            />
          </el-select>
        </p>
        <p>
          <span>对客服显示</span>
          <el-select
            placeholder="请选择"
            v-model="translateParams.to_kefu_translate"
            @change="changeTranslate"
          >
            <el-option
              v-for="item in selectList"
              :key="item.english"
              :label="item.translate_name"
              :value="item.translate_key"
            />
          </el-select>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.config {
  padding: 10px;
  height: calc(100% - 60px);
  overflow: hidden;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  max-width: 100%;

  .config-nav {
    width: 170px;
    height: 100%;
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    margin-right: 10px;
    padding: 10px;
    p {
      width: 150px;
      height: 36px;

      border-radius: 10px 10px 10px 10px;
      font-size: 14px;
      font-family: Source Han Sans CN-Normal, Source Han Sans CN;
      font-weight: 350;
      color: #333333;
      padding-left: 10px;
      line-height: 36px;
      margin-bottom: 4px;

      cursor: pointer;
    }
    .active {
      background: #4faa74;
      color: #ffffff;
    }

    p:hover:not(.active) {
      background-color: rgba(79, 170, 116, 0.1);
    }
  }

  .config-main {
    width: calc(100% - 180px);
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    padding: 20px;

    .automatic-reply {
      .item {
        margin-top: 30px;
        p {
          margin-bottom: 10px;
          font-size: 14px;
          font-family: Source Han Sans CN-Medium, Source Han Sans CN;
          font-weight: 500;
          color: #333333;
        }
        .el-textarea {
          width: 100%;
          height: 100%;
          :deep(.el-textarea__inner) {
            box-shadow: none;
            resize: none;
            padding-left: 10px;
            border-radius: 8px;
            background-color: #f2f3f6;
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

      & .item:first-child {
        margin-top: 0px;
      }

      .el-button {
        font-size: 14px;
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #ffffff;
        width: 140px;
        height: 40px;
        background: #4faa74;
        border-radius: 8px 8px 8px 8px;
        margin-top: 100px;
      }
    }

    .quick-reply {
      .title {
        font-size: 16px;
        font-family: Source Han Sans CN-Medium, Source Han Sans CN;
        font-weight: 500;
        color: #333333;

        margin-bottom: 30px;
      }

      .content {
        margin-bottom: 40px;
        div {
          p {
            font-size: 14px;
            font-family: Source Han Sans CN-Medium, Source Han Sans CN;
            font-weight: 500;
            color: #333333;
          }
        }
        & div:first-child {
          margin-bottom: 30px;
          .el-textarea {
            width: 100%;
            height: 100%;
            :deep(.el-textarea__inner) {
              box-shadow: none;
              resize: none;
              padding-left: 10px;
              border-radius: 8px;
              background-color: #f2f3f6;
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
          p {
            margin-bottom: 10px;
          }
        }

        & div:last-child {
          & p:first-child {
            margin-bottom: 18px;
          }

          & p:nth-child(2) {
            display: flex;
            align-items: center;

            .el-input {
              margin: 0 10px 5px 0;
            }
          }

          & span:last-child {
            font-size: 14px;
            font-family: Source Han Sans CN-Medium;
            font-weight: 350;
            color: #999999;
            i {
              color: #333333;
              font-weight: 500;
            }
          }

          .el-button {
            width: 120px;
            height: 40px;
            background: #4faa74;
            border-radius: 8px 8px 8px 8px;
            font-size: 14px;
            font-family: Source Han Sans CN-Normal, Source Han Sans CN;
            font-weight: 350;
            color: #ffffff;
          }

          :deep(.el-input__wrapper) {
            width: 380px;
            height: 40px;
            background: #f2f3f6;
            border-radius: 8px 8px 8px 8px;
            box-shadow: none;
          }
        }
      }

      .manage {
        width: 520px;
        overflow-y: auto;
        height: 360px;
        & p:first-child {
          font-size: 16px;
          font-family: Source Han Sans CN-Medium, Source Han Sans CN;
          font-weight: 500;
          color: #333333;
          margin-bottom: 20px;
        }

        .manage-main {
          .manage-item {
            margin-bottom: 20px;
            & p:first-child {
              margin-bottom: 10px;
              font-size: 14px;
              font-family: Source Han Sans CN-Medium, Source Han Sans CN;
              font-weight: 500;
              color: #4faa74;
            }

            :deep(.el-input__wrapper) {
              font-size: 14px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #333333;
              box-shadow: none;

              height: 40px;
              background: #f2f3f6;
              border-radius: 8px 8px 8px 8px;
            }
            .edit {
              font-size: 14px;
              font-family: Source Han Sans CN-Normal, Source Han Sans CN;
              font-weight: 350;
              color: #333333;
              margin-left: 10px;
              & i:first-child {
                display: inline-block;
                width: 34px;
                border-right: 1px solid #000;
                cursor: pointer;
              }

              & i:last-child {
                display: inline-block;
                margin-left: 6px;
                cursor: pointer;
              }
            }

            .edit-main {
              padding-top: 10px;
              & div:first-child {
                display: flex;
                align-items: center;
                :deep(.el-input__wrapper) {
                  border: 1px solid #f2f3f6;
                  background-color: #fff;
                }
                .el-button {
                  width: 80px;
                  height: 40px;
                  background: #4faa74;
                  border-radius: 8px 8px 8px 8px;

                  font-size: 14px;
                  font-family: Source Han Sans CN-Normal, Source Han Sans CN;
                  font-weight: 350;
                  color: #ffffff;

                  margin-left: 20px;
                }
              }
              .el-textarea {
                width: 100%;
                height: 100%;
                :deep(.el-textarea__inner) {
                  box-shadow: none;
                  resize: none;
                  padding-left: 10px;
                  border-radius: 8px;
                  border: 1px solid #f2f3f6;
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

                margin-top: 6px;
              }
            }
          }
        }
      }

      .manage::-webkit-scrollbar {
        width: 6px;
      }

      .manage::-webkit-scrollbar-thumb {
        background: #dddddd;
        border-radius: 10px;
      }

      .manage::-webkit-scrollbar-track {
        background: transparent;
      }
    }

    .translate {
      width: 248px;
      p {
        font-size: 14px;
        font-family: Source Han Sans CN-Medium, Source Han Sans CN;
        font-weight: 500;
        color: #333333;

        :deep(.el-input__wrapper) {
          width: 120px;
          height: 32px;
          background: #f2f3f6;
          border-radius: 168px 168px 168px 168px;
          box-shadow: none;
        }
      }

      & p:first-child {
        margin-bottom: 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        :deep(.el-switch__core) {
          margin-right: 6px;
        }
      }

      & p:nth-child(2),
      & p:last-child {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}
</style>
