import { useState } from 'react';
import Hero from '../components/Hero';
import CategoryFilter from '../components/CategoryFilter';
import WorkflowCard from '../components/WorkflowCard';
import { useWorkflows } from '../hooks/useApi';
import { ChevronLeft, ChevronRight, TriangleAlert, FolderOpen } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 24;

  const { data, loading, error } = useWorkflows(searchQuery, activeCategory, page, perPage);

  return (
    <main className="main-content">
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <section className="catalog-section">
        <CategoryFilter activeCategory={activeCategory} setActiveCategory={(c) => { setActiveCategory(c); setPage(1); }} />
        
        <div className="brands-grid">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching workflows...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <TriangleAlert size={48} />
              <h4>Failed to load workflows</h4>
              <p>{error}</p>
            </div>
          ) : data?.workflows?.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} />
              <h4>No workflows found</h4>
              <p>Try searching for a different keyword or category.</p>
            </div>
          ) : (
            data?.workflows.map((wf) => (
              <WorkflowCard key={wf.id || wf.filename} workflow={wf} />
            ))
          )}
        </div>
        
        {data && data.pages > 1 && (
          <div className="pagination-container" style={{ display: 'flex' }}>
            <button 
              className="page-btn" 
              disabled={page <= 1} 
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="page-info">Page {page} of {data.pages}</span>
            <button 
              className="page-btn" 
              disabled={page >= data.pages}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
