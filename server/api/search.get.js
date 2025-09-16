import { defineEventHandler, getQuery, createError } from 'h3'
import { promises as fsp } from 'node:fs'
import path from 'node:path'

const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads')

async function safeReaddir(dir) {
  try {
    return await fsp.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const keyword = (q.q || '').toString().trim().toLowerCase()
  const limit = Math.max(1, Math.min(1000, Number(q.limit || 300)))
  if (!keyword) {
    throw createError({ statusCode: 400, statusMessage: '缺少搜索关键词 q' })
  }

  try {
    const results = []
    // 迭代遍历，边走边过滤，命中达到上限后立即停止
    const stack = [{ abs: uploadsRoot, rel: '' }]

    while (stack.length && results.length < limit) {
      const { abs, rel } = stack.pop()
      const entries = await safeReaddir(abs)
      for (const ent of entries) {
        if (!rel && ent.name === '.recycle') continue
        const childAbs = path.join(abs, ent.name)
        const childRel = rel ? path.posix.join(rel, ent.name) : ent.name
        const isDir = ent.isDirectory()
        if (ent.name.toLowerCase().includes(keyword)) {
          results.push({ name: ent.name, path: `/${childRel}`, type: isDir ? 'folder' : 'file' })
          if (results.length >= limit) break
        }
        if (isDir) stack.push({ abs: childAbs, rel: childRel })
      }
    }

    return { success: true, count: results.length, items: results, truncated: results.length >= limit }
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: e?.message || '搜索失败' })
  }
})
