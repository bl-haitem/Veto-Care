import React from 'react'
import { UserAvatar } from '../ui/UserAvatar'
import StatusBadge from '../ui/StatusBadge'

export default function Navbar({ unread = 0, user = { name: 'Utilisateur' } }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-600">
              <path d="M12 2v6" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 8a4 4 0 008 0" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 14v8" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-heading font-bold text-gray-900 text-lg">Veto-Care</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full h-5 w-5 flex items-center justify-center">{unread}</span>}
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-400">Utilisateur</div>
            </div>
            <UserAvatar name={user.name} />
          </div>
        </div>
      </div>
    </header>
  )
}
