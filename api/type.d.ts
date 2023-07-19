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

export interface File_info {
	file_name: string
	file_size: number
	file_url: string
	file_type: string
}

export interface File {
	file_info: File_info
}

export interface TagItem {
	id: number
	created_at: string
	updated_at: string
	labels_name: string
	labels_desc: string
	color_value: string
}

export interface Tag {
	is_all: boolean
	page_size: number
	page: number
	total_rows: number
	total_pages: number
	rows: TagItem[]
}

export interface AllData {
	is_all: boolean
	page: number
	page_size: number
	rows: []
	total_pages: number
	total_rows: number
}

export interface Dictionary {
	id: number
	name?: string
	content?: string
}

interface Statistics {
	num: NumData
	list: ListData[]
}

export interface NumData {
	first_response_duration: number
	average_response_duration: number
	average_server_duration: number
	dialogue_valid: number
	reception_num: number
	interview_num: number
	block_num: number
	reviews_num: number
	negative_reviews_num: number
}

export interface ListData {
	user_id: string
	reviews_num: number
	reception_num: number
	work_order_num: number
	group_id: string
	negative_reviews_rate: number
	name: string
	block_num: number
	negative_reviews_num: number
	group_name: string
	first_response_duration: number
	dialogue_valid: number
}
