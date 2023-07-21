<script setup lang="ts">
import { ref } from 'vue'
import { Team } from './type'
import router from '@renderer/router'
import { useUserStore } from '@renderer/store/modules/user'
import { useChatStore } from '@renderer/store/modules/chat'
import { storeToRefs } from 'pinia'
const { shell } = require('electron')

const { sumMessages, workOrder } = storeToRefs(useChatStore())

const project = ref({
  name: '项目名称',
  id: 0,
})
const alertFlag = ref(false)

const UserStore = useUserStore()

const projectTeam = ref<Team[]>([])

projectTeam.value = UserStore.userInfo.user_project
project.value.id = UserStore.userInfo.user_project[0].id
project.value.name = UserStore.userInfo.user_project[0].proj_nane

const handleAlertFlag = item => {
  if (item) {
    project.value.name = item.proj_nane
    UserStore.setProjectId(item.id)
  }

  alertFlag.value = !alertFlag.value
}
const handleMessage = (path: string) => {
  if (path === '/chat') {
    UserStore.changeActive(2)
  } else {
    UserStore.changeActive(3)
  }

  router.push({
    path: 'WorkOrder',
    query: {
      id: 1,
    },
  })
}

const openOfficialWebsite = () => {
  shell.openExternal('https://baidu.com')
}
</script>

<template>
  <div class="nav-title">
    <div class="message">
      <p @click="handleMessage('/chat')">
        <img src="@renderer/assets/layout/message.webp" alt="" />
        <span>未读消息</span>
        <span v-show="sumMessages.all_num">{{ sumMessages.all_num }}</span>
      </p>
      <p @click="handleMessage('/WorkOrder')">
        <img src="@renderer/assets/layout/untreated.webp" alt="" />
        <span>未处理工单</span>
        <span v-show="workOrder">{{ workOrder }}</span>
      </p>
      <p class="warn" @click="openOfficialWebsite">
        <img src="@renderer/assets/layout/warn.webp" alt="" />
        <span>重要通知</span>
      </p>
    </div>
    <div class="user-info">
      <div class="company">
        <img src="@renderer/assets/layout/company.webp" alt="" />
        <span>{{ UserStore.userInfo.company_name }}</span>
      </div>
      <div class="project">
        <div class="main" @click="handleAlertFlag(false)">
          <img src="@renderer/assets/layout/xiangmu.webp" alt="" />
          <span>{{ project.name }}</span>
          <img
            :class="{ active: alertFlag }"
            src="@renderer/assets/layout/gengduo_jiantou.webp"
            alt=""
          />
        </div>
        <Transition name="fade" mode="out-in">
          <ul class="alert" v-if="alertFlag">
            <li
              class="alert-item"
              v-for="item in projectTeam"
              :key="item.id"
              @click="handleAlertFlag(item)"
            >
              {{ item.proj_nane }}
            </li>
          </ul>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.nav-title {
  width: 100%;
  /* prettier-ignore */
  height: 60PX;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .message {
    // width: 414PX;
    display: flex;
    align-items: center;
    /* prettier-ignore */
    padding-left: 30PX;

    & p:nth-child(2) {
      /* prettier-ignore */
      margin-left: 30PX;
      margin-right: 30px;
    }

    .warn {
      width: 100px;
      height: 30px;
      padding: 0 6px;
      background: #ffdddd;
      border-radius: 129px 129px 129px 129px;
      border: 1px solid #ff0000;
      text-align: center;
      line-height: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      img {
        width: 20px;
        height: 20px;
      }
      & span:last-child {
        font-size: var(--font-size-12);
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 500;
        color: #ff0000;

        background-color: #ffdddd;
        color: #ff0000;
      }
    }

    p {
      display: flex;
      align-items: center;
      cursor: pointer;
      & span:nth-child(2) {
        /* prettier-ignore */
        font-size: var(--font-size-14);
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #333333;
        /* prettier-ignore */
        margin-right: 5PX;
      }

      & span:last-child {
        /* prettier-ignore */
        height: 14PX;
        background: #ff0000;
        /* prettier-ignore */
        border-radius: 14PX;
        text-align: center;
        box-sizing: border-box;
        padding: 0 4px 0 4px;
        /* prettier-ignore */
        font-size: var(--font-size-12);
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #ffffff;
        /* prettier-ignore */
        line-height: 14PX;
      }
      img {
        /* prettier-ignore */
        width: 20PX;
        /* prettier-ignore */
        height: 20PX;
        /* prettier-ignore */
        margin-right: 5PX;
      }
    }
  }
  .user-info {
    /* prettier-ignore */
    width: 340PX;
    display: flex;
    align-items: center;
    span {
      /* prettier-ignore */
      font-size: var(--font-size-12);
      font-family: Source Han Sans CN-Normal, Source Han Sans CN;
      font-weight: 350;
      color: #333333;
    }
    .company {
      /* prettier-ignore */
      width: 160PX;
      background: #f0f2f5;
      /* prettier-ignore */
      border-radius: 100PX 100PX 100PX 100PX;

      display: flex;
      align-items: center;
      justify-content: space-between;
      /* prettier-ignore */
      margin-right: 20PX;
      span {
        /* prettier-ignore */
        width: 110PX;
        overflow: hidden;
        /*文本不会换行*/
        white-space: nowrap;
        /*当文本溢出包含元素时，以省略号表示超出的文本*/
        text-overflow: ellipsis;
      }
    }
    .project {
      display: flex;
      align-items: center;
      cursor: pointer;
      .main {
        /* prettier-ignore */
        width: 140PX;
        background: #f0f2f5;
        /* prettier-ignore */
        border-radius: 100PX 100PX 100PX 100PX;
        display: flex;
        align-items: center;
        justify-content: space-between;

        & img:first-child {
          /* prettier-ignore */
          width: 18PX;
          /* prettier-ignore */
          height: 18PX;
        }

        & span:nth-child(2) {
          /* prettier-ignore */
          margin: 0 10PX 0 10PX;
        }

        & img:last-child {
          /* prettier-ignore */
          width: 10PX;
          /* prettier-ignore */
          height: 10PX;
          transition: transform 0.5s ease;
        }

        .active {
          transform: rotate(180deg);
        }
      }
      .alert {
        box-sizing: border-box;
        z-index: 3;
        /* prettier-ignore */
        width: 140PX;

        /* prettier-ignore */
        padding: 10PX;
        text-align: center;
        position: absolute;

        /* prettier-ignore */
        top: 104PX;
        /* prettier-ignore */
        right: 6PX;

        background: #ffffff;
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
        border-radius: 10px 10px 10px 10px;

        .alert-item {
          /* prettier-ignore */
          width: 120PX;
          /* prettier-ignore */
          height: 30PX;
          /* prettier-ignore */
          line-height: 30PX;
          background: #ffffff;
          border-radius: 6px 6px 6px 6px;
          margin-bottom: 4px;
          cursor: pointer;

          font-size: 14px;
          font-family: Source Han Sans CN-Normal, Source Han Sans CN;
          font-weight: 350;
          color: #333333;
        }
        .alert-item:hover {
          background-color: #e5ffef;
        }
      }
    }

    div {
      box-sizing: border-box;
      /* prettier-ignore */
      height: 32PX;
      /* prettier-ignore */
      padding: 7PX 10PX 7PX 10PX;
      img {
        /* prettier-ignore */
        width: 18PX;
        /* prettier-ignore */
        height: 18PX;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
