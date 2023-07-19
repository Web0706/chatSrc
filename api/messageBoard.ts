import request from '@renderer/utils/request'

// 留言列表
export const boardList = params => {
	return request({
		url: '/leave/list',
		method: 'get',
		params,
	})
}

// 留言已读
export const readBoard = data => {
	return request({
		url: '/leave/read',
		method: 'put',
		data,
	})
}

// 意见反馈
export const feedBack = (data: object) => {
	return request({
		url: '/leave/feedback',
		method: 'post',
		data,
	})
}
