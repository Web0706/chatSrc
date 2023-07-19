<script setup lang="ts">
import { ref, watch } from 'vue'
import router from '@renderer/router'

import {
	setFlagItme,
	setToken,
	getFlagItme,
} from '@renderer/utils/local-storage'
import { ElMessage } from 'element-plus'
import { login, Code, forgetPass } from '@renderer/api/login'
import { useUserStore } from '@renderer/store/modules/user'

const userStore = useUserStore()

const { ipcRenderer } = require('electron')

const flag = JSON.parse(getFlagItme('keepLogin')) || false

const params = ref({
	passWord: '',
	keepLogin: flag,
	phone: '',
	code: '',
})

const iconFlag = ref(true)
const type = ref('password')
const timer = ref()
const passWordFlag = ref()

const verificationCodeFlag = ref<any>('获取验证码')

const forget = ref({
	forgetFlagImg1: false,
	forgetFlagImg2: false,
})

const Close = () => {
	ipcRenderer.invoke('window-close')
}

const Mini = () => {
	ipcRenderer.invoke('windows-mini')
}

const check = (): boolean => {
	const reg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/

	console.log(type.value)

	const regex = /^\d{6}$/
	if (!reg.test(params.value.phone)) {
		ElMessage.warning('请输入正确的手机号')
		return false
	}

	if (
		(params.value.passWord.length < 6 || params.value.passWord.length > 16) &&
		type.value !== 'code'
	) {
		ElMessage.warning('密码在6-16位之间')
		return false
	}

	if (!regex.test(params.value.code) && type.value !== 'password') {
		ElMessage.warning('请输入正确的验证码')
		return false
	}

	return true
}

const handleLogin = async () => {
	try {
		if (!check()) {
			return
		}

		const data = await login(params.value)

		if (data.code === 200) {
			setToken(data.data.token)
			setFlagItme('userInfo', JSON.stringify(data.data.user_info))
			userStore.setUserInfo(data.data)

			userStore.setProjectId(data.data.user_info.user_project?.[0].id)

			if (params.value.keepLogin) {
				setFlagItme('phone', window.btoa(params.value.phone))
				setFlagItme('password', window.btoa(params.value.passWord))
			}
			ElMessage.success('欢迎回来')
			router.push('/chat')
		} else {
			ElMessage.error(data.msg)
		}
	} catch (error) {
		console.log(error)
	}
}

const sendCode = async type => {
	const data = await Code({
		phone: params.value.phone,
		code_type: type,
	})

	if (data.code === 200) {
		ElMessage.success('发送成功')
		verificationCodeFlag.value = 60

		timer.value = setInterval(() => {
			verificationCodeFlag.value--
			if (verificationCodeFlag.value === 0) {
				verificationCodeFlag.value = '获取验证码'
				clearInterval(timer.value)
			}
		}, 1000)
	} else {
		ElMessage.error(data.msg)
	}
}

const handleForget = () => {
	type.value = 'forget'

	verificationCodeFlag.value = '获取验证码'
	clearInterval(timer.value)
	params.value.passWord = ''
}

const handleChangePassWord = async () => {
	if (!check()) return

	if (params.value.passWord === passWordFlag.value) {
		const data = await forgetPass({
			phone: params.value.phone,
			password: params.value.passWord,
			code: params.value.code,
		})

		if (data.code === 200) {
			ElMessage.success('修改成功')
			type.value = 'password'
		} else {
			ElMessage.error(data.msg)
		}

		// handleLogin()
	} else {
		ElMessage.error('两次密码不一致')
	}
}

const handleKeepLogin = () => {
	if (params.value.keepLogin) {
		const phone = window.atob(getFlagItme('phone'))
		const password = window.atob(getFlagItme('password'))

		params.value.phone = phone
		params.value.passWord = password
	}
}

handleKeepLogin()

watch(
	() => [params.value.keepLogin, type.value],
	(newValues, oldValues) => {
		setFlagItme('keepLogin', newValues[0])

		if (newValues[1] === 'code') {
			params.value.passWord = ''
		} else if (newValues[1] === 'password') {
			params.value.code = ''
		}
	},
	{ immediate: true },
)
</script>

