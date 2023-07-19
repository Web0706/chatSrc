<script setup lang="ts">
import { ref } from 'vue'
import ElTable from '@renderer/components/ElTable/index.vue'
import Pager from '@renderer/components/Pager/index.vue'
import { leaveSearchMessage } from '@renderer/utils/dictionary'
import { boardList, readBoard } from '@renderer/api/messageBoard'
import type { BoardQuery, MessageItem } from './components/type'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@renderer/store/modules/user'
import { storeToRefs } from 'pinia'

const userStore = storeToRefs(useUserStore())

const loading = ref(false)
const dialogVisible = ref(false)

// 输入框value
const queryCondition = ref('')
const dialogSearch = ref(false)
const selectIds = ref('')
const node = ref<MessageItem>({} as MessageItem)

const messageBoardList = ref<MessageItem[]>([])

const query = ref<BoardQuery>({
	/**
	 * 留言企业名称
	 */
	enterprise: null,
	/**
	 * 已读未读状态 1未读 2已读
	 */
	is_read: null,
	/**
	 * 留言姓名
	 */
	name: null,
	/**
	 * 项目id
	 */
	project_id: userStore.projectId.value,
	page: 1,
	page_size: 10,
})

const total = ref(0)

const getmessageBoardList = async () => {
	const { data } = await boardList(query.value)
	console.log(data)

	messageBoardList.value = data.rows
	total.value = data.total_rows
}

getmessageBoardList()

const handleSelectionChange = (node: any) => {
	selectIds.value = node
		.filter((item: any) => item.is_read !== 2)
		.map((item1: any) => item1.id)
		.join(',')
}

const read = async () => {
	if (!selectIds.value) {
		return ElMessage.warning('请选中要已读的留言,已读的留言不能再次读取')
	}
	await readBoard({ ids: selectIds.value })

	getmessageBoardList()
}

const lookMessageDetails = (item: any) => {
	node.value = item

	dialogVisible.value = true
}

const handleClose = () => {
	dialogVisible.value = false
}

const handleBlue = () => {
	setTimeout(() => {
		dialogSearch.value = false
	}, 200)
}

const handledialogSearch = (item: any) => {
	console.log(item)
}

const reset = () => {
	queryCondition.value = ''

	query.value = {
		enterprise: null,
		is_read: null,
		name: null,
		project_id: 4,
		page: 1,
		page_size: 10,
	}

	getmessageBoardList()
}

const handlePageChange = ({ type, value }) => {
	query.value[type] = value
	getmessageBoardList()
}
</script>

