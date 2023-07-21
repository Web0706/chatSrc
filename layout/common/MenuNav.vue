<script setup lang="ts">
import { ref } from 'vue'
import home from '@renderer/assets/layout/home.webp'
import order from '@renderer/assets/layout/order.webp'
import chat from '@renderer/assets/layout/chat.webp'
import board from '@renderer/assets/layout/board.webp'
import appraise from '@renderer/assets/layout/appraise.webp'
import config from '@renderer/assets/layout/config.webp'
import on_line from '@renderer/assets/layout/on_line.webp'

// active
import home_active from '@renderer/assets/layout/home_active.webp'
import order_active from '@renderer/assets/layout/order_active.webp'
import chat_active from '@renderer/assets/layout/chat_active.webp'
import board_active from '@renderer/assets/layout/board_active.webp'
import appraise_active from '@renderer/assets/layout/appraise_active.webp'
import config_active from '@renderer/assets/layout/config_active.webp'
import on_line_active from '@renderer/assets/layout/on_line_active.webp'

import { NavItem } from './type'

import UpdateDialog from '../components/UpdateDialog.vue'
import FeedBack from '../components/FeedBack.vue'

import UserStatus from '../components/UserStatus.vue'
import UserInfo from '../components/UserInfo.vue'
import PassWordDia from '../components/PassWordDia.vue'

import { useUserStore } from '@renderer/store/modules/user'
import { storeToRefs } from 'pinia'

const UserStore = useUserStore()

const { userColor } = storeToRefs(UserStore)

const { shell } = require('electron')
const navList = ref<NavItem[]>([
  {
    id: 1,
    name: '主页',
    path: '/',
    img: home,
    activeImg: home_active,
  },
  {
    id: 2,
    name: '聊天',
    path: '/chat',
    img: chat,
    activeImg: chat_active,
  },
  {
    id: 3,
    name: '工单',
    path: '/WorkOrder',
    img: order,
    activeImg: order_active,
  },
  {
    id: 4,
    name: '在线访客',
    path: '/onLine',
    img: on_line,
    activeImg: on_line_active,
  },
  {
    id: 5,
    name: '留言板',
    path: '/MessageBoard',
    img: board,
    activeImg: board_active,
  },
  {
    id: 6,
    name: '访客评价',
    path: '/appraise',
    img: appraise,
    activeImg: appraise_active,
  },
  {
    id: 7,
    name: '设置',
    path: '/config',
    img: config,
    activeImg: config_active,
  },
])

const dialog = ref(null)

const status = ref(false)
const info = ref(false)

const dialogVisible = ref(false)
const backDialogVisible = ref(false)

const handleActive = (id: number) => {
  UserStore.changeActive(id)
}

// 点击头像事件
const handelUserStatus = () => {
  status.value = !status.value
}

// 点击个人信息
const handleUserStatusChange = () => {
  info.value = !info.value
  status.value = !status.value
}

// 点击个人信息取消，确定
const handleUserInfoChange = () => {
  info.value = !info.value
}

const changePassWord = () => {
  status.value = !status.value

  dialog.value.centerDialogVisible = true
}

const handleUpdate = (value: boolean) => {
  if (value) {
    // 唤起谷歌浏览器 打开官网下载页面
    shell.openExternal('https://yunlogin.com/')
  }
  dialogVisible.value = false
}

const handleBackUpdate = (value: boolean) => {
  if (value) {
  }
  backDialogVisible.value = false
}

const changeUserStatus = () => {
  status.value = false
}
</script>

<template>
  <div class="menu-nav">
    <ul class="nav-main">
      <div class="head-sculpture">
        <div class="sculpture" @click="handelUserStatus">
          <span :style="{ backgroundColor: userColor }"></span>
        </div>
      </div>
      <li
        v-for="item in navList"
        :key="item.id"
        :class="{ item: true, active: UserStore.active === item.id }"
        @click="handleActive(item.id)"
      >
        <router-link :to="item.path">
          <img
            :src="UserStore.active !== item.id ? item.img : item.activeImg"
            alt=""
          />
          <p>{{ item.name }}</p>
        </router-link>
      </li>
    </ul>

    <div class="basic">
      <p @click="backDialogVisible = true">
        <img src="@renderer/assets/layout/feedback.webp" alt="" />
        <span>意见反馈</span>
      </p>
      <p>
        <img src="@renderer/assets/layout/app.webp" alt="" />
        <span>App下载</span>
      </p>
      <p @click="dialogVisible = true">
        <img src="@renderer/assets/layout/update.webp" alt="" />
        <span>版本更新</span>
      </p>
    </div>

    <Transition name="fade" mode="out-in">
      <UserStatus
        @change="handleUserStatusChange"
        @changePassWord="changePassWord"
        @changeUserStatus="changeUserStatus"
        v-if="status"
      />

      <!--  -->
    </Transition>

    <Transition name="fade" mode="out-in">
      <UserInfo @change="handleUserInfoChange" v-if="info" />
    </Transition>

    <PassWordDia ref="dialog" />

    <UpdateDialog :dialogVisible="dialogVisible" @update="handleUpdate" />

    <FeedBack
      :backDialogVisible="backDialogVisible"
      @BackUpdate="handleBackUpdate"
    />
  </div>
</template>

<style scoped lang="scss">
.menu-nav {
  /* prettier-ignore */
  width: 70PX;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .head-sculpture {
    text-align: center;
    /* prettier-ignore */
    padding: 10PX 0 20PX 0;

    .sculpture {
      margin: 0 auto;
      /* prettier-ignore */

      width: 40PX;
      /* prettier-ignore */
      height: 40PX;
      background-image: url('@renderer/assets/layout/touxiang.webp');
      background-size: cover;
      position: relative;
      cursor: pointer;
      span {
        position: absolute;
        right: 0;
        bottom: 0;
        overflow: hidden;
        border: 1px solid #ffffff;
        display: inline-block;
        /* prettier-ignore */
        width: 8PX;
        /* prettier-ignore */
        height: 8PX;
        background: red;
        border-radius: 50%;
      }
    }
  }

  .nav-main {
    /* prettier-ignore */
    height: 760PX;
    .item {
      a {
        width: 100%;
        height: 100%;
        padding-top: 5px;
      }
      /* prettier-ignore */
      height: 50PX;
      /* prettier-ignore */
      width: 50PX;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      /* prettier-ignore */
      margin: 0 auto 20PX   ;

      img {
        /* prettier-ignore */
        width: 20PX;
        /* prettier-ignore */
        height: 20PX;
        /* prettier-ignore */

        margin-bottom: 6PX;
      }

      p {
        /* prettier-ignore */

        font-size: var(--font-size-10);
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #333333;
      }
    }
  }

  .basic {
    p {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      cursor: pointer;
      /* prettier-ignore */

      margin-bottom: 20PX;
      img {
        /* prettier-ignore */

        width: 20PX;
        /* prettier-ignore */

        height: 20PX;
        /* prettier-ignore */

        margin-bottom: 8PX;
      }
      span {
        /* prettier-ignore */

        font-size: var(--font-size-10);
        font-family: Source Han Sans CN-Normal, Source Han Sans CN;
        font-weight: 350;
        color: #999999;
      }
    }
  }

  .active {
    background: #4faa74;
    border-radius: 12px 12px 12px 12px;

    p {
      color: #ffffff !important;
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
