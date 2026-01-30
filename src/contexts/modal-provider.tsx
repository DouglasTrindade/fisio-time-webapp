"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"

import { Dialog } from "@/components/ui/dialog"

export type ModalComponentProps = {
  closeModal: () => void
}

export type ModalOptions<Props extends object = object> = {
  component: ComponentType<Props & ModalComponentProps>
  preventReplace?: boolean
  onClose?: () => void
}

type ModalContextValue = {
  modalIsOpen: boolean
  openModal: <Props extends object = object>(options: ModalOptions<Props>, componentProps?: Props) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ModalOptions | null>(null)
  const [componentProps, setComponentProps] = useState<object | null>(null)
  const pendingOnClose = useRef<(() => void) | null>(null)

  const closeModal = useCallback(() => {
    setOptions((current) => {
      if (current?.onClose) {
        pendingOnClose.current = current.onClose
      }
      return null
    })
  }, [])

  const openModal = useCallback(<Props extends object = object>(nextOptions: ModalOptions<Props>, nextProps?: Props) => {
    setOptions((current) => {
      if (current && current.preventReplace) {
        return current
      }
      setComponentProps(nextProps ?? null)
      return nextOptions as ModalOptions
    })
  }, [])

  const isOpen = useMemo(() => Boolean(options), [options])

  useEffect(() => {
    if (!options && pendingOnClose.current) {
      const cb = pendingOnClose.current
      pendingOnClose.current = null
      cb()
    }
  }, [options])

  return (
    <ModalContext.Provider value={{ modalIsOpen: isOpen, openModal, closeModal }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(state) => (!state ? closeModal() : undefined)}>
        {options?.component ? (
          <options.component
            {...((componentProps ?? {}) as object)}
            closeModal={closeModal}
          />
        ) : null}
      </Dialog>
    </ModalContext.Provider>
  )
}

export const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModalContext deve ser utilizado dentro de ModalProvider")
  }
  return context
}
