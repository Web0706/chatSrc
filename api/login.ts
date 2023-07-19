import request from '@renderer/utils/request'

// 登录
export function login(data: object) {
	return request({
		url: '/login',
		method: 'post',
		data,
	})
}

// 获取验证码
export function Code(data: object) {
	return request({
		url: '/send_sms',
		method: 'post',
		data,
	})
}

// 忘记密码
export function forgetPass(data: object) {
	return request({
		url: '/forget_pass',
		method: 'put',
		data,
	})
}

// 修改密码
export function changePass(data: object) {
	return request({
		url: '/change_pass',
		method: 'put',
		data,
	})
}

// 修改客服在线状态
export function changeServiceOnLineStatus(data: object) {
	return request({
		url: '/user_line',
		method: 'put',
		data,
	})
}