<template>
	<div class="login">
		<div class="login-left">
			<img
				class="logo"
				src="@renderer/assets/img/login/login_logo.webp"
				alt=""
			/>

			<img
				class="main-img"
				src="@renderer/assets/img/login/login.webp"
				alt=""
			/>
		</div>
		<div class="login-right">
			<div class="top">
				<img
					src="@renderer/assets/img/login/zuixiaohua.webp"
					alt=""
					@click="Mini"
				/>
				<img src="@renderer/assets/img/login/off.webp" alt="" @click="Close" />
			</div>

			<div class="main" v-if="type !== 'forget'">
				<div class="title">
					<p>HI!</p>
					<p>欢迎登录</p>
				</div>

				<el-form
					label-width="120px"
					class="login-form"
					style="margin-top: 40px"
					@keyup.enter="handleLogin"
				>
					<el-form-item
						label="账号"
						style="margin-bottom: 30px"
						v-if="type === 'password'"
					>
						<el-input v-model="params.phone" placeholder="请输入您的账号" />
					</el-form-item>
					<el-form-item label="密码" v-if="type === 'password'">
						<el-input
							v-model="params.passWord"
							:type="iconFlag ? 'password' : 'text'"
							placeholder="请输入您的密码"
						>
							<template #suffix>
								<p class="eye">
									<img
										class="logo"
										src="@renderer/assets/img/login/eye._openwebp.webp"
										alt=""
										v-if="iconFlag"
										@click="iconFlag = !iconFlag"
									/>
									<img
										class="logo"
										src="@renderer/assets/img/login/eye_close.webp"
										alt=""
										v-else
										@click="iconFlag = !iconFlag"
									/>
								</p>
							</template>
						</el-input>
					</el-form-item>

					<el-form-item
						label="手机号"
						style="margin-bottom: 30px"
						v-if="type === 'code'"
					>
						<el-input v-model="params.phone" placeholder="请输入您的手机号" />
					</el-form-item>
					<el-form-item label="验证码" v-if="type === 'code'">
						<el-input
							v-model="params.code"
							type="text"
							placeholder="请输入手机收到的验证码"
						>
							<template #suffix>
								<p
									@click="sendCode('message_pass')"
									style="
										font-size: 14px;
										font-family: Source Han Sans CN-Normal, Source Han Sans CN;
										font-weight: 350;
										color: #4faa74;
										cursor: pointer;
										text-align: center;
										width: 74px;
									"
								>
									{{ verificationCodeFlag }}
								</p>
							</template>
						</el-input>
					</el-form-item>
				</el-form>
				<div class="login-button">
					<div class="type-password" v-if="type === 'password'">
						<p @click="params.keepLogin = !params.keepLogin">
							<span class="checkbox">
								<img
									v-if="params.keepLogin"
									src="@renderer/assets/img/login/dui.webp"
									alt=""
								/>
							</span>
							<span>保持登录</span>
						</p>

						<p>
							<span @click="type = 'code'">验证码登录</span>
							<span @click="handleForget">忘记密码？</span>
						</p>
					</div>

					<div class="type-code" v-else>
						<p @click="type = 'password'">账号登录</p>
					</div>
					<el-button @click="handleLogin">登录</el-button>
				</div>
			</div>

			<div class="forget-main" v-else>
				<div class="title" @click="type = 'password'">
					<img src="@renderer/assets/img/login/left.webp" alt="" />
					<p>忘记密码</p>
				</div>

				<el-form
					label-width="120px"
					class="login-form"
					style="margin-top: 40px"
				>
					<el-form-item label="手机号" style="margin-bottom: 30px">
						<el-input v-model="params.phone" placeholder="请输入您的手机号" />
					</el-form-item>
					<el-form-item label="验证码">
						<el-input
							v-model="params.code"
							placeholder="请输入手机收到的验证码"
						>
							<template #suffix>
								<p
									@click="sendCode('forget')"
									style="
										font-size: 14px;
										font-family: Source Han Sans CN-Normal, Source Han Sans CN;
										font-weight: 350;
										color: #4faa74;
										cursor: pointer;
										text-align: center;
										width: 74px;
									"
								>
									{{ verificationCodeFlag }}
								</p>
							</template>
						</el-input>
					</el-form-item>

					<el-form-item label="密码" style="margin-bottom: 30px">
						<el-input
							v-model="params.passWord"
							:type="forget.forgetFlagImg1 ? 'password' : 'text'"
							placeholder="请输入您的密码"
						>
							<template #suffix>
								<p class="eye">
									<img
										class="logo"
										src="@renderer/assets/img/login/eye._openwebp.webp"
										alt=""
										v-if="forget.forgetFlagImg1"
										@click="forget.forgetFlagImg1 = !forget.forgetFlagImg1"
									/>
									<img
										class="logo"
										src="@renderer/assets/img/login/eye_close.webp"
										alt=""
										v-else
										@click="forget.forgetFlagImg1 = !forget.forgetFlagImg1"
									/>
								</p>
							</template>
						</el-input>
					</el-form-item>
					<el-form-item label="确认密码">
						<el-input
							v-model="passWordFlag"
							:type="forget.forgetFlagImg2 ? 'password' : 'text'"
							placeholder="请再次输入新密码"
						>
							<template #suffix>
								<p class="eye">
									<img
										class="logo"
										src="@renderer/assets/img/login/eye._openwebp.webp"
										alt=""
										v-if="forget.forgetFlagImg2"
										@click="forget.forgetFlagImg2 = !forget.forgetFlagImg2"
									/>
									<img
										class="logo"
										src="@renderer/assets/img/login/eye_close.webp"
										alt=""
										v-else
										@click="forget.forgetFlagImg2 = !forget.forgetFlagImg2"
									/>
								</p>
							</template>
						</el-input>
					</el-form-item>
				</el-form>

				<el-button @click="handleChangePassWord">确认</el-button>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.login {
	max-width: 100%;
	overflow: hidden;
	display: flex;
	height: 100%;

	.login-left {
		width: 50%;
		height: 100%;
		background: #f1f7f3;
		padding: 21px 0 0 18px;

		.logo {
			width: 200px;
			height: 42px;
		}

		.main-img {
			width: 694px;
			height: 462px;

			margin-top: 236px;
			margin-left: 28px;
		}
	}

	.login-right {
		width: 50%;
		height: 100%;
		.top {
			padding: 15px 20px 0 0;
			display: flex;
			justify-content: end;
			img {
				width: 20px;
				height: 20px;
				margin-left: 16px;
				cursor: pointer;
			}
		}
		.main {
			margin: 170px 120px 0 100px;
			.title {
				font-size: 36px;
				font-family: Source Han Sans CN-Medium, Source Han Sans CN;
				font-weight: 500;
				color: #333333;
				line-height: 52px;
			}

			.login-form {
				.el-form-item {
					display: block;

					&:focus-within {
						:deep(.el-input__wrapper) {
							box-shadow: 0 0 0 1px #4faa74;
						}
					}

					:deep(.el-form-item__label) {
						margin: 0;
						display: block;
						font-size: 18px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #333333;
						height: 26px;
						margin-bottom: 10px;
					}

					:deep(.el-input__wrapper) {
						width: 500px;
						height: 56px;
						background: #f2f3f6;
						border-radius: 8px 8px 8px 8px;

						box-shadow: none;
						padding: 0 20px 0 20px;
					}
					:deep(.el-input__inner::placeholder) {
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
						line-height: 23px;
					}

					.eye {
						img {
							width: 20px;
							height: 20px;
							display: block;
							margin: 0 auto;
							cursor: pointer;
						}
					}
				}
			}
			.login-button {
				.type-password {
					display: flex;
					justify-content: space-between;
					margin: 20px 0 50px 0;
					p {
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
					}

					& p:first-child {
						display: flex;
						align-items: center;
						cursor: pointer;

						& span:first-child {
							margin-right: 5px;
							display: block;
							width: 14px;
							height: 14px;
							border: 1px solid #999;

							img {
								width: 100%;
								height: 100%;
								object-fit: cover;
							}
						}
					}

					& p:last-child {
						span {
							cursor: pointer;
						}
						& span:last-child {
							margin-left: 20px;
							color: #4faa74;
						}
					}
				}

				.type-code {
					margin: 20px 0 50px 0;
					text-align: right;
					p {
						cursor: pointer;
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
					}
				}

				.el-button {
					width: 500px;
					height: 56px;
					background: #4faa74;
					border-radius: 8px 8px 8px 8px;

					font-size: 18px;
					font-family: Source Han Sans CN-Medium, Source Han Sans CN;
					font-weight: 500;
					color: #ffffff;
				}
			}
		}
		.forget-main {
			margin: 94px 120px 0 100px;
			.title {
				display: flex;
				align-items: center;
				margin-bottom: 60px;
				cursor: pointer;
				img {
					width: 24px;
					height: 24px;
					margin-right: 10px;
				}
				p {
					font-size: 36px;
					font-family: Source Han Sans CN-Medium, Source Han Sans CN;
					font-weight: 500;
					color: #333333;
				}
			}

			.el-form-item {
				display: block;

				&:focus-within {
					:deep(.el-input__wrapper) {
						box-shadow: 0 0 0 1px #4faa74;
					}
				}

				:deep(.el-form-item__label) {
					margin: 0;
					display: block;
					font-size: 18px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #333333;
					height: 26px;
					margin-bottom: 10px;
				}

				:deep(.el-input__wrapper) {
					width: 500px;
					height: 56px;
					background: #f2f3f6;
					border-radius: 8px 8px 8px 8px;

					box-shadow: none;
					padding: 0 20px 0 20px;
				}
				:deep(.el-input__inner::placeholder) {
					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #999999;
					line-height: 23px;
				}

				.eye {
					img {
						width: 20px;
						height: 20px;
						display: block;
						margin: 0 auto;
						cursor: pointer;
					}
				}
			}

			.el-button {
				width: 500px;
				height: 56px;
				background: #4faa74;
				border-radius: 8px 8px 8px 8px;

				font-size: 18px;
				font-family: Source Han Sans CN-Medium, Source Han Sans CN;
				font-weight: 500;
				color: #ffffff;
				margin-top: 38px;
			}
		}
	}
}
</style>
