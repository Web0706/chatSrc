import request from '@renderer/utils/request'
import { AllData, Dictionary } from './type'

// 工单列表
export function orderList(params: object) {
	return request<AllData>({
		url: '/work/order_list',
		method: 'get',
		params,
	})
}

// 新建工单
export function addOrder(data: object) {
	return request({
		url: '/work/order_new',
		method: 'post',
		data,
	})
}

// 修改工单
export function editOrder(data: object) {
	return request({
		url: '/work/take_order',
		method: 'put',
		data,
	})
}

// 工单数据总览
export function orderOverView(params: object) {
	return request({
		url: '/work/statistics',
		method: 'get',
		params,
	})
}

// 工单详情
export function orderDetail(id: number) {
	return request({
		url: '/work/order_detail?id=' + id,
		method: 'get',
	})
}

// 工单处理状态字典
export function orderStatus() {
	return request<Dictionary[]>({
		url: '/work/order_status_config',
		method: 'get',
	})
}

// 工单类型字典
export function orderType() {
	return request<AllData>({
		url: '/work/order_type_config',
		method: 'get',
	})
}

// 工单优先级字典
export function orderPriority() {
	return request<Dictionary[]>({
		url: '/work/order_priority_config',
		method: 'get',
	})
}

// 个人统计数量
export const orderCount = (id: number | any) => {
	return request({
		url: '/work/work_num_count?project_id=' + id,
	})
}
