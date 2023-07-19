<template>
	<div
		class="window-title"
		v-if="!IsUseSysTitle && isNotMac && !IsWeb"
		@dbclick="MixOrReduction"
	>
		<!-- 软件logo预留位置 -->
		<div style="-webkit-app-region: drag" class="logo">
			<img src="@renderer/assets/layout/logo.png" class="icon-logo" />
		</div>

		<div class="controls-container">
			<div class="windows-icon-bg" @click="Mini">
				<img src="@renderer/assets/layout/zuixiaohua.webp" class="icon-size" />
			</div>
			<div class="windows-icon-bg" @click="MixOrReduction">
				<img
					v-if="mix"
					src="@renderer/assets/layout/suoxiao.webp"
					class="icon-size"
				/>
				<img
					v-else
					src="@renderer/assets/layout/quanping.webp"
					class="icon-size"
				/>
			</div>
			<div class="windows-icon-bg close-icon" @click="Close">
				<img src="@renderer/assets/layout/off.webp" class="icon-size" />
			</div>
		</div>
	</div>
	<div v-else-if="!IsUseSysTitle && !isNotMac" class="window-title"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { removeToken, getToken } from '@renderer/utils/local-storage'
const { ipcRenderer } = require('electron')

const IsUseSysTitle = ref(false)
const mix = ref(false)
const isNotMac = ref(process.platform !== 'darwin')
const IsWeb = ref(process.env.BUILD_TARGET)

ipcRenderer.invoke('IsUseSysTitle').then(res => {
	IsUseSysTitle.value = res
})

const Mini = () => {
	ipcRenderer.invoke('windows-mini')
}
const MixOrReduction = () => {
	ipcRenderer.invoke('window-max').then(res => {
		mix.value = res.status
	})
}
const Close = () => {
	removeToken()

	ipcRenderer.invoke('window-close')
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.window-title {
	width: 100%;
	/* prettier-ignore */
	height: 50PX;
	background-color: #4faa74;
	display: flex;
	align-items: center !important;
	justify-content: space-between;
	position: fixed;
	top: 0;
	z-index: 999;

	.icon-logo {
		/* prettier-ignore */
		width: 124PX;
		/* prettier-ignore */
		height: 30PX;
	}

	.logo {
		margin-left: 20px;
		flex: 1;
	}
	.controls-container {
		display: flex;
		flex-grow: 0;
		flex-shrink: 0;
		text-align: center;
		position: relative;
		z-index: 3000;
		-webkit-app-region: no-drag;
		height: 100%;
		width: 156px;
		padding-right: 20px;

		& div:first-child {
			margin-right: 4px;
		}

		.windows-icon-bg {
			display: flex;

			-webkit-app-region: no-drag;
			height: 100%;
			width: 33.34%;
			color: rgba(129, 129, 129, 0.6);
			align-items: center;
			justify-content: center;
			.icon-size {
				/* prettier-ignore */
				width: 20PX;
				/* prettier-ignore */
				height: 20PX;
				vertical-align: -0.15em;
				fill: currentColor;
				overflow: hidden;
			}
		}
		.windows-icon-bg:hover {
			background-color: rgba(182, 182, 182, 0.2);
			color: #333;
		}
		.close-icon:hover {
			background-color: rgba(232, 17, 35, 0.9);
			color: #fff;
		}
	}
}
</style>
