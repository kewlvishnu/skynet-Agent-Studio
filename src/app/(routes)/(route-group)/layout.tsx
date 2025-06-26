import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full overflow-y-auto">
      {children}
    </div>
  )
}
