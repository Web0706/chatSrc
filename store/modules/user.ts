import { ref } from 'vue'
import store from '@renderer/store'
import { defineStore } from 'pinia'
import {
	getToken,
	removeToken,
	setFlagItme,
	getFlagItme,
} from '@renderer/utils/local-storage'
import { UserInfo } from './type'

export const useUserStore = defineStore('user', () => {
	const token = ref<string>(getToken() || '')

	const userColor = ref('#60E797')

	const projectId = ref<number>(JSON.parse(getFlagItme('ProjectId')) || 0)

	const userInfo = ref<UserInfo>(
		JSON.parse(localStorage.getItem('userInfo') || '{}'),
	)
	const active = ref(2)

	const changeActive = (index: number) => {
		active.value = index
	}

	const setUserInfo = (UserInfo: any) => {
		userInfo.value = UserInfo.user_info
		token.value = UserInfo.token
		setProjectId(UserInfo.user_project?.[0].id)
	}

	const setProjectId = (id: number) => {
		projectId.value = id
		setFlagItme('ProjectId', id)
	}

	const setUserColor = (value: string) => {
		userColor.value = value
	}

	/** 重置 Token */
	const resetToken = () => {
		removeToken()
		token.value = ''
	}

	return {
		token,
		active,
		userInfo,
		projectId,
		userColor,
		changeActive,
		resetToken,
		setUserInfo,
		setProjectId,
		setUserColor,
	}
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
	return useUserStore(store)
}
