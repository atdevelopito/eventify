import React from 'react';
import { Music, Trophy, Palette, Cpu, Utensils, PartyPopper, Heart, Briefcase } from 'lucide-react';

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const categories = [
  { id: 'Music', label: 'Music', icon: Music },
  { id: 'Sports', label: 'Sports', icon: Trophy },
  { id: 'Art', label: 'Art', icon: Palette },
  { id: 'Tech', label: 'Tech', icon: Cpu },
  { id: 'Food', label: 'Food & Drink', icon: Utensils },
  { id: 'Party', label: 'Party', icon: PartyPopper },
  { id: 'Wellness', label: 'Wellness', icon: Heart },
  { id: 'Business', label: 'Business', icon: Briefcase },
];

export const CategoryFilters = ({ selectedCategory, onCategorySelect }: CategoryFiltersProps) => {
  return (
    <section>
      <h2 className="text-lg md:text-xl font-medium mb-6">Browse by Category</h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onCategorySelect(null)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${selectedCategory === null
            ? 'bg-black text-white shadow-md shadow-black/10'
            : 'bg-white text-muted-foreground border border-border hover:border-black hover:text-black'
            }`}
        >
          <span className="">All</span>
        </button>
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(isSelected ? null : category.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${isSelected
                ? 'bg-black text-white shadow-md shadow-black/10'
                : 'bg-white text-muted-foreground border border-border hover:border-black hover:text-black'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="">{category.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
