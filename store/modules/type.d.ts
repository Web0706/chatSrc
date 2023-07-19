export interface UserInfo {
	id: number
	created_at: string
	updated_at: string
	name: string
	email: string
	phone: string
	status: number
	secret: string
	line: string
	login_time: number
	is_admin: number
	roles_id: number
	company_id: number
	user_code: string
	user_project: {
		id: number
		proj_nane: string
	}[]
	company_name: string
	explain: string
}
