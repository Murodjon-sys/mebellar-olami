"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false)
  
  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked)
    }
  }, [checked])
  
  const handleToggle = () => {
    if (disabled) return
    
    const newChecked = !isChecked
    setIsChecked(newChecked)
    
    if (onCheckedChange) {
      onCheckedChange(newChecked)
    }
  }
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked 
          ? "bg-green-600" 
          : "bg-gray-600",
        className
      )}
      ref={ref}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          isChecked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }
