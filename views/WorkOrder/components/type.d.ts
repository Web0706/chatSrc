export interface Orderquery {
	/**
	 * 延期天数
	 */
	delay_days: string
	/**
	 * 工单描述
	 */
	desc: string
	/**
	 * 是否查自己 1查自己 不查自己就不传
	 */
	is_own: number
	/**
	 * 受理人
	 */
	kefu_name: string
	/**
	 * 被驳回工单 1表示查询被驳回订单
	 */
	own_reject: number
	/**
	 * 页码
	 */
	page: number
	/**
	 * 页条数
	 */
	page_size: number
	/**
	 * 优先级 1.普通 2 一般 3紧急 4 非常紧急
	 */
	priority: string
	/**
	 * 项目id
	 */
	project_id: number
	/**
	 * 项目名称
	 */
	project_name: string
	/**
	 * 1:待处理 2:处理中 3:已处理 4:已驳回
	 */
	status: any
	/**
	 * 工单标题
	 */
	title: string
	/**
	 * 访客名称
	 */
	visitor_name: string
}

export interface OrderItem {
	company_id?: number
	created_at?: string
	creator_id?: number
	creator_name?: string
	delay_days?: number
	desc?: string
	id?: number
	images?: string
	is_active?: number
	kefu_id?: number
	kefu_name?: string
	priority?: number
	project_id?: number
	project_name?: string
	reality_time?: null
	reckon_time?: string
	result_desc?: string
	status?: number
	title?: string
	updated_at?: string
	visitor_id?: number
	visitor_name?: string
	work_status?: number
	work_status_name?: string
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

export interface OrderParams {
	/**
	 * 工单id
	 */
	id: number
	/**
	 * 是否指派或者更换 1是
	 */
	is_active: number
	/**
	 * 指派受理人(自己接单这个值不传)
	 */
	kefu_id: number
	/**
	 * 结果描述
	 */
	result_desc: string
	/**
	 * 1:待处理 2:处理中 3:已处理 4:已驳回
	 */
	status: number
}

export interface WorkOrderNode {
	id: number
	created_at: string
	updated_at: string
	company_id: number
	title: string
	desc: string
	project_id: number
	work_status: number
	visitor_id: number
	status: number
	kefu_id: number
	priority: number
	reckon_time: string
	reality_time: null | string
	images: string
	result_desc: string
	delay_days: number
	creator_id: number
	is_active: number
	project_name: string
	work_status_name: string
	visitor_name: string
	kefu_name: string
	creator_name: string
	work_tick_img: WorkTicketImage[]
}

interface WorkTicketImage {
	id: number
	company_id: number
	image: string
	work_ticket_id: number
	feedback_id: number
}

export interface ViewQuery {
	/**
	 * 结束时间
	 */
	end_time: string
	/**
	 * 客服id
	 */
	kefu_id: string
	/**
	 * 页码
	 */
	page: number
	/**
	 * 页条数
	 */
	page_size: number
	/**
	 * 项目id
	 */
	project_id: number
	/**
	 * 开始时间
	 */
	start_time: string
}

export interface Count {
	/**
	 * 工单大厅的
	 */
	count_num: number
	/**
	 * 被我拨回的
	 */
	creator_rejected_count: number
	/**
	 * 我已经处理的
	 */
	processed_count: number
	/**
	 * 需要我处理的
	 */
	processing_count: number
	/**
	 * 我驳回的
	 */
	rejected_count: number
}
