import { defineEventHandler, getQuery, createError } from 'h3'
import { promises as fsp } from 'node:fs'
import path from 'node:path'

const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads')

async function walk(dir, baseRel = '') {
  const entries = await fsp.readdir(dir, { withFileTypes: true })
  const results = []
  for (const ent of entries) {
    if (baseRel === '' && ent.name === '.recycle') continue
    const abs = path.join(dir, ent.name)
    const rel = path.posix.join(baseRel, ent.name)
    results.push({ name: ent.name, path: `/${rel}`, type: ent.isDirectory() ? 'folder' : 'file' })
    if (ent.isDirectory()) {
      const sub = await walk(abs, path.posix.join(baseRel, ent.name))
      results.push(...sub)
    }
  }
  return results
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const keyword = (q.q || '').toString().trim().toLowerCase()
  if (!keyword) {
    throw createError({ statusCode: 400, statusMessage: '缺少搜索关键词 q' })
  }
  try {
    const all = await walk(uploadsRoot, '')
    const filtered = all.filter((it) => it.name.toLowerCase().includes(keyword))
    return { success: true, count: filtered.length, items: filtered }
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: e?.message || '搜索失败' })
  }
})
