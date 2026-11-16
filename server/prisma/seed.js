import 'dotenv/config'
import { prisma } from '../src/config/db.js'

const categories = ['Hoodies', 'Socks', 'Hats', 'Jerseys', 'Trousers', 'Shirts']

for (const [i, name] of categories.entries()) {
  const slug = name.toLowerCase()
  await prisma.category.upsert({
    where: { slug },
    update: { sortOrder: i },
    create: { name, slug, sortOrder: i },
  })
}

console.log(`Seeded ${categories.length} categories`)
await prisma.$disconnect()
