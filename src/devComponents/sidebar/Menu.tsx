'use client'

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from 'next/navigation'

export default function Menu() {
    const pathname = usePathname()

    return (
        <nav className={cn(
            "flex justify-between items-center md:px-20 md:py-3 md:pt-6 sticky top-0 z-50"
        )}>
            <div className={cn(
                "cursor-pointer relative rounded-bl-md rounded-br-md md:rounded-lg w-full overflow-hidden md:my-1 h-full"
            )}>
                <div className={cn(
                    "absolute -inset-3 bg-gradient-to-tr from-primary-1 via-primary-1 to-primary-1 dark:primary-1 blur"
                )}></div>
                <div className={cn(
                    "relative rounded-bl-lg rounded-br-lg md:rounded-lg flex justify-around border-2 border-primary-1 gap-4"
                )}>
                    <Link 
                        className={cn(
                            "hover:scale-95 font-semibold text-primary-3 dark:text-primary-1",
                            "hover:bg-clip-text hover:text-transparent",
                            "hover:bg-gradient-to-br from-primary-3 via-neutral-100 to-primary-3 text-lg",
                            pathname === "/" && "text-primary-2"
                        )} 
                        href="/"
                    >
                        Home
                    </Link>
                    <Link 
                        className={cn(
                            "hover:scale-95 font-semibold text-primary-3 dark:text-primary-1",
                            "hover:bg-clip-text hover:text-transparent",
                            "hover:bg-gradient-to-br from-primary-3 via-neutral-100 to-primary-3 text-lg",
                            pathname === "/projects" && "text-primary-2"
                        )} 
                        href="/projects"
                    >
                        Projects
                    </Link>
                    <Link 
                        className={cn(
                            "hover:scale-95 font-semibold text-primary-3 dark:text-primary-1",
                            "hover:bg-clip-text hover:text-transparent",
                            "hover:bg-gradient-to-br from-primary-3 via-neutral-100 to-primary-3 text-lg",
                            pathname === "/backlog" && "text-primary-2"
                        )} 
                        href="/backlog"
                    >
                        Backlog
                    </Link>
                </div>
            </div>
        </nav>
    )
}