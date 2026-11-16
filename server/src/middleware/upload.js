import multer from 'multer'
import { AppError } from '../utils/AppError.js'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB (Cloudinary free plan limit)
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB (Cloudinary free plan limit)
export const MAX_FILES = 10

// Files are kept in memory, then streamed to Cloudinary. Field name: "files".
export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES, files: MAX_FILES },
  fileFilter(req, file, cb) {
    if (IMAGE_TYPES.includes(file.mimetype) || VIDEO_TYPES.includes(file.mimetype)) return cb(null, true)
    cb(new AppError(400, `Unsupported file type: ${file.originalname}. Use JPG, PNG, WebP, AVIF, GIF, MP4, WebM or MOV.`))
  },
}).array('files', MAX_FILES)
