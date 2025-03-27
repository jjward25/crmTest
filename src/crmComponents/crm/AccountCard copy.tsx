"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"



export function AccountCard({ }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn("bg-primary-5 rounded-lg overflow-hidden shadow-lg","transition-all duration-300 ease-in-out hover:shadow-2xl",)}>
      <div
        className={cn("flex justify-between items-center cursor-pointer p-4",isExpanded && "border-b border-primary-3",)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className={cn("text-xl font-semibold")}>Header</h2>
      
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isExpanded && (
        <div className={cn("p-4 bg-primary-5")}>
          Expanded
        </div>
      )}
          </div>
        )
      }

