import React from 'react'

export function UserAvatar({ src, name, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl'
  }
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`} />
  return (
    <div className={`${sizes[size]} rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center ring-2 ring-white`}>
      {initials}
    </div>
  )
}

export default UserAvatar
