<template>
  <v-layout class="rounded rounded-md border">
    <!-- 新建文件夹对话框 -->
    <v-dialog v-model="createDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">新建文件夹</v-card-title>
        <v-card-text>
          <v-text-field v-model="createDialog.name" label="文件夹名称" autofocus required />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn variant="text" @click="createDialog.show = false">取消</v-btn>
          <v-btn color="primary" variant="tonal" @click="doCreateFolder">创建</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 重命名对话框 -->
    <v-dialog v-model="renameDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">重命名</v-card-title>
        <v-card-text>
          <v-text-field v-model="renameDialog.name" label="新名称" autofocus required />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn variant="text" @click="renameDialog.show = false">取消</v-btn>
          <v-btn color="primary" variant="tonal" @click="doRename">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">确认删除</v-card-title>
        <v-card-text>
          <div>确定将“{{ deleteDialog.name }}”移入回收站吗？</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn variant="text" @click="deleteDialog.show = false">取消</v-btn>
          <v-btn color="error" variant="tonal" @click="doDelete">确认删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-main>
      <v-card class="mx-auto">
        <v-container fluid>
          <v-row class="mb-4" align="center" justify="space-between">
            <v-col cols="12" md="8" class="d-flex align-center">
              <v-btn color="primary" :loading="uploading" :disabled="uploading" @click="triggerFilePick">
                选择并上传文件
              </v-btn>
              <input
                ref="fileInputRef"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.7z,.rar,.tar,.gz"
                style="display: none"
                @change="onFilesSelected"
              >
              <span v-if="uploading" class="ml-3">正在上传...</span>
              <v-text-field
                v-model="searchQuery"
                density="comfortable"
                class="ml-4"
                style="max-width: 360px;"
                variant="outlined"
                clearable
                hide-details
                placeholder="全局搜索文件/文件夹"
                prepend-inner-icon="mdi-magnify"
                @update:model-value="onSearchChange"
              />
            </v-col>
            <v-col cols="12" md="4" class="text-right"/>
          </v-row>

          <!-- 全局搜索结果 -->
          <template v-if="globalResults.show">
            <v-row class="mb-2" align="center" justify="space-between">
              <v-col cols="12" md="8">
                <h3>搜索结果（{{ globalResults.items.length }}）</h3>
              </v-col>
              <v-col cols="12" md="4" class="text-right">
                <v-btn variant="text" size="small" @click="clearSearch">清除搜索</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                v-for="it in globalResults.items"
                :key="it.path"
                cols="12" md="6" lg="4"
              >
                <v-card class="pa-3 d-flex align-center" hover>
                  <Icon :name="it.type==='folder'?'mdi:folder':getFileIcon(it.name)" :size="28" :style="{ color: it.type==='folder' ? '#f6a03c' : getFileColor(it.name) }" />
                  <div class="ml-3" style="min-width: 0;">
                    <div class="text-truncate" :title="it.name">{{ it.name }}</div>
                    <div class="text-caption text-medium-emphasis text-truncate" :title="it.path">/{{ it.path.replace(/^\/+/, '') }}</div>
                  </div>
                  <v-spacer />
                  <v-btn size="small" variant="tonal" @click="openSearchItem(it)">打开</v-btn>
                </v-card>
              </v-col>
            </v-row>
            <v-divider class="my-6" />
          </template>

          <!-- 目录工具栏 -->
          <v-row class="mb-2" align="center" justify="space-between">
            <v-col cols="12" md="8" class="d-flex align-center">
              <span class="mr-2">当前位置：</span>
              <code class="mr-4">/uploads{{ currentPathDisplay }}</code>
              <v-btn size="small" variant="tonal" :disabled="!canGoUp" @click="goUp">返回上级</v-btn>
            </v-col>
            <v-col cols="12" md="4" class="text-right">
              <v-btn color="primary" variant="elevated" size="small" @click="createFolder">新建文件夹</v-btn>
                <v-btn class="ml-2" color="info" variant="elevated" size="small" :loading="loadingList" rounded prepend-icon="mdi-refresh" @click="refreshList">
                  刷新
                </v-btn>
            </v-col>
          </v-row>

          <v-row v-if="errorMessage">
            <v-col cols="12">
              <v-alert type="error" variant="tonal">{{ errorMessage }}</v-alert>
            </v-col>
          </v-row>

          <div class="files-grid" @contextmenu.prevent="onBlankContextMenu($event)">
            <v-row class="mb-2">
              <v-col cols="12"><h3>当前目录内容</h3></v-col>
            </v-row>
            <v-row v-if="loadingList">
              <v-col cols="12"><v-progress-linear indeterminate color="primary" /></v-col>
            </v-row>
            <v-row v-else>
              <v-col
                v-for="item in items"
                :key="item.path"
                cols="6"
                sm="4"
                md="3"
                lg="2"
              >
                <v-card
                  class="pa-4 text-center cursor-pointer file-card"
                  elevation="2"
                  hover
                  :class="{ 'droppable-hover': dragHoverPath === item.path && item.type === 'folder' }"
                  :draggable="true"
                  @click="item.type === 'folder' ? enterFolder(item) : openFile(`/uploads${item.path}`)"
                  @contextmenu.stop.prevent="onItemContextMenu($event, item)"
                  @dragstart="onDragStart(item, $event)"
                  @dragover.prevent="item.type === 'folder' ? onDragOver(item) : null"
                  @dragleave.prevent="item.type === 'folder' ? onDragLeave(item) : null"
                  @drop.prevent="item.type === 'folder' ? onDrop(item) : null"
                >
                  <div class="d-flex align-center justify-center mb-2">
                    <Icon :name="item.type === 'folder' ? 'mdi:folder' : getFileIcon(item.name)" :size="48" :style="{ color: item.type === 'folder' ? '#f6a03c' : getFileColor(item.name) }" />
                  </div>
                  <div class="text-truncate" :title="item.name">{{ item.name }}</div>
                  <div v-if="item.type !== 'folder'" class="text-medium-emphasis text-caption">{{ formatSize(item.size) }}</div>
                </v-card>
              </v-col>
            </v-row>
            <div class="blank-spacer" />
          </div>

          <div ref="itemActivator" :style="itemActivatorStyle" style="position: fixed; width: 0; height: 0" />
          <div ref="blankActivator" :style="blankActivatorStyle" style="position: fixed; width: 0; height: 0" />

          <v-menu v-model="itemMenu.show" :close-on-content-click="false" :activator="itemActivator">
            <v-list density="compact">
              <v-list-item @click="menuOpen">打开</v-list-item>
              <v-list-item @click="menuCopy">复制</v-list-item>
              <v-list-item @click="menuCut">剪切</v-list-item>
              <v-list-item @click="menuRename">重命名</v-list-item>
              <v-list-item @click="menuDelete">删除</v-list-item>
            </v-list>
          </v-menu>

          <v-menu v-model="blankMenu.show" :close-on-content-click="true" :activator="blankActivator">
            <v-list density="compact">
              <v-list-item @click="menuPaste">粘贴</v-list-item>
            </v-list>
          </v-menu>

        </v-container>
      </v-card>
    </v-main>
  </v-layout>
</template>

<script setup>
const createDialog = ref({ show: false, name: '' })
const renameDialog = ref({ show: false, name: '', item: null })
const deleteDialog = ref({ show: false, name: '', item: null })


const fileInputRef = ref(null)
const uploading = ref(false)
const errorMessage = ref('')

const currentPath = ref('')
const items = ref([])
const loadingList = ref(false)

const searchQuery = ref('')
const globalResults = ref({ show: false, items: [] })

const draggedItem = ref(null)
const dragHoverPath = ref('')

const itemMenu = ref({ show: false, x: 0, y: 0, item: null })
const blankMenu = ref({ show: false, x: 0, y: 0 })

const clipboard = ref({ item: null, mode: null })

const canGoUp = computed(() => currentPath.value.length > 0)
const currentPathDisplay = computed(() => `/${currentPath.value}`.replace(/\/\/+/, '/'))

const itemActivator = ref(null)
const blankActivator = ref(null)
const itemActivatorStyle = ref({ left: '0px', top: '0px' })
const blankActivatorStyle = ref({ left: '0px', top: '0px' })

onMounted(() => {
  refreshList()
})

async function onSearchChange() {
  const q = searchQuery.value.trim()
  if (!q) {
    globalResults.value = { show: false, items: [] }
    return
  }
  try {
    const res = await $fetch('/api/search', { params: { q } })
    globalResults.value = { show: true, items: res.items || [] }
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '搜索失败'
  }
}

function clearSearch() {
  searchQuery.value = ''
  globalResults.value = { show: false, items: [] }
}

function openSearchItem(it) {
  if (it.type === 'folder') {
    currentPath.value = it.path.replace(/^\/+/, '')
    refreshList()
  } else {
    openFile(`/uploads${it.path}`)
  }
}

async function refreshList() {
  loadingList.value = true
  try {
    const data = await $fetch('/api/fs.list', { params: { path: currentPath.value } })
    items.value = data.items || []
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '加载目录失败'
  } finally {
    loadingList.value = false
  }
}

function enterFolder(item) {
  const next = `${currentPath.value ? currentPath.value + '/' : ''}${item.name}`
  currentPath.value = next
  refreshList()
}

function goUp() {
  if (!currentPath.value) return
  const segs = currentPath.value.split('/')
  segs.pop()
  currentPath.value = segs.join('/')
  if (!currentPath.value) currentPath.value = ''
  refreshList()
}

async function createFolder() {
  createDialog.value = { show: true, name: '' }
}

async function doCreateFolder() {
  const name = createDialog.value.name.trim()
  if (!name) return
  createDialog.value.show = false
  try {
    await $fetch('/api/fs.mkdir', { method: 'POST', body: { path: currentPath.value, name } })
    await refreshList()
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '创建文件夹失败'
  }
}

function onItemContextMenu(ev, item) {
  itemActivatorStyle.value = { left: ev.clientX + 'px', top: ev.clientY + 'px' }
  itemMenu.value = { show: true, x: ev.clientX, y: ev.clientY, item }
  blankMenu.value.show = false
}

function onBlankContextMenu(ev) {
  if (!clipboard.value?.item || !clipboard.value?.mode) return
  if ((ev?.target)?.closest?.('.file-card')) return
  blankActivatorStyle.value = { left: ev.clientX + 'px', top: ev.clientY + 'px' }
  itemMenu.value.show = false
  blankMenu.value = { show: true, x: ev.clientX, y: ev.clientY }
}

function menuOpen() {
  const it = itemMenu.value.item
  if (!it) return
  if (it.type === 'folder') enterFolder(it)
  else openFile(`/uploads${it.path}`)
  itemMenu.value.show = false
}

function menuCopy() {
  clipboard.value = { item: itemMenu.value.item, mode: 'copy' }
  itemMenu.value.show = false
}

function menuCut() {
  clipboard.value = { item: itemMenu.value.item, mode: 'cut' }
  itemMenu.value.show = false
}

async function menuRename() {
  const it = itemMenu.value.item
  if (!it) return
  renameDialog.value = { show: true, name: it.name, item: it }
}

async function doRename() {
  const it = renameDialog.value.item
  const newName = renameDialog.value.name.trim()
  if (!it || !newName || newName === it.name) return
  renameDialog.value.show = false
  try {
    const rel = String(it.path).replace(/^\/+/, '')
    await $fetch('/api/fs.rename', { method: 'POST', body: { path: rel, name: newName } })
    await refreshList()
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '重命名失败'
  } finally {
    itemMenu.value.show = false
  }
}

async function menuDelete() {
  const it = itemMenu.value.item
  if (!it) return
  deleteDialog.value = { show: true, name: it.name, item: it }
}

async function doDelete() {
  const it = deleteDialog.value.item
  if (!it) return
  deleteDialog.value.show = false
  try {
    const rel = String(it.path).replace(/^\/+/, '')
    await $fetch('/api/fs.delete', { method: 'POST', body: { path: rel } })
    await refreshList()
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '删除失败'
  } finally {
    itemMenu.value.show = false
  }
}

async function menuPaste() {
  const clip = clipboard.value
  if (!clip?.item || !clip.mode) return
  try {
    const srcRel = String(clip.item.path).replace(/^\/+/, '')
    const destRel = String(currentPath.value || '').replace(/^\/+/, '')
    if (clip.mode === 'copy') {
      await $fetch('/api/fs.copy', { method: 'POST', body: { src: srcRel, dest: destRel } })
    } else if (clip.mode === 'cut') {
      await $fetch('/api/fs.move', { method: 'POST', body: { src: srcRel, dest: destRel } })
    }
    clipboard.value = { item: null, mode: null }
    await refreshList()
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '粘贴失败'
  } finally {
    blankMenu.value.show = false
  }
}

function onDragStart(item, ev) {
  draggedItem.value = item
  ev.dataTransfer.effectAllowed = 'move'
}

function onDragOver(folder) {
  dragHoverPath.value = folder.path
}

function onDragLeave(folder) {
  if (dragHoverPath.value === folder.path) dragHoverPath.value = ''
}

async function onDrop(folder) {
  const source = draggedItem.value
  dragHoverPath.value = ''
  draggedItem.value = null
  if (!source) return
  if (folder.type !== 'folder') return
  const srcRel = String(source.path).replace(/^\/+/, '')
  const destRel = String(folder.path).replace(/^\/+/, '')
  if (source.type === 'folder') {
    if (destRel === srcRel || destRel.startsWith(srcRel + '/')) {
      errorMessage.value = '不能将文件夹移动到其自身或子目录下'
      return
    }
  }
  try {
    await $fetch('/api/fs.move', { method: 'POST', body: { src: srcRel, dest: destRel } })
    await refreshList()
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || e?.message || '移动失败'
  }
}

const triggerFilePick = () => {
  errorMessage.value = ''
  fileInputRef.value && fileInputRef.value.click()
}

const onFilesSelected = async (e) => {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  const form = new FormData()
  form.append('path', currentPath.value)
  files.forEach((f) => form.append('file', f))

  uploading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/upload', {
      method: 'POST',
      body: form,
    })
    await refreshList()
  } catch (err) {
    errorMessage.value = err?.data?.statusMessage || err?.message || '上传失败'
  } finally {
    uploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
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

const openFile = (path) => {
  if (!path) return
  window.open(path, '_blank', 'noopener')
}

const formatSize = (size) => {
  if (size == null) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let s = Number(size)
  let i = 0
  while (s >= 1024 && i < units.length - 1) {
    s /= 1024
    i++
  }
  return `${s.toFixed(2)} ${units[i]}`
}

</script>
<style scoped>
.cursor-pointer { cursor: pointer; }
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.droppable-hover {
  outline: 2px dashed #1976d2;
}
.files-grid {
  min-height: 60vh;
}
.blank-spacer {
  height: 40vh;
}
</style>