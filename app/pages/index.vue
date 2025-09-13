<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-layout class="rounded rounded-md border">
    <v-app-bar prominent title="文件管理系统" >
      <template #image >
    <v-img
      src="~/assets/math.png"  
      style="object-fit: contain"/>
      </template>
    </v-app-bar>
    <v-navigation-drawer
        expand-on-hover
        permanent
        rail
      >
        <v-list>
          <v-list-item
            prepend-avatar="~/assets/user.png"
            subtitle="???@lzu.edu.cn"
            title="User Name"
          />
        </v-list>

        <v-divider/>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-folder" title="我的文件"  value="myfiles" to="/login"/>
          <v-list-item prepend-icon="mdi-account-multiple" title="合作" value="shared"/>
          <v-list-item prepend-icon="mdi-star" title="设置" value="settings" to="/settings"/>
       </v-list>
      </v-navigation-drawer>

    <v-main>
      <v-container class="d-flex align-center justify-center" style="height: 100vh">
        <v-row>
          <v-col class="text-center">
            <h1>Welcome to Document Management System</h1>
            <p>This is the home page. Use the navigation drawer to access different sections.</p>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>
<script setup>

</script>
<style scoped>

</style>