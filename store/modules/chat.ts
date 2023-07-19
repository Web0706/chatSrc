import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Message {
	name: string
	avator: string
	id: string
	visitor_id: string
	kefu_id: string
	group: string
	time: string
	to_id: string
	from_id: string
	content: string
	city: string
	client_ip: string
	refer: string
	is_kefu: string
	translation: string
	msg_id: number
	time_stamp: number
	size: string
	read: boolean
	pc_msg_id: string
	type: number
	robot_response_type: number
	translate_status: boolean
	is_img?: boolean
	is_file?: boolean
}

export const useChatStore = defineStore('chat', () => {
	const messageList = ref([])

	const visitorOnlineList = ref([])

	const sumMessages = ref({
		all_num: 0,
		res_num: 0,
		un_res_num: 0,
	})

	const workOrder = ref(0)

	const readVisitorId = ref('')

	const setWorkOrder = (sum: number) => {
		workOrder.value = sum
	}

	const setSumMessages = (data: any) => {
		for (let key in data) {
			// if (data[key] <= 0) {
			// 	data[key] = 0
			// } else

			if (data[key] <= 99) {
				data[key] = data[key]
			} else {
				data[key] = '99+'
			}
		}

		sumMessages.value = data
	}

	const addMessage = (msg: Message) => {
		msg.translate_status = false

		messageList.value.push(msg)
	}

	const resetList = (data: Array<any>) => {
		messageList.value = []

		messageList.value = data
	}

	const addChatRecord = (data: Array<any>) => {
		messageList.value = [...data, ...messageList.value]
	}

	const addVisitorOnlineList = (num: number | string) => {
		visitorOnlineList.value.push(num)
	}

	const setReadVisitorId = () => {
		readVisitorId.value = `${+new Date()}`
	}
	return {
		messageList,
		sumMessages,
		workOrder,
		visitorOnlineList,
		readVisitorId,
		addMessage,
		resetList,
		setSumMessages,
		setWorkOrder,
		addChatRecord,
		addVisitorOnlineList,
		setReadVisitorId,
	}
})
