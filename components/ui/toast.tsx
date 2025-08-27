"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg",
        {
          "bg-background border-border": variant === "default",
          "bg-destructive text-destructive-foreground border-destructive": variant === "destructive",
          "bg-green-500 text-white border-green-600": variant === "success",
        }
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <div className="font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Simple toast manager
class ToastManager {
  private toasts: Array<{ id: string; props: ToastProps }> = []
  private listeners: Array<(toasts: Array<{ id: string; props: ToastProps }>) => void> = []

  show(props: ToastProps) {
    const id = Math.random().toString(36).substr(2, 9)
    this.toasts.push({ id, props })
    this.notify()

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.remove(id)
    }, 5000)

    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  subscribe(listener: (toasts: Array<{ id: string; props: ToastProps }>) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }
}

export const toastManager = new ToastManager()

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<Array<{ id: string; props: ToastProps }>>([])

  React.useEffect(() => {
    return toastManager.subscribe(setToasts)
  }, [])

  return (
    <>
      {toasts.map(({ id, props }) => (
        <Toast
          key={id}
          {...props}
          onClose={() => toastManager.remove(id)}
        />
      ))}
    </>
  )
}