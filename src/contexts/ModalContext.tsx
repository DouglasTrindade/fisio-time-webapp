"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Dialog } from "@/components/ui/dialog"
import { RecordType } from "@/types/record"

type ModalOptions<TRecord extends RecordType = RecordType> = {
  modal: React.ComponentType<any>
  dontReplaceIfOpen?: boolean
  onHide?: () => void
  onSave?: (record: TRecord) => void
}

type ModalContextType<
  TRecord extends RecordType = RecordType,
  TCtxProps extends object = object
> = {
  modalIsOpen: boolean
  openModal: (options: ModalOptions<TRecord>, contextProps?: object) => void
  closeModal: () => void
} & TCtxProps

type ModalProviderProps = {
  children: ReactNode
}

const ModalContext = createContext<ModalContextType<any, any> | undefined>(
  undefined
)

export function useModalContext<
  TRecord extends RecordType = RecordType,
  TCtxProps extends object = object
>() {
  const context = useContext(
    ModalContext as React.Context<
      ModalContextType<TRecord, TCtxProps> | undefined
    >
  )
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider")
  }
  return context
}

export const ModalProvider = <
  TRecord extends RecordType = RecordType,
  TCtxProps extends object = object
>({
  children
}: ModalProviderProps) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ModalOptions<TRecord> | null>(null)
  const [contextProps, setContextProps] = useState<TCtxProps>({} as TCtxProps)

  const openModal = (
    modalOptions: ModalOptions<TRecord>,
    ctxProps: TCtxProps = {} as TCtxProps
  ) => {
    if (modalOptions?.dontReplaceIfOpen && open) return

    setOptions(modalOptions)
    setContextProps(ctxProps)
    setOpen(true)
  }

  const closeModal = () => {
    options?.onHide?.()
    setOpen(false)
    setOptions(null)
    setContextProps({} as TCtxProps)
  }

  return (
    <ModalContext.Provider
      value={{
        ...contextProps,
        modalIsOpen: open,
        openModal,
        closeModal
      }}
    >
      {children}
      <Dialog
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) closeModal()
        }}
      >
        {options?.modal && (
          <options.modal
            {...contextProps}
            onHide={() => closeModal()}
            onSave={(record: TRecord, opts?: { dontClose?: boolean }) => {
              if (!opts?.dontClose) closeModal()
              options.onSave?.(record)
            }}
          />
        )}
      </Dialog>
    </ModalContext.Provider>
  )
}
