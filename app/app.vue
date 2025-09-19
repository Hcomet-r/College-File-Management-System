<script setup>
import { useUserInfo } from './composables/useUserInfo'

const router = useRouter()
const userEmail = ref('???@lzu.edu.cn')
const { userInfo, loadUserInfo } = useUserInfo()

// 检查登录状态
const checkAuth = () => {
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token')
    const storedEmail = localStorage.getItem('user_email')
    if (storedEmail) {
      userEmail.value = storedEmail
    }
    const currentPath = window.location.pathname
    if (!token && currentPath !== '/login' && currentPath !== '/signin') {
      router.push('/login')
    }
  }
}

// 在组件挂载时检查登录状态和加载用户信息
onMounted(() => {
  checkAuth()
  loadUserInfo()
})

const handleLogout = () => {
  if (import.meta.client) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_email')
    userEmail.value = '???@lzu.edu.cn'
    router.push('/login')
  }
}
</script>

<template>
  <v-layout class="rounded rounded-md border">
    <template v-if="$route.path !== '/login' && $route.path !== '/signin'">
      <v-app-bar prominent title="文件管理系统">
        <template #image>
          <v-img src="~/assets/math.png" style="object-fit: contain" />
        </template>
      </v-app-bar>
      <v-navigation-drawer expand-on-hover permanent rail>
        <v-list>
          <v-list-item :prepend-avatar="userInfo.avatar" :subtitle="userEmail" :title="userInfo.name" />
        </v-list>

        <v-divider />

        <v-list density="default" nav class="text-subtitle-1">
          <v-list-item prepend-icon="mdi-home" title="主页" value="message" to="/" class="mb-2" />
          <v-list-item prepend-icon="mdi-folder" title="我的文件" value="files" to="/files" class="mb-2" />
          <v-list-item prepend-icon="mdi-delete" title="回收站" value="recycle" to="/recycle" class="mb-2" />
          <v-list-item prepend-icon="mdi-cog" title="设置" value="settings" to="/settings" class="mb-2" />
          <v-list-item prepend-icon="mdi-logout" title="退出登录" value="logout" class="mb-2" @click="handleLogout" />
        </v-list>
      </v-navigation-drawer>
    </template>
    <v-main>
      <NuxtPage />
    </v-main>
  </v-layout>
</template>
