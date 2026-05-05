import React from 'react'

export function StatCard({ icon: Icon, label, value, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
      <p className="text-2xl font-bold font-heading text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export default StatCard
