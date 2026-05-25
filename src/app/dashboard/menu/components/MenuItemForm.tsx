'use client'

import { useRef } from 'react'
import { createMenuItem } from '../actions'

export default function MenuItemForm() {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        await createMenuItem(formData)
        formRef.current?.reset()
      }} 
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Item</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input name="name" type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 h-[44px]" placeholder="e.g. Classic Burger" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
          <input name="price" type="number" step="0.01" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 h-[44px]" placeholder="e.g. 12.99" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea name="description" rows={2} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Brief description of the dish..."></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select name="category" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 h-[44px]">
            <option value="Starters">Starters</option>
            <option value="Main Course">Main Course</option>
            <option value="Drinks">Drinks</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dietary Tags</label>
          <input name="tags" type="text" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 h-[44px]" placeholder="Veg, Spicy (comma separated)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
          <input name="image" type="file" accept="image/*" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button type="submit" className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors h-[44px] flex items-center justify-center">
          Save Item
        </button>
      </div>
    </form>
  )
}
