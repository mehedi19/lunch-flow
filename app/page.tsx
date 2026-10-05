'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface LunchEntry {
  id: string;
  name: string;
  category: 'veg' | 'non-veg' | 'special';
  price: number;
  date: string;
}

export default function Home() {
  const [entries, setEntries] = useState<LunchEntry[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'veg' | 'non-veg' | 'special'>('veg');
  const [price, setPrice] = useState('');

  const categoryPrices: Record<string, number> = {
    veg: 100,
    'non-veg': 150,
    special: 200,
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const newEntry: LunchEntry = {
      id: Date.now().toString(),
      name,
      category,
      price: parseFloat(price),
      date: new Date().toISOString().split('T')[0],
    };

    setEntries([...entries, newEntry]);
    setName('');
    setPrice('');
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const totalAmount = entries.reduce((sum, entry) => sum + entry.price, 0);
  const vegCount = entries.filter(e => e.category === 'veg').length;
  const nonVegCount = entries.filter(e => e.category === 'non-veg').length;
  const specialCount = entries.filter(e => e.category === 'special').length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-2">
            🍱 LunchFlow Pro
          </h1>
          <p className="text-gray-600 text-lg">Office Lunch Management System</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Add Entry Form */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Lunch</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Employee name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'veg' | 'non-veg' | 'special')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="veg">Veg (₹100)</option>
                  <option value="non-veg">Non-Veg (₹150)</option>
                  <option value="special">Special (₹200)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Add Entry
              </button>
            </form>
          </div>

          {/* Statistics */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm">Veg Orders</p>
              <p className="text-2xl font-bold text-green-600">{vegCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm">Non-Veg Orders</p>
              <p className="text-2xl font-bold text-red-600">{nonVegCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-gray-600 text-sm">Special Orders</p>
              <p className="text-2xl font-bold text-purple-600">{specialCount}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-6 flex items-center gap-2">
            <Calculator size={24} />
            <h2 className="text-2xl font-bold">Today's Orders</h2>
          </div>

          {entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No entries yet. Add your first lunch order!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800">{entry.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                            entry.category === 'veg'
                              ? 'bg-green-500'
                              : entry.category === 'non-veg'
                              ? 'bg-red-500'
                              : 'bg-purple-500'
                          }`}
                        >
                          {entry.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">₹{entry.price}</td>
                      <td className="px-6 py-4 text-gray-600">{entry.date}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
