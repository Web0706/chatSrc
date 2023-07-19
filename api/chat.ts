import request from '@renderer/utils/request'
import { Info, File, Tag } from './type'

// 发送消息
export const dispatchMsg = (data: any) => {
	return request({
		url: '/mess/message',
		method: 'post',
		data,
	})
}
// 获取访客列表
export const getVisitorList = (params: object) => {
	return request({
		url: '/mess/visitor_list_v2',
		method: 'get',
		params,
	})
}

// 获取访客详情信息
export const VisitorInfo = (id: any) => {
	return request<Info>({
		url: '/mess/visitor_info?visitor_id=' + id,
		method: 'get',
	})
}

// 聊天记录
export const chatRecords = (params: object) => {
	return request({
		url: '/mess/visitor_messages_v2',
		method: 'get',
		params,
	})
}

// 上传文件
export const upload = (data: object) => {
	return request<File>({
		url: '/upload',
		method: 'post',
		data,
	})
}

// 修改标签
export const editTag = (data: object) => {
	return request({
		url: '/mess/tag',
		method: 'post',
		data,
	})
}

// 获取标签列表
export const tagList = () => {
	return request<Tag>({
		url: '/mess/labels',
		method: 'get',
	})
}

// 项目客服列表
export const projectService = (params: object) => {
	return request({
		url: '/mess/proj_kefu',
		method: 'get',
		params,
	})
}

// 修改访客信息
export const setVisitorInfo = (data: object) => {
	return request({
		url: '/mess/visitor_set',
		method: 'put',
		data,
	})
}

// 邀请访客评价
export const inviteEvaluate = (data: object) => {
	return request({
		url: '/evaluate/push',
		method: 'post',
		data,
	})
}

// 设置转接人
export const setTransfer = (data: object) => {
	return request({
		url: '/transfer_visitor/set',
		method: 'put',
		data,
	})
}

//获取转接记录
export const getTransfer = (params: object) => {
	return request({
		url: '/transfer_visitor/get',
		method: 'get',
		params,
	})
}

// 行为轨迹列表
export const behaviorList = (params: object) => {
	return request({
		url: '/trajectory/trajectory',
		method: 'get',
		params,
	})
}
