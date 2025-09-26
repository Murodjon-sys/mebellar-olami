"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext({})

const Tabs = React.forwardRef(({ value, onValueChange, children, className, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || "")
  
  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])
  
  const changeTab = React.useCallback((newValue) => {
    setActiveTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }, [onValueChange])
  
  return (
    <TabsContext.Provider value={{ activeTab, changeTab }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-700 p-1 text-gray-400",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab, changeTab } = React.useContext(TabsContext)
  const isActive = activeTab === value
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => changeTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-gray-600 text-white shadow-sm" 
          : "text-gray-400 hover:text-white hover:bg-gray-600/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab } = React.useContext(TabsContext)
  
  if (activeTab !== value) {
    return null
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
