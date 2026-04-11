import fs from 'fs'
import { promises as fsPromises } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { User } from '../models/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const docsDir = path.resolve(__dirname, '../../../docs')
const guideFileName = '邮箱注册.md'
const guideFilePath = path.join(docsDir, guideFileName)

const imageContentTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
}

const getEmailRegisterGuide = async (ctx) => {
  try {
    const [markdown, registeredCount] = await Promise.all([
      fsPromises.readFile(guideFilePath, 'utf8'),
      User.count()
    ])
    ctx.body = {
      success: true,
      data: {
        title: '学校邮箱开通与登录教程',
        markdown,
        registered_count: registeredCount
      }
    }
  } catch (error) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'GUIDE_NOT_FOUND',
        message: '邮箱注册指引文档不存在'
      }
    }
  }
}

const getEmailRegisterGuideAsset = async (ctx) => {
  const rawFilename = decodeURIComponent(ctx.params.filename || '')
  const safeFilename = path.basename(rawFilename)
  const extension = path.extname(safeFilename).toLowerCase()
  const contentType = imageContentTypes[extension]

  if (!contentType) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_ASSET',
        message: '不支持的图片类型'
      }
    }
    return
  }

  const assetPath = path.join(docsDir, safeFilename)

  try {
    await fsPromises.access(assetPath)
    ctx.type = contentType
    ctx.body = fs.createReadStream(assetPath)
  } catch (error) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'ASSET_NOT_FOUND',
        message: '指引图片不存在'
      }
    }
  }
}

export {
  getEmailRegisterGuide,
  getEmailRegisterGuideAsset
}
