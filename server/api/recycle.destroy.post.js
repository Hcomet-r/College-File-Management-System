import { defineEventHandler, readBody, createError } from 'h3'
import { destroyFromRecycle } from '../utils/fs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = (body?.name || '').toString()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: '参数不完整' })
  }
  try {
    const data = await destroyFromRecycle(name)
    return { success: true, ...data }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e?.message || '彻底删除失败' })
  }
})
