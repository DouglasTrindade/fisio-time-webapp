import "dotenv/config";

import { defineConfig } from "@prisma/config";

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Configure DATABASE_URL ou DIRECT_URL para executar os comandos do Prisma.");
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
