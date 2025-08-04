import api from '@/api'
import { baseCallApi } from '@/utils/uapi'

const tokenKey = 'token'

const setToken = (token: string) => {
  localStorage.setItem(tokenKey, token)
}
const setUserAbbr = (userabbr: string) => {
  localStorage.setItem('userabbr', userabbr)
}

const getToken = () => {
  return localStorage.getItem(tokenKey)
}
const getUserAbbr = () => {
  return localStorage.getItem('userabbr')
}

const login = async (acc: string, pwd: string, comp: string, code: string, code_id: string) => {
  const res: any = await baseCallApi({
    method: 'POST',
    url: api.Login.VerifyAccount,
    data: {
      username: acc,
      password: pwd,
      comp: comp,
      check_code: code,
      check_code_id: code_id
    }
  })
  if (res?.status === 200) {
    const data = res?.data
    if (data?.token) {
      setToken(data.token)
      if (data?.userabbr) {
        setUserAbbr(data.userabbr)
      }
      return true
    }
  }
  return false
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userabbr')
}

export { getToken, getUserAbbr, login, logout }
