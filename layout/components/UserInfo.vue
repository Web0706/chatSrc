<script setup lang="ts">
import { useUserStore } from '@renderer/store/modules/user'
import dayjs from 'dayjs'

import { storeToRefs } from 'pinia'

const { userInfo } = storeToRefs(useUserStore())

const emit = defineEmits(['change'])
</script>

<template>
	<div class="user-info">
		<div class="top-info">
			<img src="@renderer/assets/layout/touxiang.webp" alt="" />
			<h3>{{ userInfo.name }}</h3>

			<div>
				<p>
					<span>已使用: </span>
					<span>{{ dayjs().diff(userInfo.created_at, 'day') }} 天</span>
				</p>
			</div>
		</div>
		<div class="message">
			<div>
				<p>
					<img src="@renderer/assets/layout/company_one.webp" alt="" />
				</p>
				<p>{{ userInfo.company_name }}</p>
			</div>
			<div>
				<p>
					<img src="@renderer/assets/layout/project.webp" alt="" />
				</p>
				<p>
					<span v-for="item in userInfo.user_project" :key="item.id">{{
						item.proj_nane
					}}</span>
				</p>
			</div>
			<div>
				<p>
					<img src="@renderer/assets/layout/call.webp" alt="" />
				</p>
				<p>{{ userInfo.phone }}</p>
			</div>
			<div>
				<p>
					<img src="@renderer/assets/layout/sms.webp" alt="" />
				</p>
				<p>{{ userInfo.email }}</p>
			</div>
			<div>
				<p>
					<img src="@renderer/assets/layout/user-edit.webp" alt="" />
				</p>
				<p>{{ userInfo.explain }}</p>
			</div>
		</div>
		<div class="manipulate">
			<p @click="$emit('change')">确定</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
.user-info {
	position: absolute;
	z-index: 6;
	top: 60px;
	left: 64px;
	width: 310px;

	background: #ffffff;
	box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
	border-radius: 10px 10px 10px 10px;
	padding: 40px 50px 25px 30px;
	.top-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40px;
		img {
			width: 64px;
			height: 64px;
			object-fit: cover;
			margin-bottom: 10px;
		}
		h3 {
			font-size: 16px;
			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			font-weight: 500;
			color: #333333;
			line-height: 24px;
			margin-bottom: 10px;
		}

		div {
			display: flex;
			color: #999;
			& p:first-child {
				font-size: 10px;
			}
		}
	}

	.message {
		display: flex;
		flex-direction: column;

		div {
			display: flex;
			margin-bottom: 26px;
			align-items: center;
			& p:first-child {
				height: 10px;
				border-right: 1px solid rgba(0, 0, 0, 0.1);
				width: 26px;
				position: relative;
				margin-right: 15px;
				img {
					position: absolute;
					width: 16px;
					height: 16px;
					left: 0;
					top: -25%;
				}
			}
			& p:last-child {
				font-size: 12px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 500;
				color: #333333;
				line-height: 18px;

				span {
					background: #ceffe2;
					border-radius: 4px 4px 4px 4px;
					padding: 1px 7px;
					margin-right: 10px;

					font-size: 12px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #4faa74;
					line-height: 18px;
				}
			}
		}

		& div:nth-child(2) {
			& p:first-child {
				width: 26px;
				height: 10px;
				border-right: 1px solid rgba(0, 0, 0, 0.1);
				position: relative;
				padding-right: 26px;
			}
			& p:nth-child(2) {
				margin-left: 10px;
				display: flex;
				flex-wrap: wrap;
				span {
					margin-bottom: 4px;
				}
			}
		}
	}

	.manipulate {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 10px;
		& p {
			width: 94px;
			height: 36px;
			border-radius: 6px 6px 6px 6px;
			border: 1px solid #4faa74;
			text-align: center;
			line-height: 36px;

			font-size: 12px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #4faa74;
			cursor: pointer;
		}

		& p:last-child {
			background: #4faa74;
			color: #ffffff;
		}
	}
}
</style>
