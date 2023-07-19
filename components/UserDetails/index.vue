<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
	Info,
	Label,
	TagItem,
	TrackItem,
} from '@renderer/views/chat/components/type'
import {
	projectService,
	setVisitorInfo,
	editTag,
	VisitorInfo,
	tagList,
	behaviorList,
} from '@renderer/api/chat'
import dayjs from 'dayjs'
import { followStatusList, editVisitorInfo } from '@renderer/api/onlineVisitor'

const emit = defineEmits(['updateName'])
// 资料 || 轨迹 索引
const datumTopIndex = ref(1)
// 跟进状态弹窗
const followStatus = ref(false)
// 客户归属弹窗
const ascriptionStatus = ref(false)
// 客户资料编辑  || 保存
const userInfoStatus = ref(false)
// dialog 状态
const dialogVisible = ref(false)
// icon 旋转角度
const iconTransform = ref(0)

// 标签选择列表
const selectTagList = ref<TagItem[]>([])

const statusList = ref([])

// 轨迹索引
const locusIndex = ref(0)

// 用户信息
const userInfo = ref<Info>({} as Info)

// 访客id
const visitorId = ref('')
// 修改访客名
const editName = ref(true)
const userName = ref('')

const searchName = ref('')
const projectKefuList = ref([])

// 客户资料列表
const userInfoList = ref([
	{
		lable: '姓名',
		info: '',
		value: 'visitor_name',
	},
	{
		lable: '公司',
		info: '',
		value: 'enterprise',
	},
	{
		lable: 'IP地址',
		info: '',
		value: '',
	},
	{
		lable: '手机',
		info: '',
		value: 'phone',
	},
	{
		lable: '固话',
		info: '',
		value: 'telephone',
	},
	{
		lable: 'QQ',
		info: '',
		value: 'qq',
	},
	{
		lable: '微信',
		info: '',
		value: 'weixin',
	},
	{
		lable: '邮箱',
		info: '',
		value: 'email',
	},
	{
		lable: 'Facebook',
		info: '',
		value: 'feacebook',
	},
	{
		lable: 'Twitter',
		info: '',
		value: 'twitter',
	},
])

const getFollowStatusList = async () => {
	const {
		data: { rows },
	} = await followStatusList()

	statusList.value = rows
}

getFollowStatusList()

const params = ref({
	id: null, // 访客主键id  619
	enterprise: null, //公司名称
	phone: null, // 手机号
	weixin: null, // 微信号
	email: null, // 邮箱号
	qq: null, // QQ号
	visitor_name: null, //访客真实姓名
	feacebook: null, //
	twitter: null, //
	remark: null, // 备注
	telephone: null, // 固话
	add_lib: null, // 1加入客户库
	kefu_secret: null, //更换客服归属人(客服唯一key)
})

// 获取用户信息
const getVisitorInfo = async id => {
	try {
		const { data } = await VisitorInfo(id)

		visitorId.value = id
		userInfo.value = data
		params.value.add_lib = data.is_lib
		userName.value = data.visitor_name === '' ? data.name : data.visitor_name

		getBehaviorList(data)
		updateUserInfo()
		getProjectService()

		ascriptionStatus.value = false
		editName.value = true
		userInfoStatus.value = false
	} catch (error) {
		console.log(error)
	}
}

// 资料 || 轨迹 切换
const handledatumTopIndex = (value: number) => {
	datumTopIndex.value = value
}

// 获取标签列表
const getTagList = async () => {
	const { data } = await tagList()

	selectTagList.value = data.rows
}

getTagList()

// 获取客服列表
const getProjectService = async () => {
	const { data } = await projectService({
		project_id: userInfo.value.project_id,
		page_size: 9999,
		page: 1,
	})

	projectKefuList.value = data.rows
}

// 跟进状态弹窗
const handleFollowStatus = async (node: any) => {
	try {
		followStatus.value = !followStatus.value
		ascriptionStatus.value = false

		if (node.type === 'small') {
			if (node.item.id !== userInfo.value.follow_status) {
				await editVisitorInfo({
					set_type: 3,
					visitor_id: userInfo.value.id,
					follow_status: node.item.id,
				})

				getVisitorInfo(visitorId.value)
			}
		}
	} catch (error) {}
}

