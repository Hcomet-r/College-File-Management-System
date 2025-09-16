import { defineEventHandler, readBody, createError } from 'h3'
import { copyItem } from '../utils/fs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const src = (body?.src || '').toString().replace(/^\/+/, '')
  const dest = (body?.dest || '').toString().replace(/^\/+/, '')
  if (!src || !dest) {
    throw createError({ statusCode: 400, statusMessage: '参数不完整' })
  }
  try {
    const data = await copyItem(src, dest)
    return { success: true, ...data }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e?.message || '复制失败' })
  }
})
