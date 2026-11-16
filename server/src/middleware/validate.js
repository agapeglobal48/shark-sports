import { validationResult } from 'express-validator'
import { AppError } from '../utils/AppError.js'

// Runs after express-validator rules; responds 400 with one message per field.
export function validate(req, res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) return next()
  const errors = {}
  for (const e of result.array()) if (!errors[e.path]) errors[e.path] = e.msg
  throw new AppError(400, 'Please check the highlighted fields', errors)
}
