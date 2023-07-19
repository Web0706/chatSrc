<script setup lang="ts">
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import TitleBar from './common/TitleBar.vue'
import MenuNav from './common/MenuNav.vue'
import NavigationBar from './common/NavigationBar.vue'
import { useUserStore } from '@renderer/store/modules/user'

const userStore = storeToRefs(useUserStore())

const flag = ref(true)

watch(userStore.projectId, (newVal, oldVal) => {
	flag.value = false

	setTimeout(() => {
		flag.value = true
	}, 2000)
})
</script>

<template>
	<TitleBar />
	<div class="layout">
		<MenuNav />
		<main>
			<NavigationBar />

			<router-view
				v-slot="{ Component }"
				style="background-color: #f9fafc"
				v-if="flag"
			>
				<transition name="fade" mode="out-in">
					<keep-alive>
						<component :is="Component" />
					</keep-alive>
				</transition>

				<!-- <transition name="fade" mode="out-in"> v-if="$route.meta.keepAlive" 
					<component :is="Component" v-if="!$route.meta.keepAlive" />
				</transition> -->
			</router-view>

			<div v-else class="container">
				<div class="three-body">
					<div class="three-body__dot"></div>
					<div class="three-body__dot"></div>
					<div class="three-body__dot"></div>
				</div>
			</div>
		</main>
	</div>
</template>

<style scoped lang="scss">
.layout {
	width: 100%;
	/* prettier-ignore */
	padding-top: 50PX;
	/* prettier-ignore */
	height: 100%;
	display: flex;
	main {
		width: calc(100% - 70px);

		.fade-enter-active,
		.fade-leave-active {
			transition: opacity 0.4s ease, width 0.4s ease;
		}

		.fade-enter-from,
		.fade-leave-to {
			opacity: 0;
			width: 100;
		}
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.three-body {
		--uib-size: 80px;
		--uib-speed: 0.8s;
		--uib-color: #4faa74;
		position: relative;
		display: inline-block;
		height: var(--uib-size);
		width: var(--uib-size);
		animation: spin78236 calc(var(--uib-speed) * 2.5) infinite linear;
		margin-bottom: 120px;
	}

	.three-body__dot {
		position: absolute;
		height: 100%;
		width: 30%;
	}

	.three-body__dot:after {
		content: '';
		position: absolute;
		height: 0%;
		width: 100%;
		padding-bottom: 100%;
		background-color: var(--uib-color);
		border-radius: 50%;
	}

	.three-body__dot:nth-child(1) {
		bottom: 5%;
		left: 0;
		transform: rotate(60deg);
		transform-origin: 50% 85%;
	}

	.three-body__dot:nth-child(1)::after {
		bottom: 0;
		left: 0;
		animation: wobble1 var(--uib-speed) infinite ease-in-out;
		animation-delay: calc(var(--uib-speed) * -0.3);
	}

	.three-body__dot:nth-child(2) {
		bottom: 5%;
		right: 0;
		transform: rotate(-60deg);
		transform-origin: 50% 85%;
	}

	.three-body__dot:nth-child(2)::after {
		bottom: 0;
		left: 0;
		animation: wobble1 var(--uib-speed) infinite calc(var(--uib-speed) * -0.15)
			ease-in-out;
	}

	.three-body__dot:nth-child(3) {
		bottom: -5%;
		left: 0;
		transform: translateX(116.666%);
	}

	.three-body__dot:nth-child(3)::after {
		top: 0;
		left: 0;
		animation: wobble2 var(--uib-speed) infinite ease-in-out;
	}

	@keyframes spin78236 {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes wobble1 {
		0%,
		100% {
			transform: translateY(0%) scale(1);
			opacity: 1;
		}

		50% {
			transform: translateY(-66%) scale(0.65);
			opacity: 0.8;
		}
	}

	@keyframes wobble2 {
		0%,
		100% {
			transform: translateY(0%) scale(1);
			opacity: 1;
		}

		50% {
			transform: translateY(66%) scale(0.65);
			opacity: 0.8;
		}
	}
}
</style>
