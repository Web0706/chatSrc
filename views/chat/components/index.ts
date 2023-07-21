import ReWebSocket from 'reconnecting-websocket'
import { watch, ref } from 'vue'
import { useChatStore } from '@renderer/store/modules/chat'
import { useUserStore } from '@renderer/store/modules/user'
import { getToken } from '@renderer/utils/local-storage'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()

const userStore = storeToRefs(useUserStore())
const time = ref(null)
const ws = ref(null)
let count = 0

const initWs = () => {
  ws.value = new ReWebSocket(
    `${__CONFIG__.BASR_WSURL}/im/ws_kefu?platform=client&project_id=${
      userStore.projectId.value
    }&token=${getToken()}`
  )

  ws.value.onopen = () => {
    time.value = setInterval(() => {
      ws.value.send(
        JSON.stringify({
          type: 'kefuPing',
          data: {
            id: userStore.userInfo.value.secret,
            project_id: `${userStore.projectId.value}`,
          },
          platform: 'client',
        })
      )
    }, 4000)
  }

  ws.value.onmessage = ({ data }) => {
    const res = JSON.parse(data)

    if (res.type === 'message') {
      if (res.data.content.includes('img[')) {
        res.data.is_img = true
        // res.data.content = res.data.content.replace('img[', '').replace(']', '')
      } else if (res.data.content.includes('file[')) {
        res.data.is_file = true
        // res.data.content = res.data.content
        // .replace('file[', '')
        // .replace(']', '')
      }

      chatStore.addMessage(res.data)
      ;(window as any).ChatScrollToBottom()

      if (res.data.type === 5) {
        count++
        chatStore.addVisitorOnlineList(count)
      }

      if (res.data.type === 6) {
        chatStore.addVisitorOnlineList(res.data.visitor_id)
      }
    }

    if (res.type === 'message_num') {
      chatStore.setSumMessages({
        all_num: res.data.all_num,
        res_num: res.data.res_num,
        un_res_num: res.data.un_res_num,
      })
    }

    if (res.type === 'read_time' && res.data.is_kefu !== 'yes') {
      chatStore.setReadVisitorId()
    }
  }

  ws.value.onclose = () => {
    console.log('客户端主动断开')
  }
}

export const readMessage = (to_id: string) => {
  ws.value.send(
    JSON.stringify({
      type: 'kefureadtime',
      data: {
        from: userStore.userInfo.value.secret,
        to: to_id,
        msgId: 0,
      },
      platform: 'web',
    })
  )
}

initWs()

watch(userStore.projectId, (newVal, oldVal) => {
  ws.value.close()
  clearInterval(time.value)

  initWs()
})
