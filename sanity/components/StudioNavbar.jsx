// sanity/components/StudioNavbar.jsx
'use client'

import { useCurrentUser } from 'sanity'
import Image from 'next/image'

export function StudioNavbar() {
    const handleLogout = () => {
        window.location.href = 'https://www.sanity.io/logout?origin=' + encodeURIComponent(window.location.origin)
    }

    return (
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
            <Image
                src="/images/logo/logo_black.png"
                width={150}
                height={50}
                alt="Selva Studio"
                className="h-[26px] w-auto object-contain"
                priority
            />
            <button
                onClick={logout}
                className="text-xs uppercase tracking-widest border border-black text-black px-4 py-2 bg-brand-content hover:text-white transition-colors duration-200"
            >
                Log out
            </button>
        </div>
    )
}