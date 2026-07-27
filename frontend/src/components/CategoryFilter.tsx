import { useState } from 'react';
import { Shapes, ChevronDown, ChevronUp } from 'lucide-react';
import { useCategories } from '../hooks/useApi';

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export default function CategoryFilter({ activeCategory, setActiveCategory }: CategoryFilterProps) {
  const { categories } = useCategories();
  const [expanded, setExpanded] = useState(false);
  const INITIAL_VISIBLE = 6;

  return (
    <div className="category-pills-container">
      <div className="category-header-row">
        <span className="category-title">
          <Shapes size={16} /> Browse Categories
        </span>
        {categories.length > INITIAL_VISIBLE && (
          <button className="btn-toggle-cats" onClick={() => setExpanded(!expanded)}>
            <span>{expanded ? 'Show Less' : 'Show More'}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      
      <div className={`category-pills ${expanded ? 'expanded' : ''}`}>
        <button 
          className={`pill-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Categories
        </button>
        
        {categories.map((cat, idx) => (
          <button
            key={cat}
            className={`pill-btn ${idx >= INITIAL_VISIBLE && !expanded ? 'extra-pill' : ''} ${activeCategory === cat ? 'active' : ''}`}
            style={{ display: idx >= INITIAL_VISIBLE && !expanded ? 'none' : 'inline-block' }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
