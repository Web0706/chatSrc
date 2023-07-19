import request from '@renderer/utils/request'
import type { Statistics } from './type'
// 获取统计信息
export function statistics(params: object) {
	return request<Statistics>({
		url: '/statistics/statistics_info',
		method: 'get',
		params,
	})
}
