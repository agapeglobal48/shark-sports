import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.ts'

// App queries go through Supabase's transaction pooler (DATABASE_URL, port 6543).
// The database is in Sydney, so opening a new encrypted connection costs several
// round trips (~1–2 s). Keep connections open and reuse them instead.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 5 * 60_000, // default is 10 s, which forced constant reconnects
  keepAlive: true,
})

// Reuse one client across nodemon reloads in development.
const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
