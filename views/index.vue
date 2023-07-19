<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { statistics } from '@renderer/api/frontPage'
import { componentList } from '@renderer/api/onlineVisitor'
import { useUserStore } from '@renderer/store/modules/user'
import ElTable from '@renderer/components/ElTable/index.vue'
import { NumData, ListData } from '@renderer/api/type'
import dayjs from 'dayjs'

const { userInfo } = useUserStore()

const timeList = [
	{
		value: 1,
		label: '今天',
	},
	{
		value: 2,
		label: '本周',
	},
	{
		value: 3,
		label: '本月',
	},
	{
		value: 4,
		label: '本年',
	},
]

const activeTimeIndex = ref(1)

const query = ref({
	project_id: null,
	begain_date: dayjs().format('YYYY-MM-DD'),
	end_date: dayjs().format('YYYY-MM-DD'),
	channel: null,
})

const summary = ref<NumData>({} as NumData)

const tableData = ref<ListData[]>([])

const selectComponentList = ref([])

const time = ref([])
const selectProjectList = [
	{ id: '', proj_nane: '全部' },
	...userInfo.user_project,
]

const getStatistics = async () => {
	const { data } = await statistics(query.value)

	console.log(data)

	summary.value = data.num

	tableData.value = data.list
}

getStatistics()

const getSelectComponentList = async () => {
	const { data } = await componentList({
		page: 1,
		page_size: 9999,
	})

	selectComponentList.value = [{ id: '', name: '全部' }, ...data.rows]
}

getSelectComponentList()

const handleIndexChange = (index: number) => {
	activeTimeIndex.value = index

	const mapObj: any = {
		1: {
			begain_date: dayjs().format('YYYY-MM-DD'),
			end_date: dayjs().format('YYYY-MM-DD'),
		},
		2: {
			begain_date: dayjs().startOf('week').format('YYYY-MM-DD'),
			end_date: dayjs().endOf('week').format('YYYY-MM-DD'),
		},
		3: {
			begain_date: dayjs().startOf('month').format('YYYY-MM-DD'),
			end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
		},
		4: {
			begain_date: dayjs().startOf('year').format('YYYY-MM-DD'),
			end_date: dayjs().endOf('year').format('YYYY-MM-DD'),
		},
	}

	query.value = {
		...query.value,
		...mapObj[index],
	}

	getStatistics()
}

const handleTime = () => {
	query.value.begain_date = time.value[0]
	query.value.end_date = time.value[1]

	getStatistics()
}
</script>

