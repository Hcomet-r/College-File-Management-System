import { reactive, ref } from 'vue'

export const useUserInfo = () => {
  const userInfo = ref({
    name: '',
    email: '',
    avatar: ''
  })

  // 从 localStorage 加载用户信息
  const loadUserInfo = () => {
    if (import.meta.client) {
      console.log('Loading user info from localStorage')
      const savedInfo = localStorage.getItem('user_info')
      console.log('Saved info:', savedInfo)
      
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo)
          userInfo.value = {
            ...userInfo.value,
            ...parsed
          }
          console.log('Loaded user info:', userInfo.value)
        } catch (e) {
          console.error('Error parsing saved user info:', e)
        }
      } else {
        // 设置默认值
        userInfo.value = {
          name: 'User Name',
          email: 'test@lzu.edu.cn',
          avatar: '/user.png'
        }
        console.log('Using default values:', userInfo.value)
      }
    }
  }

  const updateUserInfo = (newInfo: Partial<typeof userInfo.value>) => {
    console.log('Updating user info with:', newInfo)
    
    // 更新 userInfo
    userInfo.value = {
      ...userInfo.value,
      ...newInfo
    }
    
    console.log('Updated userInfo:', userInfo.value)
    
    // 保存到 localStorage
    if (import.meta.client) {
      try {
        const dataToSave = JSON.stringify(userInfo.value)
        localStorage.setItem('user_info', dataToSave)
        console.log('Saved to localStorage:', dataToSave)
      } catch (e) {
        console.error('Error saving user info:', e)
      }
    }
  }

  return {
    userInfo,
    updateUserInfo,
    loadUserInfo
  }
}