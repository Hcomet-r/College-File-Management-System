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
          <v-list-item prepend-icon="mdi-star" title="主页" value="message" to="/"/>
          <v-list-item prepend-icon="mdi-folder" title="我的文件"  value="files" to="/files"/>
          <v-list-item prepend-icon="mdi-account-multiple" title="回收站" value="recycle" to="/recycle"/>
          <v-list-item prepend-icon="mdi-star" title="设置" value="settings" to="/settings"/>
          <v-list-item prepend-icon="mdi-star" title="测试" value="text" to="/login"/>
       </v-list>
      </v-navigation-drawer>
      <v-main>  <NuxtPage />  </v-main>
  </v-layout>
</template>
