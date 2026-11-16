import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { register, login, logout, me } from '../controllers/auth.controller.js'
import { optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// 10 attempts per 15 minutes per IP on login/register, to slow down password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
})

const emailRule = () =>
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail({ gmail_remove_dots: false })

router.post(
  '/register',
  authLimiter,
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  emailRule(),
  body('password')
    .isString()
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8–72 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
  validate,
  register,
)

router.post(
  '/login',
  authLimiter,
  emailRule(),
  body('password').isString().notEmpty().withMessage('Enter your password'),
  validate,
  login,
)

router.post('/logout', logout)
// Guests get { user: null } (not a 401) so the storefront can check login state quietly.
router.get('/me', optionalAuth, me)

export default router
