'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // This would trigger a search action in a real app
    console.log('Searching for:', query);
  };

  return (
    <div className="max-w-full mx-auto mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          aria-label="ค้นหาสินค้า"
        />
      </div>
      <button
        onClick={handleSearch}
        className="mt-2 w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-red-500 focus:outline-none"
      >
        ค้นหา
      </button>
    </div>
  );
}