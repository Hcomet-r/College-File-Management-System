import { defineEventHandler, readBody, createError } from 'h3'
import { makeDirectory } from '../utils/fs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parent = (body?.path || '').toString().replace(/^\/+/, '')
  const name = (body?.name || '').toString()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: '名称必填' })
  }
  try {
    const data = await makeDirectory(parent, name)
    return { success: true, ...data }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e?.message || '创建失败' })
  }
})
