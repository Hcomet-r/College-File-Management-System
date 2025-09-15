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

        <v-list density="default" nav class="text-subtitle-1">
          <v-list-item prepend-icon="mdi-home" title="主页" value="message" to="/" class="mb-2"/>
          <v-list-item prepend-icon="mdi-folder" title="我的文件"  value="files" to="/files" class="mb-2"/>
          <v-list-item prepend-icon="mdi-delete" title="回收站" value="recycle" to="/recycle" class="mb-2"/>
          <v-list-item prepend-icon="mdi-cog" title="设置" value="settings" to="/settings" class="mb-2"/>
          <v-list-item prepend-icon="mdi-account" title="测试" value="text" to="/login" class="mb-2"/>
       </v-list>
      </v-navigation-drawer>
      <v-main>  <NuxtPage />  </v-main>
  </v-layout>
</template>
