'use client'
import Image from "next/image";
import Menu from "./Menu"
import { cn } from "@/lib/utils"

export default function Sidebar() {
    return (
        <aside className={cn("w-full h-screen bg-primary-1 flex flex-col justify-start gap-4 items-center")}>
            <Menu />
            <div className="mb-2">
          <Image
              aria-hidden
              src="/serviceIcon.png"
              alt="Service Icon"
              width={126}
              height={126}
            />
          </div>
        <h1 className="text-2xl font-bold mb-10 px-4">Account-Based CRM</h1>
        </aside>
    )
}