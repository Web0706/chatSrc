import request from '@renderer/utils/request'

// 获取访客列表
export function visitorList(params: object) {
	return request({
		url: '/customer/customer_lib',
		method: 'get',
		params,
	})
}

// 标签列表
export function labelList() {
	return request({
		url: '/customer/labels',
		method: 'get',
		params: {
			page: 1,
			page_size: 9999,
		},
	})
}

// 跟进状态列表
export function followStatusList() {
	return request({
		url: '/customer/follow_status',
		method: 'get',
		params: {
			page: 1,
			page_size: 9999,
			status: 2,
		},
	})
}

// 渠道组件列表
export function componentList(params: object) {
	return request({
		url: '/customer/widget',
		method: 'get',
		params,
	})
}

// 客户信息修改
export function editVisitorInfo(data: object) {
	return request({
		url: '/customer/customer',
		method: 'put',
		data,
	})
}

// 获取在线访客数
export function onlineVisitorCount(proj_id: number) {
	return request({
		url: '/customer/customer_count?proj_id=' + proj_id,
		method: 'get',
	})
}
