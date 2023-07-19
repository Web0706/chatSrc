import request from '@renderer/utils/request'

// 访客评价
export const appraiseList = (params: object) => {
	return request({
		url: '/evaluate/list',
		method: 'get',
		params,
	})
}
