import React, { useState } from 'react'
import { api } from '../api/api'

function AddTable({ isOpen, onClose, onSuccess }) {
  const [tableNumber, setTableNumber] = useState('')
  const [capacity, setCapacity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tableNumber || !capacity) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      await api.post('/api/users/admin/add-table', {
        table_number: Number(tableNumber),
        capacity: Number(capacity)
      })
      // Reset form
      setTableNumber('')
      setCapacity('')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add table')
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-slate-900">Add New Table</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Table Number
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full bg-white border border-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-300 text-slate-800 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Max Capacity (Pax)
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 4"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full bg-white border border-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-300 text-slate-800 shadow-xs"
            />
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
                  Saving...
                </>
              ) : 'Save Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTable