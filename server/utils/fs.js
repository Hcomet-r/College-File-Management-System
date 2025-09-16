import { promises as fsp } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads')
const recycleRoot = path.join(uploadsRoot, '.recycle')

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true })
}

function sanitizeFilename(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')
}

function buildUniqueName(originalName) {
  const ext = path.extname(originalName)
  const base = path.basename(originalName, ext)
  const rand = crypto.randomBytes(6).toString('hex')
  const unique = `${base}-${Date.now()}-${rand}${ext}`
  return unique.slice(0, 200)
}

function getUploadsRoot() {
  return uploadsRoot
}

function resolveSafe(relativePath = '') {
  let rel = String(relativePath || '')
    .replace(/\\/g, '/')
    .replace(/^\/?uploads\/?/i, '')
    .replace(/^\/+/, '')
  const normalized = path.normalize(rel)
  const abs = path.resolve(uploadsRoot, normalized)
  const relToRoot = path.relative(uploadsRoot, abs)
  if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) {
    throw new Error('非法路径')
  }
  return abs
}

export async function saveFileToUploads(buffer, originalName, relativeDir = '') {
  const safeName = sanitizeFilename(originalName)
  const targetDir = resolveSafe(relativeDir)
  await ensureDir(targetDir)

  const filename = buildUniqueName(safeName)
  const absPath = path.join(targetDir, filename)

  await fsp.writeFile(absPath, buffer)

  const publicRel = String(relativeDir || '').replace(/\\/g, '/').replace(/^\/+/, '')
  const publicPath = publicRel ? `/uploads/${publicRel}/${filename}`.replace(/\/\//g, '/') : `/uploads/${filename}`
  return { filename, path: publicPath, size: buffer.length }
}

export async function listDirectory(relativePath = '') {
  const abs = resolveSafe(relativePath)
  await ensureDir(abs)
  const entries = await fsp.readdir(abs, { withFileTypes: true })
  const items = await Promise.all(entries
    .filter((ent) => !(relativePath === '' && ent.name === '.recycle'))
    .map(async (ent) => {
      const full = path.join(abs, ent.name)
      const stat = await fsp.stat(full)
      return {
        name: ent.name,
        path: path.join('/', String(relativePath || ''), ent.name).replace(/\\/g, '/').replace(/\/\//g, '/'),
        type: ent.isDirectory() ? 'folder' : 'file',
        size: ent.isDirectory() ? 0 : stat.size,
        mtime: stat.mtimeMs,
      }
    }))
  return { path: `/${String(relativePath || '')}`.replace(/\\/g, '/').replace(/\/\//g, '/'), items }
}

export async function makeDirectory(relativePath = '', name) {
  const safeName = sanitizeFilename(name)
  if (!safeName) throw new Error('文件夹名无效')
  const parent = resolveSafe(relativePath)
  const target = path.join(parent, safeName)
  await ensureDir(target)
  return { ok: true }
}

export async function renameItem(relativePath, newName) {
  const safeNew = sanitizeFilename(newName)
  const srcAbs = resolveSafe(relativePath)
  const parentRel = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '')
  const parentPosix = parentRel.includes('/') ? parentRel.slice(0, parentRel.lastIndexOf('/')) : ''
  const destAbs = resolveSafe((parentPosix ? parentPosix + '/' : '') + safeNew)
  await fsp.rename(srcAbs, destAbs)
  return { ok: true }
}

export async function moveItem(srcRelative, destDirRelative) {
  const srcAbs = resolveSafe(srcRelative)
  const destDirAbs = resolveSafe(destDirRelative)
  await ensureDir(destDirAbs)
  const filename = path.basename(srcAbs)
  const destAbs = path.join(destDirAbs, filename)
  await fsp.rename(srcAbs, destAbs)
  return { ok: true }
}

async function copyRecursively(src, dest) {
  const stat = await fsp.stat(src)
  if (stat.isDirectory()) {
    await ensureDir(dest)
    const entries = await fsp.readdir(src, { withFileTypes: true })
    for (const ent of entries) {
      const s = path.join(src, ent.name)
      const d = path.join(dest, ent.name)
      if (ent.isDirectory()) await copyRecursively(s, d)
      else await fsp.copyFile(s, d)
    }
  } else {
    await ensureDir(path.dirname(dest))
    await fsp.copyFile(src, dest)
  }
}

async function removeRecursively(targetPath) {
  await fsp.rm(targetPath, { recursive: true, force: true })
}

export async function copyItem(srcRelative, destDirRelative) {
  const srcAbs = resolveSafe(srcRelative)
  const destDirAbs = resolveSafe(destDirRelative)
  await ensureDir(destDirAbs)
  const filename = path.basename(srcAbs)
  const destAbs = path.join(destDirAbs, filename)
  await copyRecursively(srcAbs, destAbs)
  return { ok: true }
}

export async function deleteToRecycle(relativePath) {
  const srcAbs = resolveSafe(relativePath)
  await ensureDir(recycleRoot)
  const base = path.basename(srcAbs)
  const ext = path.extname(base)
  const stem = path.basename(base, ext)
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const recycleName = ext ? `${stem}__${ts}${ext}` : `${stem}__${ts}`
  const destAbs = path.join(recycleRoot, recycleName)
  const meta = { originalPath: String(relativePath).replace(/^\/+/, '') || '', deletedAt: new Date().toISOString() }
  await fsp.writeFile(destAbs + '.meta.json', JSON.stringify(meta, null, 2), 'utf-8')
  try {
    await fsp.rename(srcAbs, destAbs)
  } catch (e) {
    if (['EXDEV', 'EPERM', 'EACCES'].includes(e?.code)) {
      await copyRecursively(srcAbs, destAbs)
      await removeRecursively(srcAbs)
    } else {
      await fsp.rm(destAbs + '.meta.json', { force: true })
      throw e
    }
  }
  return { ok: true }
}

export async function listRecycle() {
  await ensureDir(recycleRoot)
  const entries = await fsp.readdir(recycleRoot, { withFileTypes: true })
  const items = []
  for (const ent of entries) {
    if (ent.name.endsWith('.meta.json')) continue
    const full = path.join(recycleRoot, ent.name)
    const stat = await fsp.stat(full)
    let originalPath = ''
    try {
      const metaRaw = await fsp.readFile(full + '.meta.json', 'utf-8')
      const meta = JSON.parse(metaRaw)
      originalPath = meta.originalPath || ''
    } catch {}
    items.push({ name: ent.name, type: (ent.isDirectory() ? 'folder' : 'file'), size: ent.isDirectory() ? 0 : stat.size, mtime: stat.mtimeMs, originalPath })
  }
  return { items }
}

export async function restoreFromRecycle(name) {
  const src = path.join(recycleRoot, name)
  const metaPath = src + '.meta.json'
  let originalPath = ''
  try {
    const meta = JSON.parse(await fsp.readFile(metaPath, 'utf-8'))
    originalPath = meta.originalPath || ''
  } catch {}
  const destAbs = resolveSafe(originalPath)
  await ensureDir(path.dirname(destAbs))
  try {
    await fsp.rename(src, destAbs)
  } catch (e) {
    if (['EXDEV', 'EPERM', 'EACCES'].includes(e?.code)) {
      await copyRecursively(src, destAbs)
      await removeRecursively(src)
    } else {
      throw e
    }
  }
  await fsp.rm(metaPath, { force: true })
  return { ok: true }
}

export async function destroyFromRecycle(name) {
  const target = path.join(recycleRoot, name)
  await removeRecursively(target)
  await fsp.rm(target + '.meta.json', { force: true })
  return { ok: true }
}

export const fsUtils = {
  getUploadsRoot,
  resolveSafe,
  listDirectory,
  makeDirectory,
  renameItem,
  moveItem,
  copyItem,
  deleteToRecycle,
  listRecycle,
  restoreFromRecycle,
  destroyFromRecycle,
}
