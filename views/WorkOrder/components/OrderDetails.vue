<script setup lang="ts">
import { orderDetail } from '@renderer/api/order'
import { ref } from 'vue'
import { WorkOrderNode } from './type'
import { orderStatusMap } from '@renderer/utils/dictionary'

const details = ref<WorkOrderNode>({} as WorkOrderNode)

const mapObj = {
	1: '一般',
	2: '紧急',
	3: '非常紧急',
}

defineProps<{ detailsDialogVisible: Boolean }>()

const emit = defineEmits(['update:detailsDialogVisible'])

const handleClose = () => {
	emit('update:detailsDialogVisible', false)
}

const getOrderDetail = async id => {
	const { data } = await orderDetail(id)
	console.log(data.info)

	details.value = data.info
}

defineExpose({
	getOrderDetail,
})
</script>

<template>
	<div></div>

	<el-dialog
		:model-value="detailsDialogVisible"
		title="工单详情"
		width="700px"
		:before-close="handleClose"
		class="order-details"
	>
		<div class="main">
			<div class="many">
				<p>
					<span>所属项目：</span>
					<span>{{ details.project_name }}</span>
				</p>
				<p>
					<span>优先级：</span>
					<span>{{ mapObj[details.priority] }}</span>
				</p>
			</div>
			<div>
				<p>标题：</p>
				<p>{{ details.title }}</p>
			</div>
			<div>
				<p>工单描述：</p>
				<p>
					{{ details.desc }}
				</p>
			</div>
			<div class="many">
				<p>
					<span>指派受理人：</span>
					<span>{{ details.kefu_name }}</span>
				</p>
				<p>
					<span>工单种类：</span>
					<span>{{ details.work_status_name }}</span>
				</p>
			</div>
			<div class="many">
				<p>
					<span>预计完成时间：</span>
					<span>{{ details.reckon_time }}</span>
				</p>
				<p>
					<span>工单状态：</span>
					<span>{{ orderStatusMap[details.status] }}</span>
				</p>
			</div>
			<div>
				<p>图片：</p>
				<p>
					<img
						v-for="item in details.work_tick_img"
						:key="item.id"
						:src="item.image"
						alt=""
					/>
				</p>
			</div>
			<div>
				<p>处理结果描述：</p>
				<p>{{ details.result_desc }}</p>
			</div>
			<div class="many">
				<p>
					<span>处理人：</span>
					<span>{{ details.kefu_name }}</span>
				</p>
				<p>
					<span>处理时间：</span>
					<span>{{ details.reality_time }}</span>
				</p>
			</div>
		</div>

		<template #footer>
			<span class="dialog-footer">
				<el-button
					@click="handleClose"
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
</template>

<style scoped lang="scss">
.order-details {
	.main {
		font-size: 14px;
		font-family: Source Han Sans CN-Normal, Source Han Sans CN;
		font-weight: 350;
		color: #333333;
		div {
			display: flex;
			align-items: center;
			margin-top: 14px;
			img {
				width: 88px;
				height: 88px;
				border-radius: 4px 4px 4px 4px;
			}
		}
		.many {
			p {
				display: flex;
				align-items: center;
				& span:last-child {
					display: block;
					width: 200px;
					height: 36px;
					background: #ffffff;
					border-radius: 8px 8px 8px 8px;
					line-height: 36px;
					padding-left: 10px;
					border: 1px solid #dddddd;
				}
			}
			& p:first-child {
				& span:first-child {
					width: 98px;
				}

				& span:last-child {
					margin-left: 8px;
				}
			}
			& p:last-child {
				& span:first-child {
					width: 70px;
				}
				margin-left: 82px;
			}
		}

		& div:nth-child(2) {
			p {
				width: 98px;
			}
			& p:last-child {
				width: 554px;
				height: 36px;
				background: #ffffff;
				border-radius: 8px 8px 8px 8px;
				border: 1px solid #dddddd;
				padding-left: 10px;
				margin-left: 6px;
				line-height: 36px;
			}
		}

		& div:nth-child(3) {
			align-items: baseline;

			p {
				width: 98px;
			}
			& p:last-child {
				width: 554px;
				height: 87px;
				background: #ffffff;
				border-radius: 8px 8px 8px 8px;
				border: 1px solid #dddddd;
				padding: 8px 0 8px 10px;
				margin-left: 6px;
			}
		}

		& div:nth-child(6) {
			align-items: start;

			& p:first-child {
				width: 98px;
				margin-top: 2px;
			}
			& p:last-child {
				margin-left: 8px;
			}
		}

		& div:nth-child(7) {
			align-items: baseline;

			& p:first-child {
				width: 98px;
			}
			& p:last-child {
				margin-left: 8px;
				width: 554px;
				height: 87px;
				background: #ffffff;
				border-radius: 8px 8px 8px 8px;
				padding: 8px 0 8px 10px;
				border: 1px solid #dddddd;
			}
		}
	}
	.dialog-footer {
		display: block;
		text-align: center;
	}
}
</style>
