'use client'

import { deleteMenuItem } from '../actions'
import { Trash2, Edit } from 'lucide-react'

export default function MenuItemList({ items }: { items: any[] }) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
        <p className="text-slate-500">No menu items yet. Add your first dish to get started.</p>
      </div>
    )
  }

  return (
    <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">
              No Image
            </div>
          )}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900">{item.name}</h3>
              <span className="font-medium text-brand-600">${item.price}</span>
            </div>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{item.description}</p>
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                {item.category}
              </span>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this item?')) {
                      deleteMenuItem(item.id)
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
