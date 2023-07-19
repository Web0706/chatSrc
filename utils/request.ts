import axios, { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@renderer/utils/local-storage'
import router from '@renderer/router'

const serves = axios.create({
	baseURL: __CONFIG__.API_HOST,
	timeout: 5000,
})

// 设置请求发送之前的拦截器
serves.interceptors.request.use(
	config => {
		// 设置发送之前数据需要做什么处理
		const token = getToken()
		if (token) {
			config.headers['token'] = token
		}

		return config
	},
	err => Promise.reject(err),
)

// 设置请求接受拦截器
serves.interceptors.response.use(
	res => {
		// 设置接受数据之后，做什么处理
		if (res.data.code === 11008) {
			ElMessage.error(res.data.msg)

			removeToken()

			router.push('/login')
		}
		return res.data
	},
	err => {
		// 判断请求异常信息中是否含有超时timeout字符串
		if (err.message.includes('timeout')) {
			console.log('错误回调', err)
			ElMessage.error('网络超时')
		}
		if (err.message.includes('Network Error')) {
			console.log('错误回调', err)
			ElMessage.error('服务端未启动，或网络连接错误')
		}
		return Promise.reject(err)
	},
)

export interface BaseDataStruct<T> {
	code: number
	data: T
	msg: string
}

const requestPlus = async <D = any, T = any>(
	params: AxiosRequestConfig<T>,
): Promise<BaseDataStruct<D>> => {
	return await serves(params)
}

// 将serves抛出去
export default requestPlus
