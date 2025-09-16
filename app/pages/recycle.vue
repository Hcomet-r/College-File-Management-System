<template>
  <v-layout class="rounded rounded-md border">
    <v-main>
      <v-container>
        <v-row class="mb-2" align="center" justify="space-between">
          <v-col cols="12" md="8">
            <h2>回收站</h2>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn variant="tonal" size="small" @click="refresh" :loading="loading">刷新</v-btn>
          </v-col>
        </v-row>

        <v-row v-if="errorMessage">
          <v-col cols="12">
            <v-alert type="error" variant="tonal">{{ errorMessage }}</v-alert>
          </v-col>
        </v-row>

        <v-row v-if="loading">
          <v-col cols="12"><v-progress-linear indeterminate color="primary" /></v-col>
        </v-row>

        <v-row v-else>
          <v-col
            v-for="it in items"
            :key="it.name"
            cols="6" sm="4" md="3" lg="2"
          >
            <v-card class="pa-4 text-center cursor-pointer" elevation="2" hover @contextmenu.prevent="onItemMenu($event, it)">
              <div class="d-flex align-center justify-center mb-2">
                <Icon :name="it.type === 'folder' ? 'mdi:folder' : getFileIcon(it.name)" :size="48" :style="{ color: it.type === 'folder' ? '#f6a03c' : getFileColor(it.name) }" />
              </div>
              <div class="text-truncate" :title="it.name">{{ it.name }}</div>
              <div class="text-medium-emphasis text-caption">原路径：/{{ it.originalPath }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-menu v-model="menu.show" :position-x="menu.x" :position-y="menu.y">
          <v-list density="compact">
            <v-list-item @click="restore">恢复</v-list-item>
            <v-list-item @click="destroy">彻底删除</v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])
const loading = ref(false)
const errorMessage = ref('')
const menu = ref({ show: false, x: 0, y: 0, item: null })

onMounted(() => refresh())

async function refresh() {
  loading.value = true
  try {
    const data = await $fetch('/api/recycle.list')
    items.value = data.items || []
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function onItemMenu(ev, it) {
  menu.value = { show: true, x: ev.clientX, y: ev.clientY, item: it }
}

async function restore() {
  const it = menu.value.item
  if (!it) return
  try {
    await $fetch('/api/recycle.restore', { method: 'POST', body: { name: it.name } })
    await refresh()
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '恢复失败'
  } finally {
    menu.value.show = false
  }
}

async function destroy() {
  const it = menu.value.item
  if (!it) return
  if (!window.confirm(`确定彻底删除“${it.name}”？该操作不可恢复。`)) return
  try {
    await $fetch('/api/recycle.destroy', { method: 'POST', body: { name: it.name } })
    await refresh()
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '删除失败'
  } finally {
    menu.value.show = false
  }
}

const getExt = (name) => {
  const idx = String(name || '').lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ''
}
const getFileIcon = (name) => {
  const ext = getExt(name)
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'mdi:file-image'
  if (ext === 'pdf') return 'mdi:file-pdf-box'
  if (['doc', 'docx'].includes(ext)) return 'mdi:file-word'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'mdi:file-excel'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'mdi:folder-zip'
  return 'mdi:file'
}
const getFileColor = (name) => {
  const ext = getExt(name)
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return '#66bb6a'
  if (ext === 'pdf') return '#e53935'
  if (['doc', 'docx'].includes(ext)) return '#1a73e8'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '#43a047'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '#6d4c41'
  return '#5c6bc0'
}
</script>
<style scoped>
.cursor-pointer { cursor: pointer; }
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>