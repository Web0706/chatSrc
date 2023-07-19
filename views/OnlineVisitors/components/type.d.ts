export interface OnLineQuery {
	/**
	 * 邮箱
	 */
	email: string
	/**
	 * 脸书账号
	 */
	feacebook: string
	/**
	 * 跟进状态
	 */
	follow_status: string
	/**
	 * 标签id
	 */
	labels_id: string
	/**
	 * 0表示不在客户库 1 表示客户库
	 */
	lib: number
	/**
	 * 姓名
	 */
	name: string
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
	 * 0表示不在线 1 在线
	 */
	status: number
	/**
	 * 客服唯一key
	 */
	kf_name: string
	/**
	 * 推特账号
	 */
	twitter: string
	/**
	 * 微信
	 */
	weixin: string
	/**
	 * 组件渠道id
	 */
	widget_chan_id: string

	online_visitors: number
}

export interface SelectItem {
	id: number
	name: string
	phone: string
	email: string
	weixin: string
	twitter: string
	feacebook: string
	enterprise: string
	remark: string
	tags: string
	tags_list: any[] | null
	follow_name: string
	follow_status: number
	consulting_num: number
	serve_sum: number
	created_at: string
	last_date: string
	last_time: number
	source_ip: string
	client_ip: string
	city: string
	to_id: string
	visitor_id: string
	kf_name: string
	is_lib: number
	project_id: number
	project_name: string
	widget_chan_id: number
	widget_chan_name: string
	status: number
}
