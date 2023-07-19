<script setup lang="ts">
import { ref } from 'vue'
import { translate, setTranslate, translateConfig } from '@renderer/api/config'

const dialogVisible = ref(false)
const value = ref(false)

const params = ref({
	to_kefu_translate: '',
	to_visitor_translate: '',
	translate_status: null,
	visitor_id: '',
})

const translateList = ref([])

const getTranslate = async () => {
	const {
		data: { list },
	} = await translate()

	translateList.value = list
}

const getTranslateConfig = async id => {
	params.value.visitor_id = id

	const {
		data: { info },
	} = await translateConfig(id)

	if (!(info.to_kefu_translate_name && info.to_visitor_translate_name)) {
		params.value.to_kefu_translate = ''
		params.value.to_visitor_translate = ''
		params.value.translate_status = false
	} else {
		value.value = info.translate_status === 1 ? true : false
		params.value.to_kefu_translate = info.to_kefu_translate
		params.value.to_visitor_translate = info.to_visitor_translate
	}
}

const setTranslateConfig = async () => {
	params.value.translate_status = value.value ? 1 : 2

	await setTranslate(params.value)
}

getTranslate()

defineExpose({
	dialogVisible,
	getTranslateConfig,
})
</script>

<template>
	<el-dialog
		v-model="dialogVisible"
		title="翻译设置"
		width="282"
		class="translate-config"
	>
		<div class="main">
			<span class="line"></span>
			<div>
				<p>是否开启自动翻译</p>
				<el-switch
					v-model="value"
					style="
						--el-switch-on-color: #13ce66;
						margin-bottom: 0;
						position: absolute;
						top: 1px;
						right: 0;
					"
					@change="setTranslateConfig"
				/>
			</div>
			<div>
				<p>对访客显示</p>
				<el-select
					placeholder="请选择"
					v-model="params.to_visitor_translate"
					@change="setTranslateConfig"
				>
					<el-option
						v-for="item in translateList"
						:key="item.translate_key"
						:label="item.translate_name"
						:value="item.translate_key"
					/>
				</el-select>
			</div>
			<div>
				<p>对客服显示</p>
				<el-select
					placeholder="请选择"
					v-model="params.to_kefu_translate"
					@change="setTranslateConfig"
				>
					<el-option
						v-for="item in translateList"
						:key="item.translate_key"
						:label="item.translate_name"
						:value="item.translate_key"
					/>
				</el-select>
			</div>
		</div>
	</el-dialog>
</template>

<style scoped lang="scss">
.translate-config {
	.main {
		position: relative;
		margin-top: -10px;

		.line {
			position: absolute;
			display: block;
			width: 242px;
			height: 1px;
			background-color: #eee;
			left: 0;
			top: -20px;
		}
		div {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			margin-bottom: 20px;
			height: 32px;
			p {
				font-size: 14px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 350;
				color: #333333;
				line-height: 20px;
			}

			:deep(.el-input__wrapper) {
				width: 120px;
				height: 32px;
				background: #f2f3f6;
				border-radius: 16px;
			}
		}

		& div:nth-child(2) {
			margin-bottom: 14px;
		}
	}
}
</style>
