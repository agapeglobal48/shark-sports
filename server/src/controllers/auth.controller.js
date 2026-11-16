import bcrypt from 'bcryptjs'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/AppError.js'
import { setAuthCookie, clearAuthCookie, publicUser } from '../utils/token.js'

const SALT_ROUNDS = 12
// Compared against when the email doesn't exist, so login takes the same time
// either way and attackers can't tell which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS)

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new AppError(409, 'An account with this email already exists')

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, SALT_ROUNDS) },
  })

  setAuthCookie(res, user)
  res.status(201).json({ user: publicUser(user) })
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !ok) throw new AppError(401, 'Incorrect email or password')

  setAuthCookie(res, user)
  res.json({ user: publicUser(user) })
}

// POST /api/auth/logout
export function logout(req, res) {
  clearAuthCookie(res)
  res.json({ message: 'Logged out' })
}

// GET /api/auth/me — the logged-in user, or null for guests
export function me(req, res) {
  res.json({ user: req.user ?? null })
}
