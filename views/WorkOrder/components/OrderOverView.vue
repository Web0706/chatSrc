<script setup lang="ts">
import { ref } from 'vue'
import { orderOverView } from '@renderer/api/order'
import type { ViewQuery } from './type'
import { useUserStore } from '@renderer/store/modules/user'
import { projectService } from '@renderer/api/chat'

import { storeToRefs } from 'pinia'
import ElTable from '@renderer/components/ElTable/index.vue'

const overViewList = ref([])
const overViewTotal = ref()
const userStore = storeToRefs(useUserStore())
const time = ref(null)

const overViewQuery = ref<ViewQuery>({
	project_id: userStore.projectId.value,
	end_time: null,
	kefu_id: null,
	page: 1,
	page_size: 10,
	start_time: null,
})

const projectServiceList = ref([]) // 项目客服列表

const getSelectList = async () => {
	const { data } = await projectService({
		project_id: userStore.projectId.value,
		page: 1,
		page_size: 9999,
	})
	projectServiceList.value = data.rows
}

getSelectList()

const getOrderOverView = async () => {
	const {
		data: { list, today },
	} = await orderOverView(overViewQuery.value)

	overViewTotal.value = today

	overViewList.value = list.rows
}
getOrderOverView()

const handleQuery = () => {
	if (time.value) {
		overViewQuery.value.start_time = time.value[0]
		overViewQuery.value.end_time = time.value[1]
	} else {
		overViewQuery.value.start_time = null
		overViewQuery.value.end_time = null
	}

	getOrderOverView()
}

const reset = () => {
	overViewQuery.value = {
		project_id: userStore.projectId.value,
		end_time: null,
		kefu_id: null,
		page: 1,
		page_size: 10,
		start_time: null,
	}
	time.value = null
	getOrderOverView()
}
</script>

<template>
	<div class="right-main">
		<div class="pandect-search">
			<div class="date-picker">
				<div>
					<el-date-picker
						type="daterange"
						start-placeholder="请选择日期"
						end-placeholder="请选择日期"
						style="width: 260px"
						value-format="YYYY-MM-DD"
						v-model="time"
					/>
				</div>

				<p>
					<span>接待客服：</span>

					<el-select placeholder="请选择" v-model="overViewQuery.kefu_id">
						<el-option
							v-for="item in projectServiceList"
							:key="item.user_id"
							:label="item.user_name"
							:value="item.user_id"
						>
						</el-option>
					</el-select>
				</p>
			</div>

			<div class="button">
				<span @click="handleQuery">查询</span>
				<span @click="reset">重置</span>
			</div>
		</div>

		<div class="total-statistics">
			<div>
				<p>
					<span>新建工单量</span>
					<span></span>
				</p>
				<p>{{ overViewTotal?.increase }}</p>
			</div>
			<div>
				<p>
					<span>完结工单量</span>
					<span></span>
				</p>
				<p>{{ overViewTotal?.close }}</p>
			</div>
			<div>
				<p>
					<span>延期工单量</span>
					<span></span>
				</p>
				<p>{{ overViewTotal?.extension }}</p>
			</div>
			<div>
				<p>
					<span>驳回工单量</span>
					<span></span>
				</p>
				<p>{{ overViewTotal?.reject }}</p>
			</div>
		</div>
		<ElTable
			:list="overViewList"
			class="pandect-table"
			element-loading-background="#FFF"
			style="height: 484px"
		>
			<el-table-column
				prop="user_name"
				label="姓名"
				align="left"
				min-width="90px"
			/>

			<el-table-column
				prop="increase"
				label="新建工单量"
				sortable
				min-width="128px"
			/>

			<el-table-column
				prop="active"
				label="主动接单量"
				sortable
				min-width="128px"
			/>

			<el-table-column
				prop="acceptance"
				label="受理接单量"
				sortable
				min-width="128px"
			/>

			<el-table-column
				prop="close"
				label="完结工单量"
				sortable
				min-width="128px"
			/>

			<el-table-column
				prop="reject"
				label="驳回工单量"
				sortable
				min-width="128px"
			/>

			<el-table-column
				prop="extension"
				label="延期工单量"
				sortable
				min-width="128px"
			/>
		</ElTable>

		<div
			style="
				display: flex;
				justify-content: end;
				height: 46px;
				align-items: center;
				padding-right: 20px;
			"
		>
			<!-- <Pager /> -->
		</div>
	</div>
</template>

<style scoped lang="scss">
.pandect-search {
	width: 1170px;
	padding: 16px 20px 26px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	div {
		display: flex;
		.date-picker {
			height: 36px;
			padding-top: 2px;

			:deep(.el-date-editor .el-range__icon) {
				svg {
					display: none;
				}
				width: 14px;
				height: 14px;
				background-image: url('@renderer/assets/layout/menu-board.webp');
				background-size: cover;
			}
		}

		& p:last-child {
			margin-left: 50px;
		}
	}

	.button {
		display: flex;

		span {
			width: 75px;
			height: 36px;
			border-radius: 8px 8px 8px 8px;
			opacity: 1;
			border: 1px solid #4faa74;
			text-align: center;
			line-height: 36px;

			color: #4faa74;
			font-size: 14px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			cursor: pointer;
		}
		& span:first-child {
			background: #4faa74;

			color: #ffffff;
			margin-right: 10px;
		}
	}

	:deep(.el-range-input) {
		font-size: 12px;
		font-family: Source Han Sans CN-Normal, Source Han Sans CN;
		font-weight: 350;
		color: #666666;
	}

	& p:last-child {
		display: flex;
		align-items: center;
		font-size: 14px;
		font-family: Source Han Sans CN-Normal, Source Han Sans CN;
		font-weight: 350;
		color: #333333;
		line-height: 20px;
	}
}

.total-statistics {
	display: flex;
	padding: 0 20px 20px;

	& > div {
		width: 25%;
		height: 140px;
		background: #ffffff;
		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
		border-radius: 10px 10px 10px 10px;
		margin-right: 10px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		p {
			font-size: 16px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #333333;
			& span:last-child {
				margin-top: 5px;
				display: block;
				width: 46px;
				height: 4px;
				background: #4faa74;
				border-radius: 2px 2px 2px 2px;
			}
		}

		& p:last-child {
			font-size: 48px;
			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			font-weight: 500;
			color: #333333;
		}
	}

	& > div:last-child {
		margin-right: 0;
	}
}
</style>
