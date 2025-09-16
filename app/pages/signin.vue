<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="height: 100vh; background-color: #f5f5f5;">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-8" elevation="8">
              <div class="text-center mb-8">
                <h1 class="text-h4 font-weight-bold mb-2">用户注册</h1>
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

                <div class="d-flex align-center gap-2 mb-3">
                  <v-text-field
                    v-model="verificationCode"
                    label="验证码"
                    :rules="verificationCodeRules"
                    prepend-inner-icon="mdi-shield-check"
                    variant="outlined"
                    required
                  />
                  <v-btn
                    :disabled="!isValidEmail || isCountingDown"
                    color="primary"
                    @click="sendVerificationCode"
                  >
                    {{ countdownText }}
                  </v-btn>
                </div>

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

                <v-text-field
                  v-model="confirmPassword"
                  label="确认密码"
                  :rules="confirmPasswordRules"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-check"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  variant="outlined"
                  required
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />

                <div class="d-flex flex-column gap-6 mt-6">
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="isLoading"
                    :disabled="!isFormValid"
                  >
                    注册
                  </v-btn>

                  <div class="text-center">
                    <span class="text-medium-emphasis">已有账号？</span>
                    <a class="text-decoration-none cursor-pointer" @click="router.push('/login')">返回登录</a>
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
const confirmPassword = ref('')
const verificationCode = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const countdown = ref(0)

const emailRules = [
  v => !!v || '邮箱地址不能为空',
  v => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址',
  v => v.endsWith('@lzu.edu.cn') || '必须使用兰州大学邮箱'
]

const passwordRules = [
  v => !!v || '密码不能为空',
  v => v.length >= 6 || '密码长度至少为6位',
  v => /[A-Z]/.test(v) || '密码必须包含至少一个大写字母',
  v => /[0-9]/.test(v) || '密码必须包含至少一个数字'
]

const confirmPasswordRules = [
  v => !!v || '请确认密码',
  v => v === password.value || '两次输入的密码不一致'
]

const verificationCodeRules = [
  v => !!v || '请输入验证码',
  v => v.length === 6 || '验证码长度应为6位'
]

const isValidEmail = computed(() => {
  return email.value && email.value.endsWith('@lzu.edu.cn')
})

const countdownText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}秒后重试`
  }
  return '发送验证码'
})

const isCountingDown = computed(() => countdown.value > 0)

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendVerificationCode = async () => {
  try {
    // 这里添加发送验证码的逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  try {
    // 这里添加注册逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
