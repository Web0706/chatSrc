<script setup lang="ts">
import { removeToken, removetFlagItme } from '@renderer/utils/local-storage'
import router from '@renderer/router'
import { changeServiceOnLineStatus } from '@renderer/api/login'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@renderer/store/modules/user'

const emit = defineEmits(['change', 'changePassWord', 'changeUserStatus']) //声明 emits
const userStore = useUserStore()

const handleLogOut = async () => {
  await changeServiceOnLineStatus({ line: 'off' })

  removeToken()
  removetFlagItme('userInfo')

  router.push('/login')

  location.reload()
}

const changeStatus = async (data: any) => {
  try {
    await changeServiceOnLineStatus(data)

    emit('changeUserStatus')

    if (data.line === 'on') {
      ElMessage.success('修改状态为在线')
      userStore.setUserColor('#60E797')
    } else {
      ElMessage.success('修改状态为忙碌')
      userStore.setUserColor('#FF9A3C')
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <div class="user-satate">
    <ul class="satate">
      <li @click="changeStatus({ line: 'on' })">
        <span></span>
        <p>在线</p>
      </li>
      <li @click="changeStatus({ line: 'suspend' })">
        <span></span>
        <p>忙碌</p>
      </li>
    </ul>

    <ul class="info">
      <li @click="$emit('change')">
        <img src="@renderer/assets/layout/user.webp" alt="" />
        <p>个人信息</p>
      </li>
      <li @click="$emit('changePassWord')">
        <img src="@renderer/assets/layout/edit.webp" alt="" />
        <p>修改密码</p>
      </li>
    </ul>

    <p class="quit" @click="handleLogOut">
      <img src="@renderer/assets/layout/logout.webp" alt="" />
      <span>退出账号</span>
    </p>
  </div>
</template>

<style scoped lang="scss">
.user-satate {
  position: absolute;
  z-index: 3;
  /* prettier-ignore */
  left: 65PX;
  /* prettier-ignore */
  top: 60PX;
  /* prettier-ignore */
  width: 130PX;
  /* prettier-ignore */
  height: 236PX;
  background: #fff;
  /* prettier-ignore */
  box-shadow: 0PX 4PX 10PX 0PX rgba(0,0,0,0.1);
  /* prettier-ignore */
  border-radius: 10PX 10PX 10PX 10PX;
  /* prettier-ignore */
  padding: 13PX 5PX;

  li,
  .quit {
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
    background-color: #fff;
    border-radius: 8px 8px 8px 8px;
    font-size: 14px;
    font-family: Source Han Sans CN-Normal, Source Han Sans CN;
    font-weight: 350;
    color: #333333;
    padding: 7px 5px;
    margin-bottom: 6px;
    cursor: pointer;
  }
  .satate {
    height: 82px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    li {
      span {
        /* prettier-ignore */
        width: 10PX;
        /* prettier-ignore */
        height: 10PX;
        background: #60e797;
        display: block;
        border-radius: 50%;
        margin-right: 14px;
      }
    }

    & li:nth-child(2) {
      span {
        background-color: #ff9a3c;
      }
    }
    & li:last-child {
      span {
        background-color: #ccc;
      }
    }
  }
  .info,
  .quit {
    img {
      width: 14px;
      height: 14px;
      margin-right: 10px;
    }
  }

  .info {
    height: 96px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 14px 0 14px 0;
  }

  .quit {
    margin-top: 6px;
  }

  li:hover,
  .quit:hover {
    background-color: rgba(79, 170, 116, 0.1);
  }
}
</style>
