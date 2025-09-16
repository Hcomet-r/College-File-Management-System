import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { saveFileToUploads } from '../utils/fs'

// 后端上传接口：支持多文件，限制常见类型与大小
export default defineEventHandler(async (event) => {
  const contentType = event.node.req.headers['content-type'] || ''
  if (!contentType.includes('multipart/form-data')) {
    throw createError({ statusCode: 400, statusMessage: 'Content-Type 必须为 multipart/form-data' })
  }

  // 允许的 MIME 类型（常见办公与压缩、图片）
  const allowedMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/gzip',
    'application/x-tar',
  ])

  // 单文件最大 50MB，总大小最大 200MB
  const maxFileSizeBytes = 50 * 1024 * 1024
  const maxTotalSizeBytes = 200 * 1024 * 1024

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '未接收到任何表单数据' })
  }

  // 解析可选 path 字段（文本字段）
  let targetPath = ''
  for (const p of parts) {
    if (!p.filename && !p.type && p.name === 'path') {
      targetPath = String(p.data?.toString?.() || '')
    }
  }

  const fileParts = parts.filter((p) => p.type && p.filename)
  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '未选择文件或字段名不正确' })
  }

  let totalBytes = 0
  const savedFiles = []

  for (const part of fileParts) {
    const mimeType = part.type || 'application/octet-stream'
    const originalName = part.filename || 'unnamed'
    const fileBuffer = part.data

    if (!allowedMimeTypes.has(mimeType)) {
      throw createError({ statusCode: 415, statusMessage: `不支持的文件类型: ${mimeType}` })
    }

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw createError({ statusCode: 400, statusMessage: '文件数据无效' })
    }

    if (fileBuffer.length > maxFileSizeBytes) {
      throw createError({ statusCode: 413, statusMessage: `单文件超过大小限制 50MB: ${originalName}` })
    }

    totalBytes += fileBuffer.length
    if (totalBytes > maxTotalSizeBytes) {
      throw createError({ statusCode: 413, statusMessage: '总上传大小超过 200MB 限制' })
    }

    // 保存文件到 public/uploads/YYYY/MM/DD
    const saved = await saveFileToUploads(fileBuffer, originalName, targetPath)
    savedFiles.push(saved)
  }

  return {
    success: true,
    count: savedFiles.length,
    files: savedFiles,
  }
})
