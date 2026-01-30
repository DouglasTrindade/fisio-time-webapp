"use client"

export const ErrorState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
    {message}
  </div>
)
