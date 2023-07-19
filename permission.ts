import router from './router'
import Performance from '@renderer/utils/performance'
import { getToken } from '@renderer/utils/local-storage'

var end = null
const whiteList = ['/login', '/404'] // no redirect whitelist

router.beforeEach((to, from, next) => {
	end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) /// 路由性能监控
	const token = getToken()
	if (token) {
		next()
	} else {
		// 如果没有 Token
		if (whiteList.indexOf(to.path) !== -1) {
			// 如果在免登录的白名单中，则直接进入
			next()
		} else {
			// 其他没有访问权限的页面将被重定向到登录页面
			next('/login')
		}
	}

	setTimeout(() => {
		end()
	}, 0)
})

router.afterEach(() => {})