// 客户归属弹窗
const handleascriptionStatus = () => {
	ascriptionStatus.value = !ascriptionStatus.value
	followStatus.value = false
}

// 客户资料编辑  || 保存
const handleUserInfoStatus = async (type: string) => {
	userInfoStatus.value = !userInfoStatus.value

	if (type === 'save') {
		userInfoList.value.forEach(item => {
			params.value[item.value] = item.info
			if (item.value === 'visitor_name') {
				emit('updateName', { id: userInfo.value.id, name: item.info })

				userName.value = item.info
			}
		})

		params.value.id = userInfo.value.id

		await setVisitorInfo(params.value)
	}
}

// 更新用户信息
const updateUserInfo = () => {
	params.value.remark = userInfo.value.remark
	userInfoList.value.forEach(item => {
		const labelMap = {
			姓名: 'name',
			公司: 'enterprise',
			IP地址: 'client_ip',
			手机: 'phone',
			固话: 'telephone',
			QQ: 'qq',
			微信: 'weixin',
			邮箱: 'email',
			Facebook: 'feacebook',
			Twitter: 'twitter',
		}

		const userInfoKey = labelMap[item.lable]

		if (userInfoKey) {
			item.info = userInfo.value[userInfoKey]

			if (userInfoKey === 'name') {
				item.info =
					userInfo.value.visitor_name === ''
						? userInfo.value.name
						: userInfo.value.visitor_name
			}
		}
	})
}

// icon 旋转角度
const rotationStyle = computed(() => ({
	transform: `rotate(${iconTransform.value}deg)`,
}))

// icon 旋转
const handleIconTransform = () => {
	iconTransform.value += 360
}

// 轨迹索引
const handleLocus = index => {
	locusIndex.value = index
}

// 处理显示标签
const handleTag = async (type: string, item: Label) => {
	const add = async () => {
		dialogVisible.value = true

		selectTagList.value = selectTagList.value.filter(tag => {
			if (userInfo.value.tags_list.find(item1 => item1.id === tag.id)) {
				tag.active = true
			}

			return tag
		})
	}

	const remove = async () => {
		const labels_ids = userInfo.value.tags_list
			.filter(tag => tag.id !== item.id)
			.map(tag1 => tag1.id.toString())
			.join(',')

		await editTag({
			labels_ids,
			visitor_id: userInfo.value.id,
		})

		getVisitorInfo(visitorId.value)
	}

	type === 'add' ? add() : remove()
}

// 标签选中状态
const handleSelectTag = (item: TagItem) => {
	item.active = !item.active
}

// 弹窗关闭
const handleClose = async () => {
	const labels_ids = selectTagList.value
		.filter(tag => tag.active)
		.map(tag1 => tag1.id.toString())
		.join(',')

	await editTag({
		labels_ids,
		visitor_id: userInfo.value.id,
	})
	getVisitorInfo(visitorId.value)
	getTagList()

	dialogVisible.value = false
}

const searchCustomService = async () => {
	const { data } = await projectService({
		name: searchName.value,
		project_id: userInfo.value.project_id,
	})
	projectKefuList.value = data.rows
}

const selectCustomService = async kefuItem => {
	editVisitorInfo({
		set_type: 2,
		visitor_id: userInfo.value.id,
		secret: kefuItem.secret,
	})
	// 刷新页面

	location.reload()

	ascriptionStatus.value = false
	getVisitorInfo(visitorId.value)
}

const addCustomerLibrary = async () => {
	params.value.add_lib = 1
	params.value.id = userInfo.value.id
	await setVisitorInfo(params.value)
	getVisitorInfo(visitorId.value)
}

const editUserName = async () => {
	params.value.visitor_name = userName.value
	params.value.id = userInfo.value.id
	await setVisitorInfo(params.value)

	emit('updateName', { id: userInfo.value.id, name: userName.value })
	getVisitorInfo(visitorId.value)
	editName.value = !editName.value
}

// 轨迹

