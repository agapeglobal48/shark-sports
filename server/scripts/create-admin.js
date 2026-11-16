// Create an admin, or promote an existing user to admin.
// Usage: npm run create-admin -- <email> <password> "<name>"   (new admin)
//        npm run create-admin -- <email>                       (promote existing user)
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/config/db.js'

const [emailArg, password, name = 'Admin'] = process.argv.slice(2)
if (!emailArg) {
  console.error('Usage: npm run create-admin -- <email> [password] ["name"]')
  process.exit(1)
}
const email = emailArg.trim().toLowerCase()

const existing = await prisma.user.findUnique({ where: { email } })
if (existing) {
  await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })
  console.log(`${email} is now an admin`)
} else {
  if (!password || password.length < 8) {
    console.error('A new admin needs a password of at least 8 characters')
    process.exit(1)
  }
  await prisma.user.create({
    data: { email, name, role: 'ADMIN', passwordHash: await bcrypt.hash(password, 12) },
  })
  console.log(`Created admin ${email}`)
}
await prisma.$disconnect()
