import { PrismaClient } from '@prisma/client'

// Docs about instantiating `PrismaClient` with Next.js:
// https://pris.ly/d/help/next-js-best-practices

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        log: ['warn', 'error'],
    })
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        })
    }
    prisma = global.prisma
}

export default prisma
