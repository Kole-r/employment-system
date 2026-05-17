import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    token: '',
    id: '',
    username: '',
    role: 0,
    real_name: '',
    avatar: '',
    phone: '',
    email: '',
    major: '',
    degree: '',
    graduation_year: '',
    university: '',
    city_preference: '',
    job_preference: '',
    bio: '',
  }),
  actions: {
    updateInfo(info) {
      Object.assign(this, info)
    },
    updateToken(token) {
      this.token = token
    },
    clearInfo() {
      this.$reset()
    }
  },
  persist: true
})
