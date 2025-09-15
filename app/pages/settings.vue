<template>
  <v-container class="pa-6">
    <h1 class="text-h4 mb-6">系统设置</h1>
    
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">
        <v-icon start icon="mdi-account-circle" class="mr-2"/>
        个人信息
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userSettings.name"
              label="用户名"
              variant="outlined"
              prepend-inner-icon="mdi-account"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="userSettings.email"
              label="邮箱"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              readonly
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">
        <v-icon start icon="mdi-shield-lock" class="mr-2"/>
        安全设置
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              prepend-icon="mdi-lock"
              variant="outlined"
              @click="showChangePasswordDialog = true"
            >
              修改密码
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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

    <v-card>
      <v-card-title class="text-h6 pa-4">
        <v-icon start icon="mdi-bell" class="mr-2"/>
        通知设置
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-switch
              v-model="userSettings.emailNotifications"
              label="邮件通知"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-switch
              v-model="userSettings.desktopNotifications"
              label="桌面通知"
              color="primary"
              hide-details
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
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'

const userSettings = reactive({
  name: 'User Name',
  email: 'user@lzu.edu.cn',
  darkMode: false,
  language: '简体中文',
  emailNotifications: true,
  desktopNotifications: false
})

const languages = ['简体中文', 'English']
const isSaving = ref(false)
const showChangePasswordDialog = ref(false)
const isPasswordFormValid = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = [
  v => !!v || '密码不能为空',
  v => v.length >= 6 || '密码长度至少为6位',
  v => /[A-Z]/.test(v) || '密码必须包含至少一个大写字母',
  v => /[a-z]/.test(v) || '密码必须包含至少一个小写字母',
  v => /[0-9]/.test(v) || '密码必须包含至少一个数字'
]

const saveSettings = async () => {
  isSaving.value = true
  try {
    // 这里添加保存设置的逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 显示成功提示
  } catch (error) {
    console.error('保存设置失败:', error)
  } finally {
    isSaving.value = false
  }
}

const handleChangePassword = async () => {
  if (!isPasswordFormValid.value) return

  try {
    // 这里添加修改密码的逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    showChangePasswordDialog.value = false
    // 显示成功提示
  } catch (error) {
    console.error('修改密码失败:', error)
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style>