<template>
	<div class="message-board">
		<div class="container">
			<div class="board-search">
				<div class="search">
					<p>
						<span>状态： </span>
						<el-select
							placeholder="请选择"
							@change="getmessageBoardList"
							v-model="query.is_read"
						>
							<el-option
								v-for="item in [
									{ name: '全部', id: '' },
									{ name: '未读', id: 1 },
									{ name: '已读', id: 2 },
								]"
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
							v-model="queryCondition"
							@focus="dialogSearch = true"
							@blur="handleBlue"
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
							v-for="item in leaveSearchMessage"
							:key="item.id"
						>
							<p @click="handledialogSearch(item)">
								<img src="@renderer/assets/img/chat/search.png" alt="" />
								<span>{{ item.label }}</span>
							</p>
							<p>包含</p>
							<p>{{ queryCondition }}</p>
						</div>
					</div>
				</div>
				<div class="read">
					<el-button @click="read">批量已读</el-button>
				</div>
			</div>
			<div style="padding: 0 20px 0 16px">
				<ElTable
					class="board-table"
					v-loading="loading"
					:list="messageBoardList"
					element-loading-background="#fff"
					@selection-change="handleSelectionChange"
				>
					<el-table-column type="selection" min-width="54px" />

					<el-table-column
						prop="project_name"
						label="项目名称"
						min-width="98px"
					>
					</el-table-column>
					<el-table-column
						prop="widget_chan_name"
						label="来源渠道"
						min-width="98px"
					/>
					<el-table-column label="留资姓名" min-width="98px ">
						<template #default="{ row }">
							<span
								style="color: #1887ff; cursor: pointer"
								@click="lookMessageDetails(row)"
								>{{ row.name }}</span
							>
						</template>
					</el-table-column>
					<el-table-column
						prop="enterprise"
						label="留资企业名称"
						min-width="122px"
					/>
					<el-table-column prop="phone" label="留资手机号" min-width="122px" />
					<el-table-column prop="qq" label="留资QQ号" min-width="116px" />
					<el-table-column prop="wx" label="留资微信号" min-width="122px" />
					<el-table-column
						prop="leave_word_mess"
						label="留言内容"
						min-width="98px"
					/>
					<el-table-column
						prop="created_at"
						label="留资时间"
						min-width="98px"
					/>
					<el-table-column label="状态" min-width="74px">
						<template #default="{ row }">
							{{ row.is_read == 1 ? '未读' : '已读' }}
						</template>
					</el-table-column>
					<el-table-column prop="read_time" label="已读时间" min-width="98px" />
				</ElTable>

				<div
					style="
						display: flex;
						justify-content: end;
						height: 46px;
						align-items: center;
					"
				>
					<Pager :total="total" @change="handlePageChange" />
				</div>
			</div>
		</div>

		<el-dialog
			v-model="dialogVisible"
			title="留言信息"
			width="440px"
			:before-close="handleClose"
			class="board-dialog"
		>
			<div class="dialog-main">
				<p>
					<span>留资姓名：</span>
					<span>{{ node.name }}</span>
				</p>
				<p>
					<span>留资企业名称：</span>
					<span>{{ node.enterprise }}</span>
				</p>
				<p>
					<span>留资手机号：</span>
					<span>{{ node.phone }}</span>
				</p>
				<p>
					<span>留资QQ号：</span>
					<span>{{ node.qq }}</span>
				</p>
				<p>
					<span>留资微信号：</span>
					<span>{{ node.wx }}</span>
				</p>
				<p>
					<span>留资时间：</span>
					<span>{{ node.updated_at }}</span>
				</p>
				<p>
					<span>留言内容：</span>
					<span>{{ node.leave_word_mess }} </span>
				</p>
			</div>

			<template #footer>
				<span style="display: block; text-align: center">
					<el-button
						@click="dialogVisible = false"
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
						关闭
					</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<style scoped lang="scss">
.message-board {
	height: calc(100% - 60px);
	overflow: hidden;
	padding: 10px;

	max-width: 100%;
	.container {
		width: 100%;
		height: 100%;
		background: #ffffff;
		border-radius: 10px 10px 10px 10px;
		.board-search {
			padding: 16px 20px 24px 16px;
			.search {
				display: flex;
				position: relative;
				justify-content: end;

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

			.read {
				margin-top: 20px;
				.el-button {
					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #ffffff;

					width: 100px;
					height: 40px;
					background: #4faa74;
					border-radius: 8px 8px 8px 8px;
				}
			}
		}

		.board-table {
			max-width: 100%;
			height: 580px;

			:deep(.el-checkbox__inner) {
				border-radius: 0;
				border: 1px solid #999999;
			}
		}
	}

	.board-dialog {
		.dialog-main {
			p {
				display: flex;
				align-items: center;

				font-size: 14px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 350;
				color: #333333;
				margin-bottom: 14px;
				& span:first-child {
					width: 98px;
				}

				& span:last-child {
					flex: 1;
					height: 36px;
					background: #ffffff;
					border-radius: 8px 8px 8px 8px;

					border: 1px solid #dddddd;
					margin-left: 6px;
					line-height: 36px;
					padding-left: 10px;
				}
			}

			& p:last-child {
				& span:last-child {
					padding: 8px 10px;
					width: 295px;
					height: 140px;
					line-height: 20px;
					overflow-y: auto;
					word-break: break-all;
				}

				& span:last-child::-webkit-scrollbar {
					width: 6px;
				}

				& span:last-child::-webkit-scrollbar-thumb {
					background: #dddddd;
					border-radius: 10px;
				}

				& span:last-child::-webkit-scrollbar-track {
					background: transparent;
				}
			}
		}
	}
}
</style>
