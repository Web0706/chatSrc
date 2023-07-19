<script setup lang="ts">
import { ref } from 'vue'
import { feedBack } from '@renderer/api/messageBoard'
import { upload } from '@renderer/api/chat'
import { ElMessage } from 'element-plus'

interface FeedBack {
	kefu_id: number
	project_id: number
	result_desc: string
	email: string
	images: { image: string }[]
}

const params = ref<FeedBack>({
	kefu_id: null,
	project_id: null,
	result_desc: null,
	email: null,
	images: [],
})

const imgs = ref([])

const ruleFormRef = ref()

const validateEmail = () => {
	const reg = /^([a-zA-Z0-9]+[-_\.]?)+@[a-zA-Z0-9]+\.[a-z]+$/
	if (!reg.test(params.value.email)) {
		return Promise.reject(new Error('请输入正确的邮箱'))
	}
	return Promise.resolve()
}

const rules = ref({
	result_desc: [
		{ required: true, message: '请输入意见', trigger: 'blur' },
		{ min: 1, max: 200, message: '不能超过200个字', trigger: 'blur' },
	],
	email: [
		{
			validator: validateEmail,
			trigger: 'blur',
		},
		{ required: true, message: '请输入意见', trigger: 'blur' },
	],
})

const props = defineProps<{
	backDialogVisible: boolean
}>()

const emit = defineEmits(['BackUpdate'])

const handleClose = () => {
	params.value = {
		kefu_id: null,
		project_id: null,
		result_desc: null,
		email: null,
		images: [],
	}

	ruleFormRef.value.resetFields()
	emit('BackUpdate', false)
}

const handleUpImg = async (e: any) => {
	const file = e.target.files[0]

	const formDate = new FormData()

	formDate.append('file', file)

	const {
		data: {
			file_info: { file_url },
		},
	} = await upload(formDate)

	const obj = {
		image: file_url,
	}
	imgs.value.push(obj)
}

const delImg = index => {
	imgs.value.splice(index, 1)
}

const submit = async () => {
	try {
		await ruleFormRef.value.validate()

		params.value.images = imgs.value

		await feedBack(params.value)

		ElMessage.success('提交成功,感谢您的宝贵意见!')
		handleClose()
	} catch (error) {}
}
</script>

<template>
	<el-dialog
		:model-value="backDialogVisible"
		title="YoutoChat意见反馈"
		width="30%"
		class="feed-back"
		:before-close="handleClose"
	>
		<el-form
			label-width="auto"
			label-position="left"
			ref="ruleFormRef"
			:model="params"
			:rules="rules"
		>
			<el-form-item label="具体意见内容：" prop="result_desc">
				<el-input
					type="textarea"
					:rows="8"
					placeholder="请输入您的意见内容（200字以内）"
					maxlength="30"
					v-model="params.result_desc"
				></el-input>
			</el-form-item>

			<el-form-item label="您的电子邮箱：" prop="email">
				<el-input
					placeholder="请输入您的电子邮箱号"
					v-model="params.email"
				></el-input>
			</el-form-item>
			<el-form-item label="添加图片：" style="position: relative">
				<div class="show-img">
					<img
						v-for="(item, index) in imgs"
						:key="index"
						:src="item.image"
						alt=""
						@click="delImg(index)"
					/>
				</div>

				<label for="up-img" v-if="imgs.length !== 3">
					<img
						src="@renderer/assets/img/chat/upload.png"
						alt=""
						class="upload"
					/>
				</label>
				<span class="tip">(最多添加3张图片)</span>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer" style="text-align: center; display: block">
				<el-button
					@click="handleClose"
					style="
						width: 140px;
						height: 40px;
						border-radius: 8px 8px 8px 8px;
						border: 1px solid #4faa74;
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #4faa74;
						line-height: 20px;
					"
					>取消</el-button
				>
				<el-button
					type="primary"
					@click="submit"
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
				>
					提交
				</el-button>
			</span>
		</template>

		<input
			type="file"
			style="display: none"
			id="up-img"
			@change="handleUpImg"
		/>
	</el-dialog>
</template>

<style scoped lang="scss">
.feed-back {
	.el-form-item {
		display: block;

		.show-img {
			img {
				width: 100px;
				height: 100px;
				border-radius: 8px;

				object-fit: cover;
				margin-right: 20px;
				cursor: pointer;
			}
		}

		.upload {
			width: 100px;
			height: 100px;
			object-fit: cover;
			cursor: pointer;
		}

		:deep(.el-form-item__label) {
			font-size: 14px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #000;
		}

		.el-textarea {
			width: 100%;
			height: 100%;
			:deep(.el-textarea__inner) {
				box-shadow: none;
				resize: none;
				padding-left: 10px;
				border: 1px solid #dddddd;
				border-radius: 8px;
			}

			::-webkit-scrollbar {
				width: 6px;
			}

			::-webkit-scrollbar-thumb {
				background: #dddddd;
				border-radius: 10px;
			}

			::-webkit-scrollbar-track {
				background: transparent;
			}
		}

		.avatar-uploader {
			.upload {
				width: 88px;
				height: 88px;
			}
		}

		.tip {
			position: absolute;
			left: -112px;
			top: 28px;
			font-size: 12px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #999999;
			line-height: 17px;
		}
	}

	& .el-form-item:last-child {
		display: flex;
	}
}
</style>
