import { defineEventHandler, readBody, createError } from 'h3'
import { deleteToRecycle } from '../utils/fs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const p = (body?.path || '').toString().replace(/^\/+/, '')
  if (!p) {
    throw createError({ statusCode: 400, statusMessage: '参数不完整' })
  }
  try {
    const data = await deleteToRecycle(p)
    return { success: true, ...data }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e?.message || '删除失败' })
  }
})
