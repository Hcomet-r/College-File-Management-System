<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="height: 100vh; background-color: #f5f5f5;">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-8" elevation="8">
              <div class="text-center mb-8">
                <h1 class="text-h4 font-weight-bold mb-2">欢迎登录</h1>
                <p class="text-body-1 text-medium-emphasis">数院文件管理系统</p>
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

                <div v-if="errorMessage" class="text-error mb-4 text-center">
                  {{ errorMessage }}
                </div>

                <div class="d-flex flex-column gap-6">
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

                  <v-divider class="my-2"/>

                  <v-btn
                    color="secondary"
                    size="large"
                    block
                    :disabled="isLoading"
                    @click="handleRegister"
                  >
                    注册
                  </v-btn>

                  <div class="text-center">
                    <a href="#" class="text-decoration-none">忘记密码？</a>
                  </div>
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

const router = useRouter()
const isFormValid = ref(false)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')

// 测试账号信息
const TEST_ACCOUNT = {
  email: 'test@lzu.edu.cn',
  password: 'A123456'
}

const emailRules = [
  v => !!v || '邮箱地址不能为空',
  v => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址',
  v => v.endsWith('@lzu.edu.cn') || '必须使用兰州大学邮箱'
]

const passwordRules = [
  v => !!v || '密码不能为空',
  v => v.length >= 6 || '密码长度至少为6位'
]

const handleSubmit = async () => {
  if (!isFormValid.value) return
  errorMessage.value = ''
  isLoading.value = true

  try {
    // 模拟登录验证
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (email.value === TEST_ACCOUNT.email && password.value === TEST_ACCOUNT.password) {
      // 保存登录状态
      localStorage.setItem('auth_token', 'test_token')
      localStorage.setItem('user_email', email.value)
      
      // 如果选择了记住我，保存额外信息
      if (rememberMe.value) {
        localStorage.setItem('remember_email', email.value)
      } else {
        localStorage.removeItem('remember_email')
      }
      
      // 跳转到主页
      router.push('/')
    } else {
      errorMessage.value = '邮箱或密码错误'
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = () => {
  router.push('/signin')
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
</style>