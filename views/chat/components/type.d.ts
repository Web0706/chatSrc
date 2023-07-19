export interface Info {
	avator: string
	can_change: boolean
	chat_num: number
	city: string
	client_ip: string
	company_id: number
	consulting_num: number
	created_at: string
	desc: string
	email: string
	enterprise: string
	extra: string
	feacebook: string
	follow_name: string
	follow_status: number
	id: number
	is_evaluate: boolean
	is_lib: number
	is_save: number
	kf_name: string
	last_content: string
	last_date: string
	last_msg_id: number
	last_time: string
	lat: string
	long: string
	name: string
	phone: string
	project_id: number
	project_name: string
	qq: string
	refer: string
	remark: string
	select: string
	serve_sum: number
	source_ip: string
	status: number
	tags: string
	tags_list: Label[]
	telephone: string
	to_id: string
	to_kefu_translate: string
	to_visitor_translate: string
	translate_status: number
	twitter: string
	updated_at: string
	visitor_id: string
	visitor_name: string
	weixin: string
	widget_chan_id: number
	widget_chan_name: string
}

export interface Label {
	color_value: string
	id: number
	labels_name: string
}

export interface TagItem {
	id: number
	created_at: string
	updated_at: string
	labels_name: string
	labels_desc: string
	color_value: string
	active?: boolean
}

export interface Query {
	/**
	 * 查询聊天字段
	 */
	content: string
	/**
	 * 邮箱
	 */
	email: string
	/**
	 * feacebook
	 */
	feacebook: string
	/**
	 * 1已应答  2未应答 0全部
	 */
	is_res: number
	/**
	 * 页码
	 */
	page: number
	/**
	 * 页条数
	 */
	page_size: number
	/**
	 * 手机号
	 */
	phone: string
	/**
	 * 项目ID
	 */
	project_id: number
	/**
	 * qq
	 */
	qq: string
	/**
	 * 备注
	 */
	remark: string
	/**
	 * twitter
	 */
	twitter: string
	/**
	 * 访客昵称
	 */
	visitor_name: string
	/**
	 * 微信号
	 */
	weixin: string
}

export interface Record {
	/**
	 * 查询结果是否包含msg_id。0:不包含; 1:包含
	 */
	content_msg?: number
	/**
	 * 以msg_id所在数据的时间开始，查找数据方向；0: 时间增加1:时间减少
	 */
	forward_or_back?: number
	/**
	 * 是否获取到最新的数据，0:正常获取，以page_size为准; 1:获取到最新的数据，page_size无效，forward_or_back===0;
	 */
	is_to_latest?: number
	/**
	 * 查询指定的消息id，空获取最新的page_size 条数据
	 */
	msg_id?: number
	page: number
	/**
	 * 页码，默认20条
	 */
	page_size: number
	/**
	 * 搜索关键字
	 */
	search_key: string
	/**
	 * 搜索类型 ，0:全部;1:图片视频;2:文件; 3:链接;
	 */
	search_type: number
	/**
	 * 访客唯一id
	 */
	visitor_id: string
	is_kefu: number
}

export interface RecordMessage {
	content: string
	kefu_avator: string
	kefu_name: string
	kefu_secret: string
	mes_type: string
	msg_id: number
	nickname: string
	read: boolean
	size: number
	time: string
	time_stamp: number
	translation: string
	type: number
	visitor_avator: string
	visitor_id: string
	visitor_name: string
	withdraw: number
	withdraw_time: number
	is_img?: boolean
	is_file?: boolean
}

export interface AddOrder {
	desc: string
	images: string[]
	kefu_id: number
	priority: number
	project_id: number
	reckon_time: string
	title: string
	visitor_id: string
	work_status: number
}

export interface Dictionary {
	id: number
	name?: string
	content?: string
}

export interface TrackItem {
	company_id: number
	created_at: string
	desc: string
	id: number
	length_of_time: number
	new_kefu_id: string
	new_kefu_name: string
	old_kefu_id: string
	old_kefu_name: string
	project_id: number
	s_type: number
	updated_at: string
	visitor_id: string
}
