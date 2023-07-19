<script setup lang="ts">
const props = defineProps({
	list: {
		type: Array,
		default: () => [],
	},
})
</script>

<template>
	<el-table
		:data="list"
		:header-cell-style="{
			background: '#F1F3F5',
			color: '#999999',
			fontSize: '12px',
			fontFamily: 'Source Han Sans CN-Normal, Source Han Sans CN',
			fontWeight: '350',
			height: '40px',
		}"
		:row-style="{
			height: '54px',
			fontSize: '12px',
			fontFamily: 'Source Han Sans CN-Normal, Source Han Sans CN',
			fontWeight: '350',
			color: '#333333',
		}"
		highlight-current-row
	>
		<slot></slot>
	</el-table>
</template>

<style scoped lang="scss">
:deep(.el-table__body-wrapper)::-webkit-scrollbar {
	width: 8px; /* 横向滚动条 */
	height: 8px; /* 纵向滚动条 必写 */
}
/* 设置滚动条样式 */
:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
	background-color: #dde;
	border-radius: 3px;
}

.el-table {
	:deep(.cell) {
		padding-left: 20px;
	}

	:deep(.el-table__header-wrapper) {
		border-radius: 8px 8px 0 0;
	}

	:deep(.el-table__body) {
		tr.current-row > td.el-table__cell {
			background-color: #edf6f1 !important;
		}
	}
}
</style>
