import { AppError } from '../utils/AppError.js'

export function notFound(req, res, next) {
  next(new AppError(404, `Not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') err = new AppError(400, 'Invalid JSON body')
  if (err.code === 'P2002') err = new AppError(409, 'That value is already in use')
  if (err.code === 'P2025') err = new AppError(404, 'Not found')
  // Prisma foreign key failure, e.g. a categoryId that doesn't exist
  if (err.code === 'P2003') err = new AppError(400, 'A linked record (category, brand, colour…) does not exist')
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'File too large (max 10 MB for images, 100 MB for videos)',
      LIMIT_FILE_COUNT: 'Too many files (max 10 per upload)',
      LIMIT_UNEXPECTED_FILE: 'Upload files in a field named "files"',
    }
    err = new AppError(400, messages[err.code] || err.message)
  }

  const status = err.statusCode || err.status || 500
  if (status >= 500) console.error(err)

  res.status(status).json({
    // Our own AppErrors are safe to show; hide details of unexpected crashes.
    message: status >= 500 && !(err instanceof AppError) ? 'Something went wrong' : err.message,
    ...(err.details && { errors: err.details }),
  })
}
