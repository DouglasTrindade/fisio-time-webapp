"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import type {
  Stripe,
  StripeCardElementChangeEvent,
  StripeCardElementOptions,
  StripeElements,
  StripeElementsOptionsClientSecret,
} from "@stripe/stripe-js"

import { getStripe } from "@/lib/stripe-client"
import { cn } from "@/lib/utils"

type StripeContextValue = {
  stripe: Stripe | null
  elements: StripeElements | null
}

const StripeContext = createContext<StripeContextValue>({ stripe: null, elements: null })

const serializeOptions = (options?: StripeElementsOptionsClientSecret) =>
  JSON.stringify(options ?? {})

interface ProviderProps {
  options: StripeElementsOptionsClientSecret
  children: React.ReactNode
}

export const StripeElementsProvider = ({ options, children }: ProviderProps) => {
  const [value, setValue] = useState<StripeContextValue>({ stripe: null, elements: null })
  const optionsKey = useMemo(() => serializeOptions(options), [options])

  useEffect(() => {
    let mounted = true
    let currentElements: StripeElements | null = null

    const setup = async () => {
      try {
        const stripe = await getStripe()
        if (!stripe || !mounted) return
        currentElements = stripe.elements(options)
        setValue({ stripe, elements: currentElements })
      } catch (error) {
        console.error("Erro ao inicializar o Stripe Elements", error)
        setValue({ stripe: null, elements: null })
      }
    }

    setValue({ stripe: null, elements: null })
    void setup()

    return () => {
      mounted = false
    }
  }, [optionsKey])

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>
}

export const useStripe = () => useContext(StripeContext).stripe
export const useElements = () => useContext(StripeContext).elements

interface CardElementProps {
  className?: string
  options?: StripeCardElementOptions
  onChange?: (event: StripeCardElementChangeEvent) => void
}

export const CardElement = ({ className, options, onChange }: CardElementProps) => {
  const elements = useElements()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const optionsKey = useMemo(() => JSON.stringify(options ?? {}), [options])

  useEffect(() => {
    if (!elements || !containerRef.current) return
    const card = elements.create("card", options)
    card.mount(containerRef.current)
    if (onChange) {
      card.on("change", onChange)
    }

    return () => {
      if (onChange) {
        card.off("change", onChange)
      }
      card.destroy()
    }
  }, [elements, optionsKey, onChange])

  return <div ref={containerRef} className={cn("min-h-[48px]", className)} />
}