// 获取轨迹列表
const trackParams = ref({
	visitor_id: null,
	project_id: null,
	page: 1,
	page_size: 100,
	s_type: null,
})

const trackList = ref<TrackItem[]>([])

const getBehaviorList = async ({ project_id, visitor_id }) => {
	trackParams.value.project_id = project_id
	trackParams.value.visitor_id = visitor_id

	const {
		data: { rows },
	} = await behaviorList(trackParams.value)

	trackList.value = rows
}

// 格式化时间
const formatTime = (value, format) => {
	if (!value) return ''

	const date = dayjs(value)

	if (format === '天') {
		const month = date.format('MM')
		const day = date.format('DD')
		const hours = date.format('HH')
		const minutes = date.format('mm')
		return `${month}-${day} ${hours}:${minutes}`
	} else if (format === '时') {
		const hours = date.format('HH')
		const minutes = date.format('mm')
		return `${hours}:${minutes}`
	}

	return ''
}

defineExpose({
	getVisitorInfo,
})
</script>

<template>
	<div class="right-user-info">
		<div class="client">
			<div class="client-name">
				<img
					src="https://cdn.iconscout.com/icon/free/png-512/avatar-375-456327.png"
					alt=""
				/>
				<p v-if="editName">{{ userName }}</p>

				<img
					src="@renderer/assets/img/chat/edit_pen.png"
					alt=""
					@click="editName = !editName"
					v-if="editName"
				/>
				<p v-if="!editName">
					<el-input v-model="userName"></el-input>
				</p>
				<img
					src="@renderer/assets/img/chat/dui.webp"
					alt=""
					@click="editUserName"
					v-if="!editName"
				/>
				<p @click="addCustomerLibrary" v-if="userInfo.is_lib !== 1">
					加入客户库
				</p>
			</div>
			<div class="client-source">
				<p>
					<span>访问项目：</span>
					<span>{{ userInfo.project_name }}</span>
				</p>
				<p>
					<span>渠道来源：</span>
					<span>{{ userInfo.widget_chan_name }}</span>
				</p>
			</div>
		</div>
		<div class="datum">
			<div class="datum-top">
				<p
					:class="{ 'active-datum': datumTopIndex === 1 }"
					@click="handledatumTopIndex(1)"
				>
					<span>资料</span>
					<span></span>
				</p>
				<p
					:class="{ 'active-datum': datumTopIndex === 2 }"
					@click="handledatumTopIndex(2)"
				>
					<span>轨迹</span>
					<span></span>
				</p>
			</div>
			<div class="datum-main" v-if="datumTopIndex === 1">
				<div @click="handleFollowStatus({ type: 'big' })">
					<p>跟进状态</p>
					<p>
						<span>{{ userInfo.follow_name }}</span>
						<img src="@renderer/assets/img/chat/xia.webp" alt="" />
					</p>
				</div>
				<div @click="handleascriptionStatus" style="background-color: #f9fafc">
					<p>客户归属</p>
					<p>
						<span>{{ userInfo.kf_name }}</span>
						<img src="@renderer/assets/img/chat/xia.webp" alt="" />
					</p>
				</div>

				<div id="alert-status" v-if="followStatus">
					<p
						v-for="item in statusList"
						:key="item.id"
						class="item"
						@click="handleFollowStatus({ type: 'small', item })"
					>
						{{ item.status_name }}
					</p>
				</div>
				<div class="alert-ascription" v-if="ascriptionStatus">
					<el-input
						placeholder="请输入客服名称"
						@input="searchCustomService"
						v-model="searchName"
					>
						<template #prefix>
							<img src="@renderer/assets/img/chat/search.png" alt="" />
						</template>
					</el-input>

					<div class="custom-service">
						<div
							v-for="item in projectKefuList"
							:key="item.id"
							@click="selectCustomService(item)"
							class="item"
						>
							<img src="@renderer/assets/layout/touxiang.webp" alt="" />

							<span>{{ item.user_name }}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="trajectory" v-if="datumTopIndex === 2">
				<div class="trajectory-top">
					<div>
						<p :class="{ active: locusIndex === 0 }" @click="handleLocus(0)">
							全部
						</p>
						<p :class="{ active: locusIndex === 1 }" @click="handleLocus(1)">
							接待记录
						</p>
						<p :class="{ active: locusIndex === 2 }" @click="handleLocus(2)">
							行为轨迹
						</p>
					</div>
					<img
						src="@renderer/assets/img/chat/shuaxin.webp"
						alt=""
						:style="rotationStyle"
						@click="handleIconTransform"
					/>
				</div>
				<div class="trajectory-main">
					<div v-for="item in trackList" :key="item.id">
						<div class="receive" v-if="locusIndex !== 2 && item.s_type === 2">
							<div class="receive-left">
								<img src="@renderer/assets/img/chat/global.webp" alt="" />
								<span></span>
							</div>
							<div class="receive-right">
								<div class="top">
									<p>{{ item.new_kefu_name }}</p>
									<p>网页会话 接待</p>
								</div>
								<div class="bottom">
									{{ formatTime(item.created_at, '天') }} &nbsp; 会话时长：{{
										item.length_of_time
									}}
								</div>
							</div>
						</div>

						<div class="web" v-if="locusIndex !== 1 && item.s_type === 1">
							<div>
								<div class="web-left">
									<img src="@renderer/assets/img/chat/global.webp" alt="" />
									<span></span>
								</div>

								<div class="web-right">
									<div class="top">网页行为</div>
									<div class="bottom">
										{{ formatTime(item.created_at, '天') }} &nbsp; 会话时长：{{
											item.length_of_time
										}}
									</div>
								</div>
							</div>

							<div class="web-bottom">
								<p>
									{{ formatTime(item.created_at, '时') }}&nbsp; 会话时长:{{
										item.length_of_time
									}}
								</p>
								<p>{{ item.desc }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="user-details" v-if="datumTopIndex === 1">
			<div class="tag">
				<p class="tag-top">
					<span>客户标签:</span>
					<span @click="handleTag('add', {} as Label)">
						<img src="@renderer/assets/img/chat/add.webp" alt="" />
						<span>添加标签</span>
					</span>
				</p>
				<div class="tag-main">
					<p
						v-for="item in userInfo.tags_list"
						:key="item.id"
						:style="{ backgroundColor: item.color_value }"
					>
						<span>{{ item.labels_name }}</span>
						<img
							src="@renderer/assets/layout/off.webp"
							alt=""
							@click="handleTag('del', item)"
						/>
					</p>
				</div>
			</div>

			<div class="details">
				<div class="details-top">
					<p>客户资料:</p>
					<p v-if="!userInfoStatus" @click="handleUserInfoStatus('open')">
						<img src="@renderer/assets/img/chat/edit_pen.png" alt="" />
						<span>编辑</span>
					</p>
					<p v-else @click="handleUserInfoStatus('save')">
						<img src="@renderer/assets/img/chat/dui.webp" alt="" />
						<span>保存</span>
					</p>
				</div>

				<div class="details-main">
					<p
						v-for="item in userInfoList"
						:key="item.lable"
						:style="{
							display: userInfoStatus ? 'flex' : 'block',
							marginTop: userInfoStatus ? '5px' : '10px',
						}"
					>
						<span class="one">{{ item.lable }}</span>
						<span class="two" v-if="!userInfoStatus">{{ item.info }}</span>
						<el-input
							v-else
							class="three"
							style="width: 180px; height: 24px"
							v-model="item.info"
							:disabled="item.lable === 'IP地址'"
						></el-input>
					</p>

					<div class="desc">
						<h3>备注信息</h3>

						<el-input
							type="textarea"
							:rows="4"
							v-model="params.remark"
							:disabled="!userInfoStatus"
						></el-input>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-model="dialogVisible"
			title="添加标签"
			width="30%"
			:before-close="handleClose"
			:show-close="false"
		>
			<div class="tag-list-main">
				<p
					v-for="item in selectTagList"
					:key="item.id"
					:class="{ active: item.active }"
					@click="handleSelectTag(item)"
				>
					{{ item.labels_name }}
				</p>
			</div>
		</el-dialog>
	</div>
