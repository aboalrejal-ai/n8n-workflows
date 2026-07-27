import { Search, X, FolderOpen, Shapes, ShieldCheck } from 'lucide-react';
import { useStats } from '../hooks/useApi';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function Hero({ searchQuery, setSearchQuery }: HeroProps) {
  const { stats } = useStats();

  return (
    <section className="hero-section">
      <div className="hero-badge">
        <span className="pulse-dot"></span> Open Source Visual Intelligence Catalog
      </div>
      <h2>
        Universal N8N Automations <br />
        <span className="highlight">Built for AI & Operations</span>
      </h2>
      <p className="hero-desc">
        An extensive, production-ready repository of <strong>{stats?.total ? stats.total.toLocaleString() : '6,400+'} N8N workflow templates</strong>. Instantly search, inspect, and copy JSON to deploy pixel-perfect automation pipelines.
      </p>
      
      <div className="filter-box">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            id="search-input" 
            placeholder="Search workflows by keyword, node, integration (e.g. telegram, gmail)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="stats-row">
        <div className="stat-pill">
          <FolderOpen size={16} /> <span>{stats?.total ? stats.total.toLocaleString() : '...'} Workflows</span>
        </div>
        <div className="stat-pill">
          <Shapes size={16} /> <span>{stats?.categories || 52} Categories</span>
        </div>
        <div className="stat-pill">
          <ShieldCheck size={16} /> <span>Production Verified</span>
        </div>
      </div>
    </section>
  );
}
