type Nullable<T> = T | null | undefined

/**
 * Prisma driver adapters ignoram `@map` em enums e exigem valores em maiúsculas.
 * Este helper garante que sempre enviamos o formato aceito, preservando o tipo original.
 */
export const toPrismaEnumValue = <T extends string>(value: T): T => {
  return value.toUpperCase() as unknown as T
}

export const toNullablePrismaEnumValue = <T extends string>(value: Nullable<T>): T | null => {
  if (value === null || value === undefined) return null
  return toPrismaEnumValue(value)
}

export const fromPrismaEnumValue = <T extends string>(
  value: Nullable<T>,
): Lowercase<T> | null => {
  if (value === null || value === undefined) return null
  return value.toString().toLowerCase() as Lowercase<T>
}
