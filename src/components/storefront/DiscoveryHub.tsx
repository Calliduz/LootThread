import React from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, Tag, ChevronDown, Check } from 'lucide-react';

interface DiscoveryHubProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: any) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  categories: string[];
}

export default function DiscoveryHub({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortOption,
  onSortChange,
  categories
}: DiscoveryHubProps) {
  const [isSortOpen, setIsSortOpen] = React.useState(false);

  const sortOptions = [
    { id: 'newest', label: 'Newest Arrivals' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'name-asc', label: 'Name: A-Z' },
  ];

  return (
    <div className="space-y-6 mb-12">
      {/* Search & Sort Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 transition-colors ${searchQuery ? 'text-brand-primary' : 'text-white/20'}`} />
          </div>
          <input
            type="text"
            placeholder="Search tactical gear, skins, hardware..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/40 focus:bg-white/[0.05] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-5 flex items-center text-white/20 hover:text-white/60 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="w-full lg:w-64 bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white/60 flex items-center justify-between hover:bg-white/[0.05] hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-4 h-4 text-brand-primary/60" />
              <span className="font-bold uppercase tracking-widest text-[10px]">
                {sortOptions.find(o => o.id === sortOption)?.label || 'Sort By'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-2 w-full lg:w-64 bg-bg-card border border-white/10 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl"
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSortChange(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${sortOption === opt.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                  >
                    {opt.label}
                    {sortOption === opt.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          <Tag className="w-3 h-3" /> Filters:
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeFilter === cat
                ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-[0_0_20px_rgba(0,255,204,0.1)]'
                : 'bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
