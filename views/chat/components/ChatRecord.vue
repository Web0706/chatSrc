<script setup lang="ts">
import { ref } from 'vue'
import { chatRecords } from '@renderer/api/chat'
import { Record, RecordMessage } from './type'
import { debounce } from '@renderer/utils/performance'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const props = defineProps<{
	visitorId: string
}>()

const emit = defineEmits(['changePage'])

const navList = [
	{
		name: '全部',
		id: 0,
	},
	{
		name: '图片及视频',
		id: 1,
	},
	{
		name: '文件',
		id: 2,
	},
	{
		name: '链接',
		id: 3,
	},
]

const activeIndex = ref(0)
const recordParams = ref<Record>({
	content_msg: null,
	forward_or_back: null,
	is_to_latest: null,
	msg_id: null,
	page: 1,
	page_size: 50,
	search_key: '',
	search_type: 0,
	visitor_id: null,
	is_kefu: 1,
})
const recordList = ref<RecordMessage[]>([])

const main = ref()

const changeActiveIndex = async (index: number) => {
	activeIndex.value = index

	recordParams.value.search_type = index
	recordParams.value.visitor_id = props.visitorId

	recordParams.value.page = 1
	if (index === 1) {
		recordList.value = []
		const { data } = await chatRecords(recordParams.value)
		setList(data.rows)
	} else {
		recordList.value = []

		getChatRecords()
	}
}

const getChatRecords = async () => {
	if (!recordParams.value.search_key) {
		ElMessage.warning('请输入搜索内容')
		recordList.value = []
		return
	}
	recordParams.value.visitor_id = props.visitorId

	const { data } = await chatRecords(recordParams.value)
	if (
		data.rows.length === 0 ||
		data.rows.length < recordParams.value.page_size
	) {
		ElMessage.warning('没有更多数据了')
		recordParams.value.page = data.total_pages
	}

	setList(data.rows)
}

const setList = rows => {
	recordList.value = [
		...recordList.value,
		...rows.map(item => {
			const currentTime = dayjs() // 获取当前时间
			const itemTime = dayjs(item.last_time) // 解析数组元素中的时间

			if (item.content.includes('img[')) {
				item.is_img = true
				item.content = item.content.replace('img[', '').replace(']', '')
			} else if (item.content.includes('file[')) {
				item.is_file = true
				item.content = item.content.replace('file[', '').replace(']', '')
			}

			// 判断时间是否为当天
			if (itemTime.isSame(currentTime, 'day')) {
				// 使用正则处理为 09:13 的格式保留时分
				const formattedTime = itemTime.format('HH:mm')

				return { ...item, last_time: formattedTime }
			} else {
				// 过滤为 2023-07-05 的格式
				const formattedTime = itemTime.format('YYYY-MM-DD')
				return { ...item, last_time: formattedTime }
			}
		}),
	]
}

const checkListBoxScroll = debounce(async () => {
	if (
		main.value.scrollTop + main.value.clientHeight >=
		main.value.scrollHeight - 400
	) {
		recordParams.value.page++

		if (activeIndex.value === 1) {
			const { data } = await chatRecords(recordParams.value)

			if (
				data.rows.length === 0 ||
				data.rows.length < recordParams.value.page_size
			) {
				recordParams.value.page = data.total_pages

				return ElMessage.warning('没有更多数据了')
			}
			setList(data.rows)
		} else {
			getChatRecords()
		}
	}
}, 400)

const handleSearch = () => {
	recordParams.value.page = 1
	recordList.value = []
	getChatRecords()
}
</script>

