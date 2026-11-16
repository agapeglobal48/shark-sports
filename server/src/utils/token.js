import jwt from 'jsonwebtoken'

export const COOKIE_NAME = 'token'
const EXPIRES_IN_DAYS = 7

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in .env')

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: `${EXPIRES_IN_DAYS}d`,
  })
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

// Vercel forwards /api to Railway, so the browser sees one site and the cookie is
// first-party (SameSite=Lax). Only set COOKIE_SAMESITE=none if the frontend ever
// calls the API on a different domain directly.
function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    path: '/',
  }
}

export function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, signToken(user), {
    ...cookieOptions(),
    maxAge: EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions())
}

// Never send passwordHash to the client.
export function publicUser(user) {
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...rest } = user
  return rest
}
