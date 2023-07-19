<script setup lang="ts">
import { ref } from 'vue'
import { projectService, setTransfer, getTransfer } from '@renderer/api/chat'
import { useUserStore } from '@renderer/store/modules/user'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const userStore = storeToRefs(useUserStore())

const dialogVisible = ref(false)
const ascriptionStatus = ref(false)
const searchName = ref('')
const projectKefuList = ref([])
const visitorId = ref('')
const attributionName = ref(userStore.userInfo.value.name)

const transferList = ref([])

const params = ref({
	kefu_id: null,
	project_id: userStore.projectId.value,
	desc: '',
	status: 1,
	visitor_id: '',
})

const getTransferList = async (id: string) => {
	try {
		visitorId.value = id

		const {
			data: { rows },
		} = await getTransfer({
			project_id: userStore.projectId.value,
			visitor_id: id,
			status: 1,
			page: 1,
		})

		transferList.value = rows
	} catch (error) {
		console.log(error)
	}
}

const handleascriptionStatus = () => {
	ascriptionStatus.value = !ascriptionStatus.value
}

const searchCustomService = async () => {
	try {
		const { data } = await projectService({
			name: searchName.value,
			project_id: userStore.projectId.value,
			page_size: 9999,
		})

		projectKefuList.value = data.rows.filter(
			item => item.user_id !== userStore.userInfo.value.id,
		)
	} catch (error) {
		console.log(error)
	}
}

searchCustomService()

const selectCustomService = async (kefuItem: any) => {
	attributionName.value = kefuItem.user_name

	params.value.visitor_id = visitorId.value
	params.value.kefu_id = kefuItem.secret

	ascriptionStatus.value = false
}

const submit = async () => {
	try {
		const res = await setTransfer(params.value)

		dialogVisible.value = false
		ascriptionStatus.value = false

		ElMessage.success(res.msg)

		location.reload()
	} catch (error) {
		console.log(error)
	}
}

defineExpose({
	dialogVisible,
	getTransferList,
})
</script>

<template>
	<el-dialog
		v-model="dialogVisible"
		title="会话转移"
		width="336"
		:before-close="
			() => {
				ascriptionStatus = false
				dialogVisible = false
			}
		"
		class="session-transfer"
	>
		<div class="nav">
			<p class="active">
				<span>客服</span>
				<span></span>
			</p>
		</div>
		<div class="single">
			<el-form>
				<el-form-item label="转接人：" style="position: relative">
					<div
						@click="handleascriptionStatus"
						style="background-color: #f9fafc"
					>
						<p>客户归属</p>
						<p>
							<span>{{ attributionName }}</span>
							<img src="@renderer/assets/img/chat/xia.webp" alt="" />
						</p>
					</div>

					<div class="alert-ascription" v-if="ascriptionStatus">
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
							<div
								v-for="item in projectKefuList"
								:key="item.id"
								@click="selectCustomService(item)"
								class="item"
							>
								<img src="@renderer/assets/layout/touxiang.webp" alt="" />

								<span>{{ item.user_name }}</span>
							</div>
						</div>
					</div>
				</el-form-item>

				<el-form-item label="历史转接人：">
					<div class="history">
						<div v-if="transferList.length" class="item">
							<p v-for="item in transferList" :key="item.id">
								{{ item.old_kefu_name }}
							</p>
						</div>
						<p v-else class="no">当前暂无历史转接</p>
					</div>
				</el-form-item>

				<el-form-item label="简要概括： ">
					<el-input
						type="textarea"
						:rows="4"
						placeholder="请输入问题描述（200字以内）"
						maxlength="200"
						v-model="params.desc"
					/>
				</el-form-item>
			</el-form>
		</div>

		<template #footer>
			<div style="text-align: center">
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
						line-height: 20px;
					"
				>
					保存
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<style scoped lang="scss">
.session-transfer {
	.nav {
		display: flex;
		margin-bottom: 20px;
		p {
			font-size: 16px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #999999;
			line-height: 24px;
			margin-right: 26px;
			display: flex;
			flex-direction: column;

			cursor: pointer;
			& span:last-child {
				width: 32px;
				height: 2px;
				background: #4faa74;
				border-radius: 8px 8px 8px 8px;
				opacity: 0;
			}
		}

		.active {
			font-size: 16px;
			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			font-weight: 500;
			color: #333333;
			line-height: 24px;
			& span:last-child {
				opacity: 1;
			}
		}
	}

	.single {
		.el-form-item {
			display: block;
			:deep(.el-form-item__label) {
				font-size: 14px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 350;
				color: #333;
				line-height: 20px;
			}
			.el-form-item__content {
				div {
					margin-top: 10px;
					width: 296px;
					height: 36px;
					border-radius: 8px 8px 8px 8px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 8px 10px;
					cursor: pointer;

					& p:first-child {
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
						line-height: 20px;
					}

					& p:last-child {
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #333333;
						line-height: 20px;

						img {
							width: 14px;
							height: 14px;
							margin-left: 6px;
						}
					}
				}
				.history {
					width: 100%;
					height: 70px;
					display: block;
					overflow-y: auto;
					overflow-x: hidden;
					margin-top: 0;
					padding: 0;

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

					.item {
						display: flex;
						flex-wrap: wrap;
						margin: 0;
						justify-content: start;

						p {
							height: 32px;
							background: rgba(79, 170, 116, 0.1);
							border-radius: 8px;
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 0 10px;

							font-size: 14px;
							font-family: Source Han Sans CN-Normal, Source Han Sans CN;
							font-weight: 350;
							color: #333333;
							margin: 4px;
						}
					}
					.no {
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
						width: 100%;
						text-align: center;
					}
				}
				.el-textarea {
					width: 100%;
					height: 100%;
					margin-top: -10px;
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

				.alert-ascription {
					top: 44px;
					left: 2px;
					position: absolute;
					z-index: 3;
					width: 292px;
					height: 330px;
					background: #ffffff;
					box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
					border-radius: 4px;
					padding: 10px 0 0 0;
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
						display: flex;
						flex-direction: column;
						justify-content: start;
						padding-bottom: 20px;
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

						.item {
							width: 100%;
							height: 46px;

							border-radius: 4px;
							display: flex;
							align-items: center;
							justify-content: start;
							padding-left: 10px;
							margin-bottom: 0;
							cursor: pointer;
							span {
								color: #333;
								font-size: 14px;
								font-family: Source Han Sans CN-Normal, Source Han Sans CN;
								font-weight: 350;
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

				.alert-group {
					display: flex;
					flex-direction: column;
					align-items: start;
					justify-content: start;
					height: 100%;
					p {
						height: 40px;
						width: 100%;
						line-height: 40px !important;
						border-bottom: 1px solid #eeeeee;

						font-size: 14px;
						font-family: Source Han Sans CN-Regular, Source Han Sans CN;
						font-weight: 400;
						color: #333333;
						line-height: 20px;
					}

					& p:first-child {
						border-top: 1px solid #eeeeee;
						font-size: 14px;
						font-family: Source Han Sans CN-Regular, Source Han Sans CN;
						font-weight: 400;
						color: #333333;
					}

					& p:last-child {
						font-size: 14px;
						font-family: Source Han Sans CN-Regular, Source Han Sans CN;
						font-weight: 400;
						color: #333333;
					}

					p:hover {
						color: #4faa74;
					}
				}
			}
		}
	}
}
</style>
