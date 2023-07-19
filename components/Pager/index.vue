<script setup lang="ts">
defineProps<{
	total: number
}>()

const current = 10

const page = 1
const emit = defineEmits(['change'])

const handleSizeChange = size => {
	emit('change', { type: 'page_size', value: size })
}
const handleCurrentChange = current => {
	emit('change', { type: 'page', value: current })
}
</script>

<template>
	<el-pagination
		:model-value:current-page="current"
		:model-value:page-size="page"
		:page-sizes="[10, 20, 30, 50]"
		layout="total, sizes, prev, pager, next, jumper"
		:total="total"
		small
		@size-change="handleSizeChange"
		@current-change="handleCurrentChange"
	/>
</template>

<style scoped lang="scss">
:deep(.el-input__wrapper) {
	border-radius: 2px;
	padding: 1px 10px;
}
</style>
