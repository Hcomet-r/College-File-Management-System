<!-- eslint-disable vue/multi-word-component-names -->
<template>
<v-app>
    <v-main>
        <v-container>
            <ul>
                <li><NuxtLink to="/login">登录</NuxtLink></li>
                <li><NuxtLink to="/settings">设置</NuxtLink></li>
            </ul>
        </v-container>
    </v-main>
</v-app>
</template>
<script setup>

</script>
<style scoped>
ul {
    list-style: none;
    padding: 0;
}
</style>