import { prisma } from '../config/db.js'
import { AppError } from '../utils/AppError.js'
import { COOKIE_NAME, verifyToken } from '../utils/token.js'

const userSelect = { id: true, email: true, name: true, phone: true, role: true, createdAt: true }

async function userFromRequest(req) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return null
  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return null // expired or tampered token
  }
  // Look the user up each time so a deleted or demoted user loses access immediately.
  return prisma.user.findUnique({ where: { id: payload.sub }, select: userSelect })
}

// Requires a logged-in user. Sets req.user.
export async function requireAuth(req, res, next) {
  const user = await userFromRequest(req)
  if (!user) throw new AppError(401, 'Please log in to continue')
  req.user = user
  next()
}

// Requires a logged-in ADMIN. Works on its own or after requireAuth.
export async function requireAdmin(req, res, next) {
  if (!req.user) req.user = await userFromRequest(req)
  if (!req.user) throw new AppError(401, 'Please log in to continue')
  if (req.user.role !== 'ADMIN') throw new AppError(403, 'Admin access only')
  next()
}

// Sets req.user if logged in, but lets guests through (e.g. guest checkout).
export async function optionalAuth(req, res, next) {
  req.user = await userFromRequest(req)
  next()
}
