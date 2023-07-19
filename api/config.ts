import request from '@renderer/utils/request'

// 获取自动回复
export const autoReply = () => {
	return request({
		url: '/auto_reply/get',
		method: 'get',
	})
}

// 设置自动回复
export const setAutoReply = (data: object) => {
	return request({
		url: '/auto_reply/save',
		method: 'post',
		data,
	})
}

// 获取翻译字典
export const translate = () => {
	return request({
		url: '/translate/translate_config',
		method: 'get',
	})
}

// 修改、设置翻译语言
export const setTranslate = (data: object) => {
	return request({
		url: '/translate/translate_set',
		method: 'put',
		data,
	})
}

// 获取翻译配置
export const translateConfig = id => {
	let flag = `?visitor_id=${id}`

	return request({
		url: `/translate/get_translate_config${id ? flag : ''}`,
		method: 'get',
	})
}

// 快捷回复列表
export const quickReply = (params: object) => {
	return request({
		url: '/settings/phrases',
		method: 'get',
		params,
	})
}

// 添加修改  快捷回复
export const setQuickReply = (data: object) => {
	return request({
		url: '/settings/phrases',
		method: 'post',
		data,
	})
}

// 删除快捷回复
export const delQuickReply = params => {
	return request({
		url: `/settings/phrases`,
		method: 'delete',
		params,
	})
}
