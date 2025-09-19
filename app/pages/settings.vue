<template>
  <v-container class="pa-6">
    <h1 class="text-h4 mb-6">系统设置</h1>
    
    <!-- 个人资料卡片 -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">
        <v-icon start icon="mdi-account-circle" class="mr-2"/>
        个人资料
      </v-card-title>
      <v-card-text>
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="4" class="text-center">
            <v-avatar size="120" class="mb-2">
              <v-img :src="userSettings.avatar || '/user.png'" alt="avatar"/>
            </v-avatar>
            <div>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                class="mt-2"
                prepend-icon="mdi-camera"
                @click="handleAvatarUpload"
              >
                更换头像
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="userSettings.name"
              label="用户名"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              :readonly="!isEditingName"
            />
            <div class="mt-2">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="toggleNameEdit"
              >
                {{ isEditingName ? '完成' : '修改用户名' }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 账号安全卡片 -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">
        <v-icon start icon="mdi-shield-lock" class="mr-2"/>
        账号安全
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              prepend-icon="mdi-lock"
              variant="outlined"
              class="mr-4"
              @click="showChangePasswordDialog = true"
            >
              修改密码
            </v-btn>
            <v-btn
              color="info"
              prepend-icon="mdi-lock-reset"
              variant="outlined"
              @click="showForgotPasswordDialog = true"
            >
              忘记密码
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 通知设置卡片 -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">
        <v-icon start icon="mdi-bell" class="mr-2"/>
        通知设置
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-switch
              v-model="userSettings.emailNotifications"
              label="邮件通知"
              color="primary"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 显示设置卡片 -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">
        <v-icon start icon="mdi-theme-light-dark" class="mr-2"/>
        显示设置
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-switch
              v-model="userSettings.darkMode"
              label="深色模式"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="userSettings.language"
              :items="languages"
              label="语言"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 修改密码对话框 -->
    <v-dialog v-model="showChangePasswordDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          修改密码
        </v-card-title>
        <v-card-text>
          <v-form v-model="isPasswordFormValid" @submit.prevent="handleChangePassword">
            <v-text-field
              v-model="passwordForm.currentPassword"
              label="当前密码"
              type="password"
              variant="outlined"
              required
            />
            <v-text-field
              v-model="passwordForm.newPassword"
              label="新密码"
              type="password"
              variant="outlined"
              required
              :rules="passwordRules"
            />
            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="确认新密码"
              type="password"
              variant="outlined"
              required
              :rules="[v => v === passwordForm.newPassword || '两次输入的密码不一致']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn
            color="grey"
            variant="text"
            @click="showChangePasswordDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!isPasswordFormValid"
            @click="handleChangePassword"
          >
            确认修改
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 忘记密码对话框 -->
    <v-dialog v-model="showForgotPasswordDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          重置密码
        </v-card-title>
        <v-card-text>
          <v-form v-model="isForgotPasswordFormValid" @submit.prevent="handleForgotPassword">
            <v-text-field
              v-model="forgotPasswordForm.email"
              label="邮箱地址"
              type="email"
              variant="outlined"
              required
              :rules="emailRules"
              class="mb-4"
            />
            
            <div class="d-flex align-center gap-4 mb-4">
              <v-text-field
                v-model="forgotPasswordForm.verificationCode"
                label="验证码"
                variant="outlined"
                required
                :rules="verificationCodeRules"
              />
              <v-btn
                color="primary"
                :disabled="!isValidEmail || isCountingDown"
                min-width="120"
                @click="sendVerificationCode"
              >
                {{ countdownText }}
              </v-btn>
            </div>

            <v-text-field
              v-model="forgotPasswordForm.newPassword"
              label="新密码"
              type="password"
              variant="outlined"
              required
              :rules="passwordRules"
            />
            <v-text-field
              v-model="forgotPasswordForm.confirmPassword"
              label="确认新密码"
              type="password"
              variant="outlined"
              required
              :rules="[v => v === forgotPasswordForm.newPassword || '两次输入的密码不一致']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn
            color="grey"
            variant="text"
            @click="showForgotPasswordDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!isForgotPasswordFormValid"
            @click="handleForgotPassword"
          >
            重置密码
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 保存按钮 -->
    <v-row class="mt-6">
      <v-col class="text-right">
        <v-btn
          color="primary"
          size="large"
          :loading="isSaving"
          @click="saveSettings"
        >
          保存设置
        </v-btn>
      </v-col>
    </v-row>

    <!-- 隐藏的文件上传输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileSelected"
    >
  </v-container>
</template>

<script setup>

import { useUserInfo } from '../composables/useUserInfo'
const { userInfo, updateUserInfo, loadUserInfo } = useUserInfo()

// 创建响应式的用户设置
const userSettings = reactive({
  name: '',
  avatar: '',
  darkMode: false,
  language: '简体中文',
  emailNotifications: true
})

// 在组件挂载时加载用户信息
onMounted(async () => {
  await loadUserInfo()
})

// 使用watch来响应userInfo的变化
watch(() => userInfo.value, (newUserInfo) => {
  console.log('userInfo changed:', newUserInfo)
  if (newUserInfo) {
    userSettings.name = newUserInfo.name || ''
    userSettings.avatar = newUserInfo.avatar || ''
  }
}, { immediate: true, deep: true })

const isEditingName = ref(false)

const toggleNameEdit = () => {
  isEditingName.value = !isEditingName.value
  if (!isEditingName.value) {
    // 当完成编辑时，更新用户信息
    updateUserInfo({
      name: userSettings.name
    })
  }
}

const languages = ['简体中文', 'English']
const isSaving = ref(false)
const showChangePasswordDialog = ref(false)
const showForgotPasswordDialog = ref(false)
const isPasswordFormValid = ref(false)
const isForgotPasswordFormValid = ref(false)
const fileInput = ref(null)

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 忘记密码表单
const forgotPasswordForm = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证码相关
const countdown = ref(0)
const isCountingDown = computed(() => countdown.value > 0)
const countdownText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}秒后重试` : '发送验证码'
})

// 验证规则
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

const verificationCodeRules = [
  v => !!v || '请输入验证码',
  v => v.length === 6 || '验证码长度应为6位'
]

const isValidEmail = computed(() => {
  const email = forgotPasswordForm.email
  return email && email.endsWith('@lzu.edu.cn')
})

// 头像上传相关方法
const handleAvatarUpload = () => {
  fileInput.value.click()
}

const onFileSelected = async (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target.result
      // 更新本地状态
      userSettings.avatar = imageData
      // 更新全局用户信息
      await updateUserInfo({
        avatar: imageData
      })
      // 确保数据被保存
      await loadUserInfo()
    }
    reader.readAsDataURL(file)
  }
}

// 发送验证码
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
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

// 保存设置
const saveSettings = async () => {
  isSaving.value = true
  try {
    console.log('开始保存设置')
    
    // 更新全局用户信息
    await updateUserInfo({
      name: userSettings.name,
      avatar: userSettings.avatar
    })
    console.log('用户信息已更新')
    
    // 保存其他设置
    if (import.meta.client) {
      const appSettings = {
        darkMode: userSettings.darkMode,
        language: userSettings.language,
        emailNotifications: userSettings.emailNotifications
      }
      localStorage.setItem('app_settings', JSON.stringify(appSettings))
      console.log('应用设置已保存:', appSettings)
    }

    // 重新加载用户信息
    await loadUserInfo()
    console.log('用户信息已重新加载')
    
    // 延迟刷新页面
    await new Promise(resolve => {
      console.log('准备刷新页面')
      setTimeout(() => {
        if (import.meta.client) {
          console.log('正在刷新页面')
          window.location.reload()
        }
        resolve()
      }, 1000)
    })
  } catch (error) {
    console.error('保存设置失败:', error)
  } finally {
    isSaving.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!isPasswordFormValid.value) return
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showChangePasswordDialog.value = false
    // 这里添加修改密码的逻辑
  } catch (error) {
    console.error('修改密码失败:', error)
  }
}

// 忘记密码
const handleForgotPassword = async () => {
  if (!isForgotPasswordFormValid.value) return
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showForgotPasswordDialog.value = false
    // 这里添加重置密码的逻辑
  } catch (error) {
    console.error('重置密码失败:', error)
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style>