<template>
	<div class="home">
		<div class="top-filter">
			<div>
				<span>选择项目</span>
				<el-select v-model="query.project_id" @change="getStatistics">
					<el-option
						v-for="item in selectProjectList"
						:key="item.id"
						:label="item.proj_nane"
						:value="item.id"
					/>
				</el-select>
			</div>
			<div class="ditch">
				<span>选择渠道</span>
				<el-select v-model="query.channel" @change="getStatistics">
					<el-option
						v-for="item in selectComponentList"
						:key="item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</div>
			<div class="scope">
				<span
					v-for="item in timeList"
					:key="item.value"
					:class="{ active: activeTimeIndex === item.value }"
					@click="handleIndexChange(item.value)"
				>
					{{ item.label }}
				</span>
			</div>
			<div class="date-picker">
				<el-date-picker
					type="daterange"
					start-placeholder="请选择日期"
					end-placeholder="请选择日期"
					style="width: 260px"
					value-format="YYYY-MM-DD"
					v-model="time"
					@change="handleTime"
				/>
			</div>
		</div>

		<div class="main">
			<div class="top">
				<div class="item">
					<div class="left">
						<p>
							<span>平均首次响应时间（s）</span>
							<span></span>
						</p>
						<p>{{ summary.first_response_duration }}</p>
					</div>
					<div class="right">
						<img src="@renderer/assets/img/home/female.webp" alt="" />
					</div>
				</div>
				<div class="item">
					<div class="left">
						<p>
							<span>平均会话时长（s）</span>
							<span></span>
						</p>
						<p>{{ summary.average_server_duration }}</p>
					</div>
					<div class="right">
						<img src="@renderer/assets/img/home/man.webp" alt="" />
					</div>
				</div>
				<div class="item">
					<div class="left">
						<p>
							<span>访问数（人）</span>
							<span></span>
						</p>
						<p>{{ summary.interview_num }}</p>
					</div>
					<div class="right">
						<img src="@renderer/assets/img/home/right.webp" alt="" />
					</div>
				</div>
				<div class="item" style="margin-right: 0">
					<div class="left">
						<p>
							<span>接待量（人）</span>
							<span></span>
						</p>
						<p>{{ summary.reception_num }}</p>
					</div>
				</div>
			</div>
			<div class="bottom">
				<div class="item">
					<div class="left">
						<p>
							<span>有效会话量</span>
							<span></span>
						</p>
						<p>{{ summary.dialogue_valid }}</p>
					</div>
					<div class="right">
						<img src="@renderer/assets/img/home/bottom_one.webp" alt="" />
					</div>
				</div>
				<div class="item">
					<div class="left">
						<p>
							<span>敏感词触发（条）</span>
							<span></span>
						</p>
						<p>{{ summary.block_num }}</p>
					</div>
					<div class="right">
						<img src="@renderer/assets/img/home/bottom_two.webp" alt="" />
					</div>
				</div>
				<div class="item">
					<div class="left">
						<p>
							<span>好评次数</span>
							<span></span>
						</p>
						<p>{{ summary.reviews_num }}</p>
					</div>
					<div class="right">
						<img src="@renderer/assets/img/home/bottom_three.webp" alt="" />
					</div>
				</div>
				<div class="item" style="margin-right: 0">
					<div class="left">
						<p>
							<span>差评次数</span>
							<span></span>
						</p>
						<p>{{ summary.negative_reviews_num }}</p>
					</div>
				</div>
			</div>
		</div>

		<div class="table">
			<div class="top">
				<img src="@renderer/assets/layout/fenxi.webp" alt="" />
				<p>客服数据分析</p>
			</div>

			<div class="table-main">
				<ElTable :list="tableData">
					<el-table-column prop="name" label="姓名" min-width="124px" />
					<el-table-column
						prop="group_name"
						label="客服组（部门）"
						min-width="144px"
					/>
					<el-table-column
						prop="reception_num"
						label="累计接待次数"
						min-width="142px"
					/>
					<el-table-column
						prop="first_response_duration"
						label="平均首次响应时长"
						min-width="166px"
					/>
					<el-table-column
						prop="dialogue_valid"
						label="有效会话量"
						min-width="130px"
					/>
					<el-table-column
						prop="reviews_num"
						label="好评次数"
						min-width="118px"
					/>
					<el-table-column
						prop="negative_reviews_num"
						label="差评次数"
						min-width="118px"
					/>
					<el-table-column
						prop="negative_reviews_ate"
						label="差评率"
						min-width="106px"
					/>
					<el-table-column
						prop="block_num"
						label="敏感词触发次数"
						min-width="154px"
					/>
					<el-table-column
						prop="work_order_num"
						label="创建工单数"
						min-width="108px"
					/>
				</ElTable>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.home {
	/* prettier-ignore */
	height: calc(100% - 60PX);
	overflow: hidden;

	padding: 20px 10px 47px 10px;
	.top-filter {
		display: flex;
		align-items: center;
		margin-bottom: 28px;
		span {
			font-size: 14px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #333333;
			line-height: 20px;
		}

		:deep(.select-trigger) {
			width: 200px;
			height: 36px;
		}

		& div:first-child {
			margin-left: 20px;
			span {
				margin-right: 10px;
			}
		}

		.ditch {
			margin-left: 50px;
			span {
				margin-right: 10px;
			}
		}
		.scope {
			margin: 0 50px 0 50px;
			span {
				margin-right: 20px;
				cursor: pointer;
				font-size: 14px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 350;
				color: #333333;
				line-height: 20px;
			}

			& span:last-child {
				margin-right: 0;
			}

			.active {
				font-weight: 500;
				color: #4faa74;
			}
		}
		.date-picker {
			width: 260px;
			height: 36px;
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
		:deep(.el-input__inner) {
			font-size: 14px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #999999;
		}

		:deep(.el-range-input) {
			font-size: 12px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #666666;
		}
	}
	.main {
		.top,
		.bottom {
			display: flex;

			.item {
				display: flex;
				justify-content: space-between;
				align-items: end;
				width: 25%;
				height: 180px;
				background-color: #fff;
				margin-right: 10px;
				box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
				border-radius: 10px 10px 10px 10px;
				.left {
					padding: 15px 0 22px 15px;
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					& p:first-child {
						& span:first-child {
							font-size: 16px;
							font-family: Source Han Sans CN-Normal, Source Han Sans CN;
							font-weight: 350;
							color: #333333;
						}

						& span:last-child {
							margin-top: 5px;
							width: 46px;
							height: 4px;
							background: #4faa74;
							border-radius: 2px 2px 2px 2px;
							display: block;
						}
					}

					& p:last-child {
						font-size: 48px;
						font-family: Source Han Sans CN-Medium, Source Han Sans CN;
						font-weight: 500;
						color: #333333;
					}
				}
				.right {
					width: 140px;
					margin: 0;
					img {
						width: 140px;
						height: 140px;
					}
				}
			}
		}

		.top {
			margin-bottom: 10px;
		}
	}

	.table {
		margin-top: 10px;
		width: 100%;
		height: 317px;
		background: #ffffff;
		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
		border-radius: 10px 10px 10px 10px;
		.top {
			height: 62px;
			width: 100%;
			padding: 14px 0 24px 14px;
			display: flex;
			align-items: center;
			p {
				font-size: 14px;
				font-family: Source Han Sans CN-Medium, Source Han Sans CN;
				font-weight: 500;
				color: #333333;
				line-height: 20px;
			}
			img {
				width: 24px;
				height: 24px;
				margin-right: 8px;
			}
		}

		.table-main {
			width: 100%;
			padding: 0 10px 0 16px;
			.el-table {
				width: 100%;
				height: 250px;

				:deep(.el-table__header-wrapper) {
					border-radius: 8px 8px 0 0;
				}
			}
		}
	}
}
</style>
