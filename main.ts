import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 引入全局样式重置css
import '@renderer/assets/css/reser.css'
import '@renderer/assets/css/main.scss'
import '@renderer/assets/css/variables.scss'

import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'

const app = createApp(App)
const store = createPinia()
app.use(ElementPlus, {
	locale: zhCn,
})
app.use(router)
app.use(store)

errorHandler(app)

app.mount('#app')
;(window as any).ChatScrollToBottom = (): void => {
	const chatBox = document.querySelector('.user-chat')

	nextTick(() => {
		chatBox.scrollTop = chatBox.scrollHeight
	})
}
