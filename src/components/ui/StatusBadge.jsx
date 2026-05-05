import React from 'react'

const configs = {
  en_attente: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  confirme:   { label: 'Confirmé',   className: 'bg-green-100 text-green-800 border border-green-200' },
  annule:     { label: 'Annulé',     className: 'bg-red-100 text-red-800 border border-red-200' },
  termine:    { label: 'Terminé',    className: 'bg-blue-100 text-blue-800 border border-blue-200' },
  pending:    { label: 'En vérification', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  approved:   { label: 'Approuvé',   className: 'bg-green-100 text-green-800 border border-green-200' },
  rejected:   { label: 'Refusé',     className: 'bg-red-100 text-red-800 border border-red-200' },
}

export function StatusBadge({ status }) {
  const config = configs[status] || { label: status, className: 'bg-gray-100 text-gray-800 border border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge
