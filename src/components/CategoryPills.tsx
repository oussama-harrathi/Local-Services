'use client';

import { Category } from '@/lib/types';
import { ChefHat, Scissors, Sparkles, GraduationCap, Wrench } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: Category | '';
  onCategorySelect: (category: Category | '') => void;
}

const categories = [
  {
    value: '' as const,
    label: 'All',
    icon: null,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  },
  {
    value: 'food_home' as const,
    label: 'Food at home',
    icon: ChefHat,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  },
  {
    value: 'haircut_mobile' as const,
    label: 'Haircut at home',
    icon: Scissors,
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    value: 'cleaning' as const,
    label: 'Cleaning',
    icon: Sparkles,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  {
    value: 'tutoring' as const,
    label: 'Tutoring',
    icon: GraduationCap,
    color: 'bg-green-100 text-green-700 hover:bg-green-200'
  },
  {
    value: 'repairs' as const,
    label: 'Repairs',
    icon: Wrench,
    color: 'bg-red-100 text-red-700 hover:bg-red-200'
  },
];

export default function CategoryPills({ selectedCategory, onCategorySelect }: CategoryPillsProps) {
  return (
    <section id="categories" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Browse by category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect local provider for your needs
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.value;
            
            return (
              <button
                key={category.value}
                onClick={() => onCategorySelect(category.value)}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg'
                      : category.color
                  }
                `}
                aria-label={`Filter by ${category.label}`}
              >
                {Icon && (
                  <Icon className="w-4 h-4" />
                )}
                <span className="text-sm md:text-base">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}