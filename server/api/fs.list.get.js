import { defineEventHandler, getQuery, createError } from 'h3'
import { listDirectory } from '../utils/fs'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const p = (q.path || '').toString().replace(/^\/+/, '')
  try {
    const data = await listDirectory(p)
    return { success: true, ...data }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e?.message || '无法列出目录' })
  }
})
