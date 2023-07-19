const TOKEN_KEY = 'youToChatToken'

export function getToken() {
	return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
	return localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
	return localStorage.removeItem(TOKEN_KEY)
}

export function setFlagItme(name: string, value: any) {
	return localStorage.setItem(name, value)
}

export function getFlagItme(name: string) {
	return localStorage.getItem(name)
}

export function removetFlagItme(name: string) {
	return localStorage.removeItem(name)
}
