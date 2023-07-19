<script setup lang="ts">
import { ref } from 'vue'
const dialogVisible = ref(false)
</script>

<template>
	<el-dialog v-model="dialogVisible" class="version-update" :show-close="false">
		<div class="version-update-main">
			<div class="top-img">
				<img src="@renderer/assets/layout/logo_color.webp" alt="" />
			</div>

			<div class="main">
				<div class="left-docs">
					<div class="title">
						<h1>
							YoutoChat新版本
							<span>v1.0.5</span>
							来了
						</h1>

						<p>您目前的版本是v1.0.2版本，新版本更新日志如下：</p>
					</div>

					<div class="docs">
						<div>
							<p>【新功能】</p>
							<span>本次版本增加智能机器人</span>
						</div>
						<div>
							<p>【优化及问题修复】</p>
							<span>修复已知问题</span>
						</div>

						<div>
							<p>【新功能】</p>
							<span>本次版本增加智能机器人</span>
						</div>
						<div>
							<p>【优化及问题修复】</p>
							<span>修复已知问题</span>
						</div>

						<div>
							<p>【新功能】</p>
							<span>本次版本增加智能机器人</span>
						</div>
						<div>
							<p>【优化及问题修复】</p>
							<span>修复已知问题</span>
						</div>

						<div>
							<p>【新功能】</p>
							<span>本次版本增加智能机器人</span>
						</div>
						<div>
							<p>【优化及问题修复】</p>
							<span
								>修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题修复已知问题</span
							>
						</div>
					</div>

					<div class="button">
						<p>立即更新</p>
						<p @click="dialogVisible = !dialogVisible">忽略此版本</p>
					</div>

					<img
						src="@renderer/assets/layout/update_img.webp"
						alt=""
						class="updata-img"
					/>
				</div>
			</div>
		</div>
	</el-dialog>
</template>

<style lang="scss">
.version-update {
	--el-dialog-padding-primary: 0px;
	.el-dialog__header,
	.el-dialog__body {
		margin: 0;
		padding: 0px;
	}
}
</style>

<style scoped lang="scss">
.version-update {
	.version-update-main {
		width: 800px;
		height: 400px;
		background: #f3fcf7;
		border-radius: 8px;

		padding: 20px;

		.top-img {
			img {
				width: 128px;
				height: 26px;

				object-fit: cover;
			}

			padding-bottom: 50px;
		}

		.main {
			display: flex;
			position: relative;
			.left-docs {
				width: 386px;

				.updata-img {
					width: 460px;
					height: 254px;
					object-fit: cover;

					position: absolute;
					right: -8px;
					top: 20px;
				}

				.title {
					margin-bottom: 30px;
					h1 {
						font-size: 16px;
						font-family: Source Han Sans CN-Medium, Source Han Sans CN;
						font-weight: 500;
						color: #333333;

						margin-bottom: 10px;

						span {
							color: #4faa74;
						}
					}

					p {
						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
					}
				}

				.docs {
					width: 286px;
					height: 110px;

					overflow-y: auto;

					margin-bottom: 56px;

					&::-webkit-scrollbar {
						width: 4px;
					}

					&::-webkit-scrollbar-thumb {
						background: #dddddd;
						border-radius: 10px;
					}

					&::-webkit-scrollbar-track {
						background: transparent;
					}
					div {
						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						margin-bottom: 20px;
						p {
							color: #333333;
							margin-bottom: 10px;

							margin-left: -6px;
						}
						span {
							color: #999999;
						}
					}
				}

				.button {
					display: flex;

					align-items: center;

					p {
						cursor: pointer;
					}

					& p:first-child {
						width: 80px;
						height: 30px;
						background: #4faa74;
						border-radius: 8px;

						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #ffffff;

						text-align: center;

						line-height: 30px;
					}

					& p:last-child {
						margin-left: 30px;

						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
					}
				}
			}
		}
	}
}
</style>