<template>
	<div class="chat-record">
		<div class="chat-record-search">
			<img
				src="@renderer/assets/img/login/off.webp"
				alt=""
				class="off-img"
				@click="emit('changePage', true)"
			/>

			<el-input
				class="search-input"
				placeholder="搜索"
				style="width: 188px; height: 32px"
				v-model="recordParams.search_key"
			>
				<template #prefix>
					<img src="@renderer/assets/img/chat/search.png" alt="" />
				</template>
			</el-input>

			<el-button @click="handleSearch">搜索</el-button>
		</div>

		<div class="classify">
			<p
				v-for="item in navList"
				:key="item.id"
				@click="changeActiveIndex(item.id)"
				:class="{ active: activeIndex === item.id }"
			>
				{{ item.name }}
			</p>
		</div>

		<div class="main" ref="main" @scroll="checkListBoxScroll">
			<div class="item" v-for="item in recordList" :key="item.msg_id">
				<div class="left">
					<img
						src="https://cdn.iconscout.com/icon/free/png-512/avatar-375-456327.png"
						alt=""
						class="avator"
					/>
				</div>
				<div class="right">
					<div class="top">
						<p v-if="item.mes_type === 'kefu'">{{ item.kefu_name }}</p>
						<p v-else>
							{{ item.nickname === '' ? item.visitor_name : item.nickname }}
						</p>
						<p>{{ item.time }}</p>
					</div>
					<div class="bottom">
						<img :src="item.content" alt="" v-if="item.is_img" />
						<p v-else-if="item.is_file" class="file">
							<span>
								<img src="@renderer/assets/img/chat/file_two.webp" alt="" />
							</span>
							<span>{{ item.content.match(/\/([^\/?#]+)$/)[1] }}</span>
						</p>
						<p v-else>{{ item.content }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.chat-record {
	width: 300px;
	margin-right: 0px;
	padding: 10px 0 10px 10px;
	background-color: #fff;

	border-radius: 10px;

	.chat-record-search {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.off-img {
			width: 16px;
			height: 16px;
			object-fit: cover;

			cursor: pointer;
		}
		.el-input__prefix-inner {
			img {
				width: 16px;
				height: 16px;
			}
		}

		.search-input {
			:deep(.el-input__wrapper) {
				border-radius: 20px 20px 20px 20px;
				background-color: #f2f3f6;
				box-shadow: none;
			}
		}

		:deep(.el-input__inner::placeholder) {
			font-size: 12px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #999999;
		}

		.el-button {
			background: #4faa74;
			border-radius: 120px;
			font-size: 14px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #ffffff;
		}
	}

	.classify {
		margin-top: 20px;
		display: flex;

		font-size: 14px;
		font-family: Source Han Sans CN-Normal, Source Han Sans CN;
		font-weight: 350;
		color: #333333;

		p {
			margin-right: 30px;
			cursor: pointer;
		}

		.active {
			font-weight: 600;
			color: #4faa74;
		}
	}

	.main {
		margin-top: 30px;
		overflow-y: auto;
		height: calc(100% - 138px);
		&::-webkit-scrollbar {
			width: 6px;
		}

		&::-webkit-scrollbar-thumb {
			background: #dddddd;
			border-radius: 10px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}
		.item {
			margin-top: 30px;
			width: 280px;
			display: flex;
			.left {
				margin-right: 10px;
				.avator {
					width: 36px;
					height: 36px;
					border-radius: 50%;
					object-fit: cover;
				}
			}
			.right {
				width: 226px;
				padding-top: 6px;

				.top {
					display: flex;
					justify-content: space-between;
					font-family: Source Han Sans CN-Medium, Source Han Sans CN;
					margin-bottom: 6px;
					& p:first-child {
						font-size: 16px;
						font-weight: 500;
						color: #333333;
						width: 100px;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						vertical-align: baseline;
					}

					& p:last-child {
						font-size: 12px;

						font-weight: 350;
						color: #666666;
					}
				}
				.bottom {
					width: 216px;
					p {
						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #666666;
						line-height: 18px;

						word-wrap: break-word;
						word-break: normal;
					}

					img {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}

					.file {
						width: 224px;
						height: 60px;
						background: rgba(0, 0, 0, 0.1);
						border-radius: 5px;
						display: flex;
						align-items: center;
						padding: 10px;
						& span:first-child {
							width: 36px;
							height: 36px;
							background: rgba(79, 170, 116, 0.2);
							display: flex;
							align-items: center;
							justify-content: center;
							border-radius: 50%;
							margin-right: 10px;
							img {
								width: 20px;
								height: 20px;

								object-fit: cover;
							}
						}

						& span:last-child {
							font-size: 14px;
							font-family: Source Han Sans CN-Normal, Source Han Sans CN;
							font-weight: 350;
							color: #333333;
						}
					}
				}
			}
		}
	}
}
</style>
