const requestBuckets = new Map<
  string,
  {
    count: number
    expiresAt: number
  }
>()

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = requestBuckets.get(key)

  if (!bucket || bucket.expiresAt <= now) {
    requestBuckets.set(key, { count: 1, expiresAt: now + windowMs })
    return false
  }

  if (bucket.count >= limit) {
    return true
  }

  bucket.count += 1
  return false
}
