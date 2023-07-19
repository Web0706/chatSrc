<script setup lang="ts">
import { ref } from 'vue'
import { changePass } from '@renderer/api/login'
import { ElMessage } from 'element-plus'
import { removeToken, removetFlagItme } from '@renderer/utils/local-storage'
import router from '@renderer/router'

const centerDialogVisible = ref(false)

const userInfo = JSON.parse(localStorage.getItem('userInfo'))

const passWordFlag = ref()

const params = ref({
	phone: userInfo.phone,
	password: null,
	old_password: null,
})

const submit = async () => {
	try {
		if (!params.value.old_password) {
			return ElMessage.warning('请输入旧密码')
		}
		if (!params.value.password) {
			return ElMessage.warning('请输入新密码')
		}

		if (params.value.password !== passWordFlag.value) {
			return ElMessage.warning('两次密码不一致')
		}

		await changePass(params.value)

		ElMessage.success('修改成功,即将返回登录')

		centerDialogVisible.value = !centerDialogVisible.value

		setTimeout(() => {
			removeToken()
			removetFlagItme('userInfo')

			router.push('/login')
		}, 3000)
	} catch (_) {}
}

defineExpose({
	centerDialogVisible,
})
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		width="426px"
		align-center
		:show-close="false"
		class="pass-word"
	>
		<template #header="{ close }">
			<div class="dialog-header">
				<h3>修改密码</h3>
				<img src="@renderer/assets/layout/close.webp" alt="" @click="close" />
				<span></span>
			</div>
		</template>

		<div class="dialog-main">
			<p>
				<span>账号</span>
				<el-input :value="userInfo.phone" disabled></el-input>
			</p>
			<p>
				<span>旧密码</span>
				<el-input
					placeholder="请输入账户现在的密码"
					v-model="params.old_password"
				></el-input>
			</p>
			<p>
				<span>新密码</span>
				<el-input
					placeholder="请输入新密码"
					v-model="params.password"
				></el-input>
			</p>
			<p>
				<span>确认密码</span>
				<el-input
					placeholder="请再次输入，确认新密码"
					v-model="passWordFlag"
				></el-input>
			</p>
		</div>
		<div class="dialog-footer">
			<el-button
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
				@click="submit"
			>
				确认
			</el-button>
		</div>
	</el-dialog>
</template>

<style scoped lang="scss">
.pass-word {
	:deep(.el-dialog__header) {
		padding: 0px;
	}
	.dialog-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		position: relative;

		h3 {
			font-size: 16px;
			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			font-weight: 500;
			color: #333333;
			line-height: 23px;
		}
		img {
			position: absolute;
			top: 0;
			right: -20px;
			width: 16px;
			height: 16px;
		}

		span {
			width: 390px;
			height: 1px;
			background-color: #eeeeee;
			position: absolute;
			bottom: -10px;
			left: 0;
		}
	}

	.dialog-main {
		& p:first-child {
			:deep(.el-input__wrapper) {
				background-color: #f1f1f1;
			}
		}
		p {
			display: flex;
			margin-bottom: 15px;
			justify-content: space-between;
			align-items: center;
			span {
				display: block;
				font-size: 14px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 350;
				color: #333333;
				line-height: 20px;
				width: 68px;
				margin-right: 10px;
			}
		}
		:deep(.el-input__inner::placeholder) {
			font-size: 13px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #999999;
			line-height: 20px;
		}

		& p:last-child {
			margin-bottom: 30px;
		}
	}
	.dialog-footer {
		text-align: center;
	}
}
</style>
