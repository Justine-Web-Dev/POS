import React, { useState, useEffect } from 'react'
import { api } from '../api/api'

const statusChoices = [
  {
    value: 'Available',
    label: 'Available',
    description: 'Table is empty, cleaned, and ready for new guests.',
    border: 'border-slate-200 hover:border-slate-300',
    activeBorder: 'border-slate-800 ring-2 ring-slate-800/10',
    dot: 'bg-slate-400',
    text: 'text-slate-800'
  },
  {
    value: 'Occupied',
    label: 'Occupied',
    description: 'Guests are currently seated and dining.',
    border: 'border-orange-200 hover:border-orange-300',
    activeBorder: 'border-orange-500 ring-2 ring-orange-500/10',
    dot: 'bg-orange-500',
    text: 'text-orange-950 font-semibold'
  },
  {
    value: 'Reserved',
    label: 'Reserved',
    description: 'Table is locked for a pending customer booking.',
    border: 'border-yellow-200 hover:border-yellow-300',
    activeBorder: 'border-yellow-500 ring-2 ring-yellow-500/10',
    dot: 'bg-yellow-500',
    text: 'text-yellow-950 font-semibold'
  },
  {
    value: 'Dirty',
    label: 'Dirty',
    description: 'Needs cleanup and sanitization before next seating.',
    border: 'border-rose-200 hover:border-rose-300',
    activeBorder: 'border-rose-500 ring-2 ring-rose-500/10',
    dot: 'bg-rose-500',
    text: 'text-rose-950 font-semibold'
  }
]

function UpdateStatusModal({ isOpen, onClose, onSuccess, table }) {
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync selectedStatus with table.status when modal opens
  useEffect(() => {
    if (table) {
      setSelectedStatus(table.status || 'Available')
    }
  }, [table, isOpen])

  if (!isOpen || !table) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.put(`/api/users/admin/update-table/${table.id}`, {
        status: selectedStatus
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update table status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Update Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Changing status for {table.table_number}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form Selection List */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {statusChoices.map((choice) => {
              const isSelected = selectedStatus === choice.value
              return (
                <div
                  key={choice.value}
                  onClick={() => setSelectedStatus(choice.value)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected ? choice.activeBorder : choice.border
                  } bg-white`}
                >
                  <div className="pt-0.5 shrink-0">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'border-slate-800' : 'border-slate-300'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-slate-800" />}
                    </span>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${choice.dot}`}></span>
                      <span className={`text-sm ${choice.text}`}>{choice.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {choice.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateStatusModal