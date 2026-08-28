import { PrismaClient } from "@prisma/client";
import pg from 'pg';
import {PrismaPg} from "@prisma/adapter-pg"

const pool = new pg.Pool({

    connectionString: process.env.DATABASE_URL,

})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({adapter});