<script setup lang="ts">
const props = defineProps({
	dialogVisible: Boolean,
})

const emit = defineEmits(['update'])

const handleClose = () => {
	emit('update', false)
}
</script>

<template>
	<el-dialog
		:model-value="dialogVisible"
		width="650"
		:before-close="handleClose"
		style="--el-dialog-padding-primary: -10px"
		class="custom-class"
	>
		<template #header="{ close, titleId, titleClass }">
			<div class="my-header">
				<p :id="titleId" :class="titleClass">
					<img src="@renderer/assets/layout/logo_update.webp" alt="" />
					<span>版本更新</span>
				</p>
			</div>
		</template>
		<template #default>
			<div class="need" v-if="false">
				<p>YoutoChatV1.0.05</p>

				<p>1.修复了一些已知Bug</p>
				<p>2.修复了偶尔无法显示用户状态的情况</p>
			</div>

			<div v-else class="no">
				<img src="@renderer/assets/layout/big_logo.webp" alt="" />
				<p>
					<span>您目前是最新版本</span>
					<span>V1.0.0.5</span>
				</p>
			</div>
		</template>
		<template #footer>
			<span class="dialog-footer">
				<el-button
					@click="$emit('update', false)"
					style="
						width: 140px;
						height: 40px;
						border-radius: 8px 8px 8px 8px;
						border: 1px solid #999999;
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
						line-height: 20px;
					"
					>暂不更新</el-button
				>
				<el-button
					type="primary"
					@click="$emit('update', true)"
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
						margin-right: 20px;
					"
				>
					立即更新
				</el-button>
				<p style="width: 100%; height: 20px"></p>
			</span>
		</template>
	</el-dialog>
</template>

<style scoped lang="scss">
.custom-class {
	:deep(.el-dialog__footer) {
		padding: 20px;
	}
	.no {
		width: 610px;
		height: 120px;
		background: #f2f3f6;
		border-radius: 8px 8px 8px 8px;
		display: flex;
		align-items: center;
		padding-left: 30px;
		margin: 0 20px 20px 20px;
		img {
			width: 70px;
			height: 70px;
			margin-right: 20px;
		}

		p {
			display: flex;
			flex-direction: column;
			font-size: 14px;
			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			font-weight: 500;
			color: #333333;
			line-height: 20px;
			& span:first-child {
				margin-bottom: 4px;
			}
		}
	}
	.need {
		width: 610px;
		height: 120px;
		background-color: #f2f3f6 !important;
		border-radius: 8px 8px 8px 8px;
		padding: 10px 0 20px 10px;
		p {
			font-size: 14px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #333333;
			line-height: 20px;
			margin-bottom: 10px;
		}

		& p:first-child {
			font-weight: 500;

			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			margin-bottom: 20px;
		}
	}

	.my-header {
		padding: 20px 0 20px 20px;
		p {
			display: flex;
			align-items: center;

			font-size: 16px;
			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			font-weight: 500;
			color: #333333;
			line-height: 23px;
			img {
				width: 24px;
				height: 24px;
				margin-right: 6px;
			}
		}
	}
}
</style>