</template>

<style scoped lang="scss">
.right-user-info {
	width: 300px;
	margin-right: 0px;
	padding: 30px 20px 14px 20px;
	background-color: #fff;

	border-radius: 10px;

	.tag-list-main {
		margin-top: -20px;
		min-height: 200px;
		display: flex;
		flex-wrap: wrap;
		p {
			min-width: 84px;
			height: 30px;
			border-radius: 20px 20px 20px 20px;
			opacity: 1;
			border: 1px solid #999999;

			display: flex;
			justify-content: center;
			align-items: center;
			margin-right: 10px;
			padding: 0 14px;

			cursor: pointer;
		}
		.active {
			border-style: none;
			background-color: #5edc91;

			color: #fff;
		}
	}
	.client {
		height: 140px;
		width: 100%;

		.client-name {
			display: flex;
			width: 100%;
			height: 54px;
			align-items: center;
			position: relative;
			img {
				width: 54px;
				height: 54px;
				margin-right: 10px;
			}

			& img:nth-child(3) {
				width: 16px;
				height: 16px;
				cursor: pointer;
			}

			& p:nth-child(2) {
				margin-right: 10px;
				width: 80px;

				overflow: hidden; //超出的文本隐藏
				text-overflow: ellipsis; //溢出用省略号显示
				white-space: nowrap; //溢出不换行
				font-size: 16px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 350;
				color: #333333;
				line-height: 23px;
			}
			& p:last-child {
				width: 80px;
				height: 30px;
				background: #4faa74;
				border-radius: 8px 8px 8px 8px;

				font-size: 12px;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 350;
				color: #ffffff;
				line-height: 18px;
				text-align: center;
				line-height: 30px;

				position: absolute;
				right: 0px;

				cursor: pointer;
			}
		}
		.client-source {
			height: 55px;
			width: 100%;
			margin-top: 30px;
			font-size: 14px;
			font-family: Source Han Sans CN-Normal, Source Han Sans CN;
			font-weight: 350;
			color: #333333;
			line-height: 20px;

			& p:first-child {
				margin-bottom: 15px;
				display: flex;
				& span:last-child {
					font-size: 12px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #4faa74;
					line-height: 18px;
					display: block;
					background: #ceffe2;
					border-radius: 4px 4px 4px 4px;
					padding: 1px 7px;
				}
			}
		}
	}

	.datum {
		height: 122px;
		width: 100%;
		margin-top: 40px;
		.datum-top {
			display: flex;
			width: 100%;
			height: 26px;
			p {
				cursor: pointer;
				span {
					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #999999;
					line-height: 20px;
				}
			}

			& p:first-child {
				margin-right: 30px;
			}

			.active-datum {
				& span:first-child {
					font-family: Source Han Sans CN-Medium, Source Han Sans CN;
					font-weight: 500;
					color: #333333;
				}
				& span:last-child {
					display: block;
					width: 28px;
					height: 2px;
					background: #4faa74;
					border-radius: 8px 8px 8px 8px;
					margin-top: 2px;
				}
			}
		}

		.datum-main {
			width: 100%;
			height: 82px;
			margin-top: 14px;
			position: relative;

			.alert-ascription {
				top: 86px;
				left: -10px;
				position: absolute;
				z-index: 3;
				width: 280px;
				height: 330px;
				background: #ffffff;
				box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
				border-radius: 4px;
				padding: 10px 0 0 0;
				display: block;
				overflow: hidden;

				.el-input__prefix-inner {
					img {
						width: 16px;
						height: 16px;
					}
				}

				:deep(.el-input__wrapper) {
					background-color: #f1f3f5;
					border-radius: 20px 20px 20px 20px;
					width: 246px;
					height: 36px;
					margin-left: 8px;
				}
				:deep(.el-input__inner::placeholder) {
					font-size: var(--fs-12);
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #999999;
					line-height: 18px;
				}

				.custom-service {
					overflow-y: auto;
					height: 280px;
					padding: 12px;
					display: flex;
					flex-direction: column;
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
						width: 100%;
						height: 46px;

						border-radius: 4px;
						display: flex;
						align-items: center;
						justify-content: start;
						padding-left: 10px;
						margin-bottom: 0;
						cursor: pointer;
						span {
							color: #333;
							font-size: 14px;
							font-family: Source Han Sans CN-Normal, Source Han Sans CN;
							font-weight: 350;
						}
						img {
							width: 28px;
							height: 28px;
							margin-right: 10px;
						}

						&:hover {
							background: rgba(79, 170, 116, 0.3);
						}
					}
				}
			}
			#alert-status {
				position: absolute;

				top: 40px;
				right: -10px;
				width: 200px;
				height: 110px;
				overflow-y: auto;
				background: #ffffff;
				box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
				border-radius: 10px;
				display: block;
				padding: 10px;
				cursor: none;
				.item {
					cursor: pointer;
					width: 100%;
					height: 30px;
					margin-bottom: 2px;
					padding: 10px;
					border-radius: 4px 4px 4px 4px;
					padding-left: 5px;
					line-height: 12px;

					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #333;
					line-height: 12px;
				}

				.item:hover {
					background: rgba(79, 170, 116, 0.1);
				}

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
			}

			div {
				width: 100%;
				height: 36px;

				border-radius: 8px 8px 8px 8px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 8px 10px;
				cursor: pointer;

				& p:first-child {
					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #999999;
					line-height: 20px;
				}

				& p:last-child {
					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #333333;
					line-height: 20px;

					img {
						width: 14px;
						height: 14px;
						margin-left: 6px;
					}
				}
			}

			& div:first-child {
				margin-bottom: 10px;
				background-color: #f9fafc;
			}
		}

		.trajectory {
			margin-top: 16px;

			.trajectory-top {
				display: flex;
				height: 14px;
				align-items: center;
				justify-content: space-between;
				div {
					display: flex;
					align-items: center;
					P {
						font-size: 12px;
						height: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
						line-height: 14px;
						display: inline-block;
						border-right: 1px solid #d8d8d8;

						cursor: pointer;
					}

					& p:first-child {
						width: 42px;
						padding-right: 16px;
					}

					& p:nth-child(2) {
						width: 81px;
						padding: 0 16px;
					}

					& p:nth-child(3) {
						width: 48px;
						margin-left: 16px;
						border-style: none;
					}
				}
				img {
					width: 14px;
					height: 14px;

					transition: transform 1.2s;
				}

				.active {
					font-size: 12px;
					font-family: Source Han Sans CN-Medium, Source Han Sans CN;
					font-weight: 500;
					color: #333333;
				}
			}

			.trajectory-main {
				margin-top: 20px;
				height: calc(100vh - 426px);
				overflow-y: auto;

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

				.receive {
					display: flex;
					margin-bottom: 2px;
					.receive-left {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-right: 4px;
						img {
							width: 14px;
							height: 14px;

							object-fit: cover;
							margin-bottom: 2px;
						}

						span {
							height: 39px;
							width: 1px;
							background-color: #d8d8d8;
						}
					}

					.receive-right {
						display: flex;
						flex-direction: column;
						margin-top: 2px;
						div {
							display: flex;
							font-size: 12px;
							font-family: Source Han Sans CN-Normal, Source Han Sans CN;
							font-weight: 350;
							color: #999999;
						}

						.top {
							margin-bottom: 6px;
							& p:first-child {
								font-family: Source Han Sans CN-Medium, Source Han Sans CN;
								font-weight: 500;
								color: #333333;
								margin-right: 2px;
							}
						}
					}
				}

				.web {
					display: flex;
					flex-direction: column;
					& div:first-child {
						display: flex;
						.web-left {
							display: flex;
							flex-direction: column;
							align-items: center;
							margin-right: 4px;
							img {
								width: 14px;
								height: 14px;

								object-fit: cover;
								margin-bottom: 2px;
							}

							span {
								height: 28px;
								width: 1px;
								background-color: #d8d8d8;
							}
						}
						.web-right {
							div {
								font-size: 12px;
								font-family: Source Han Sans CN-Normal, Source Han Sans CN;
								font-weight: 350;
								color: #999999;
							}
							.top {
								color: #333333;
								margin-bottom: 6px;
							}
						}
					}

					.web-bottom {
						width: 100%;
						height: 27px;
						background: #f9fafc;
						border-radius: 6px;
						padding: 6px 0 6px;
						display: flex;
						align-items: center;
						p {
							font-size: 12px;
							font-family: Source Han Sans CN-Normal, Source Han Sans CN;
							font-weight: 350;
							zoom: 0.9;
						}
						& p:first-child {
							color: #999999;
							margin-right: 10px;
						}

						& p:last-child {
							color: #333333;
							width: 150px;

							overflow: hidden; //超出的文本隐藏
							text-overflow: ellipsis; //溢出用省略号显示
							white-space: nowrap; //溢出不换行
						}
					}
				}
			}
		}
	}

	.user-details {
		margin-top: 16px;
		width: 100%;

		.tag {
			width: 100%;
			height: 92px;

			.tag-top {
				display: flex;
				justify-content: space-between;
				& span:first-child {
					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #333333;
					line-height: 20px;
				}

				& span:last-child {
					font-size: 12px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #999999;
					line-height: 20px;

					cursor: pointer;
					img {
						width: 12px;
						height: 12px;
						margin-right: 8px;
					}
				}
			}
			.tag-main {
				margin-top: 10px;
				width: 100%;
				height: 60px;
				display: flex;
				flex-wrap: wrap;
				overflow-y: auto;
				p {
					height: 26px;
					background: #ceffe2;
					border-radius: 20px 20px 20px 20px;
					padding: 4px 10px 4px 6px;
					margin: 0 8px 8px 0;
					display: flex;
					justify-content: space-between;
					align-items: center;

					& span:first-child {
						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #fff;
						line-height: 17px;
					}

					img {
						width: 10px;
						height: 10px;
						margin-left: 4px;

						cursor: pointer;
					}
				}
			}
			.tag-main::-webkit-scrollbar {
				width: 6px;
			}

			.tag-main::-webkit-scrollbar-thumb {
				background: #dddddd;
				border-radius: 10px;
			}

			.tag-main::-webkit-scrollbar-track {
				background: transparent;
			}
		}

		.details {
			width: auto;
			height: auto;

			margin-top: 10px;
			.details-top {
				padding-top: 4px;
				width: 100%;
				display: flex;
				justify-content: space-between;
				height: 20px;
				align-items: center;
				margin-bottom: 12px;
				& p:first-child {
					font-size: 14px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #333333;
				}

				& p:last-child {
					font-size: 12px;
					font-family: Source Han Sans CN-Normal, Source Han Sans CN;
					font-weight: 350;
					color: #333333;
					cursor: pointer;
					display: flex;
					align-items: center;
					img {
						width: 12px;
						height: 12px;
						margin-right: 4px;
					}
				}
			}

			.details-main {
				width: 100%;
				height: calc(100vh - 606px);
				overflow-y: auto;

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
				.desc {
					margin: 30px 0 20px 0;
					h3 {
						font-size: 14px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #333333;

						margin-bottom: 10px;
					}

					:deep(.el-textarea__inner) {
						box-shadow: none;
						resize: none;
						padding-left: 10px;
						border-radius: 8px;
						width: 254px;
						min-height: 100px;
						background: #f9fafc;
						border-radius: 8px;
						padding: 10px;
						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #333333;

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
					}
				}
				p {
					display: flex;
					justify-content: space-between;
					.one {
						width: 54px;
						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #999999;
						line-height: 18px;
						display: inline-block;
					}
					.two {
						margin-left: 20px;
						font-size: 12px;
						font-family: Source Han Sans CN-Normal, Source Han Sans CN;
						font-weight: 350;
						color: #333333;
						line-height: 18px;
					}

					:deep(.el-input__wrapper) {
						width: 190px;
						height: 16px;

						background: #f9fafc;
						border-radius: 6px 6px 6px 6px;
						border-style: none;
						box-shadow: none;
					}

					:deep(.el-input__inner) {
						height: 16px;
					}
				}
			}
		}
	}
}
</style>
