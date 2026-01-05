"use client"

import { useRouter, useSelectedLayoutSegments } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const BackButton = () => {
  const router = useRouter()
  const segments = useSelectedLayoutSegments()
  const shouldShowBack = segments.length > 1

  if (!shouldShowBack) return null

  return (
    <Button variant="outline" size="sm" onClick={() => router.back()}>
      <ChevronLeft size={18} />
    </Button>
  )
}
