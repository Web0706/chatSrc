<script setup lang="ts">
import { ref } from 'vue'
import ElTable from '@renderer/components/ElTable/index.vue'
import Pager from '@renderer/components/Pager/index.vue'
import { appraiseSearchList } from '@renderer/utils/dictionary'
import { appraiseList } from '@renderer/api/appraise'
import { useUserStore } from '@renderer/store/modules/user'
import { storeToRefs } from 'pinia'

const { projectId } = storeToRefs(useUserStore())

const loading = ref(false)
const queryCondition = ref('')
const dialogSearch = ref(false)

const query = ref({
	project_id: projectId.value,
	page: 1,
	page_size: 10,
})
const list = ref([])
const total = ref(0)

const mapObj = {
	1: '很差',
	2: '一般',
	3: '满意',
	4: '非常满意',
}

const getAppraiseList = async () => {
	const { data } = await appraiseList(query.value)

	list.value = data.rows
	total.value = data.total_rows
}

getAppraiseList()

const handleSelectionChange = (node: any) => {
	console.log(node)
}

const handleBlue = () => {
	setTimeout(() => {
		dialogSearch.value = false
	}, 200)
}

const reset = () => {
	queryCondition.value = ''
}

const handledialogSearch = (item: AnyObject) => {}

const handlePageChange = ({ type, value }) => {
	query.value[type] = value
	getAppraiseList()
}
</script>

<template>
	<div class="appraise">
		<div class="appraise-container">
			<div class="search">
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
						v-for="item in appraiseSearchList"
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

			<div style="padding-top: 24px">
				<ElTable
					class="appraise-table"
					v-loading="loading"
					:list="list"
					element-loading-background="#fff"
					@selection-change="handleSelectionChange"
				>
					<!-- <el-table-column min-width="54px" /> -->
					<el-table-column min-width="20px" />

					<el-table-column
						prop="project_name"
						label="所属项目"
						min-width="148px"
					>
					</el-table-column>
					<el-table-column
						prop="widget_chan_name"
						label="来源渠道"
						min-width="154px"
					/>
					<el-table-column label="评价人" min-width="136px ">
						<template #default="{ row }">
							<span>{{ row.visitor_name }}</span>
						</template>
					</el-table-column>
					<el-table-column
						prop="kefu_name"
						label="被评价人"
						min-width="148px"
					/>
					<el-table-column label="服务评价" min-width="148px">
						<template #default="{ row }">
							<span
								:style="{
									color:
										row.level === 4 || row.level === 3
											? '#4CD964'
											: row.level === 2
											? '#FF9A52'
											: '#FF0000',
								}"
								>{{ mapObj[row.level] }}</span
							>
						</template></el-table-column
					>
					<el-table-column label="评价级别" min-width="148px">
						<template #default="{ row }">
							<span
								:style="{
									color: row.assess === 1 ? '#4CD964' : '#FF0000',
								}"
								>{{ row.assess === 1 ? '好评' : '差评' }}</span
							>
						</template></el-table-column
					>
					<el-table-column prop="desc" label="评价内容" min-width="172px" />
					<el-table-column
						prop="updated_at"
						label="评价时间"
						min-width="158px"
					/>
				</ElTable>

				<div
					style="
						display: flex;
						justify-content: end;
						align-items: end;
						height: 100px;
					"
				>
					<Pager :total="total" @change="handlePageChange" />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.appraise {
	padding: 10px;
	height: calc(100% - 60px);
	overflow: hidden;
	padding: 10px;

	max-width: 100%;
	.appraise-container {
		padding: 16px 20px 0 16px;
		background: #ffffff;
		border-radius: 10px 10px 10px 10px;
		height: 100%;
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
				margin-left: 10px;
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
		.appraise-table {
			max-width: 100%;
			height: 580px;

			:deep(.el-checkbox__inner) {
				border-radius: 0;
				border: 1px solid #999999;
			}
		}
	}
}
</style>
