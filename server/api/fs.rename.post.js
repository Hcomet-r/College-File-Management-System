import { defineEventHandler, readBody, createError } from 'h3'
import { renameItem } from '../utils/fs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const target = (body?.path || '').toString().replace(/^\/+/, '')
  const newName = (body?.name || '').toString()
  if (!target || !newName) {
    throw createError({ statusCode: 400, statusMessage: '参数不完整' })
  }
  try {
    const data = await renameItem(target, newName)
    return { success: true, ...data }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e?.message || '重命名失败' })
  }
})
