export interface BoardQuery {
	/**
	 * 留言企业名称
	 */
	enterprise: string
	/**
	 * 已读未读状态 1未读 2已读
	 */
	is_read: number
	/**
	 * 留言姓名
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
	project_id: number
}

export interface MessageItem {
	/**
	 * 公司id
	 */
	company_id: number
	/**
	 * 创建时间
	 */
	created_at: string
	/**
	 * 留言企业名称
	 */
	enterprise: string
	/**
	 * 留言id
	 */
	id: number
	/**
	 * 已读未读状态 1未读 2已读
	 */
	is_read: number
	/**
	 * 客服id
	 */
	kefu_id: number
	/**
	 * 客服名称
	 */
	kefu_name: string
	/**
	 * 留言消息
	 */
	leave_word_mess: string
	/**
	 * 留言姓名
	 */
	name: string
	/**
	 * 留言手机号
	 */
	phone: string
	/**
	 * 项目id
	 */
	project_id: number
	/**
	 * 项目名称
	 */
	project_name: string
	/**
	 * QQ号码
	 */
	qq: string
	/**
	 * 读取时间
	 */
	read_time: string | null
	/**
	 * 更新时间
	 */
	updated_at: string
	/**
	 * 访客id
	 */
	visitor_id: number
	/**
	 * 访客名称
	 */
	visitor_name: string
	/**
	 * 组件渠道id
	 */
	widget_chan_id: number
	/**
	 * 组件渠道名称
	 */
	widget_chan_name: string
	/**
	 * 微信号码
	 */
	wx: string
}
