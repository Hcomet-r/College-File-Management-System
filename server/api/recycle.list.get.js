import { defineEventHandler } from 'h3'
import { listRecycle } from '../utils/fs'

export default defineEventHandler(async () => {
  const data = await listRecycle()
  return { success: true, ...data }
})
