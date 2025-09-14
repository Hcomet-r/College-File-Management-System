<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="height: 100vh; background-color: #f5f5f5;">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-8" elevation="8">
              <div class="text-center mb-8">
                <h1 class="text-h4 font-weight-bold mb-2">欢迎登录</h1>
                <p class="text-body-1 text-medium-emphasis">兰州大学文件管理系统</p>
              </div>

              <v-form v-model="isFormValid" @submit.prevent="handleSubmit">
                <v-text-field
                  v-model="email"
                  label="邮箱地址"
                  :rules="emailRules"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  required
                />

                <v-text-field
                  v-model="password"
                  label="密码"
                  :rules="passwordRules"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  variant="outlined"
                  required
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-checkbox
                  v-model="rememberMe"
                  label="记住我"
                  color="primary"
                  hide-details
                  class="mb-6"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="isLoading"
                  :disabled="!isFormValid"
                >
                  登录
                </v-btn>

                <div class="text-center mt-4">
                  <a href="#" class="text-decoration-none">忘记密码？</a>
                </div>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isFormValid = ref(false)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const emailRules = [
  v => !!v || '邮箱地址不能为空',
  v => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
]

const passwordRules = [
  v => !!v || '密码不能为空',
  v => v.length >= 6 || '密码长度至少为6位'
]

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  try {
    // 这里添加登录逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
</style>