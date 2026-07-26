import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const apiUrl = ref(localStorage.getItem('apiUrl') || 'https://proxy.cf-io.workers.dev')
  const token = ref(sessionStorage.getItem('token') || '')

  function setApiUrl(url: string) {
    apiUrl.value = url
    localStorage.setItem('apiUrl', url)
  }

  function setToken(newToken: string) {
    token.value = newToken
    if (newToken) {
      sessionStorage.setItem('token', newToken)
    } else {
      sessionStorage.removeItem('token')
    }
  }

  return { apiUrl, token, setApiUrl, setToken }
})