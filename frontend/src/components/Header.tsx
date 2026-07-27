import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bolt, Moon, Sun, UserCheck } from 'lucide-react';

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    document.body.classList.add(`${savedTheme}-mode`);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${newTheme}-mode`);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-icon" style={{ fontSize: '1.6rem', color: 'var(--accent-orange)' }}>
            <Bolt size={28} />
          </div>
          <div className="logo-text">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>N8N Workflows Hub</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Universal Automation Catalog</span>
          </div>
        </Link>
        
        <nav className="nav-links">
          <span className="curator-tag">
            <UserCheck size={14} /> Curated by <strong>Mohammed Abo Alrejal</strong>
          </span>
          <a href="https://github.com/aboalrejal-ai/n8n-workflows" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            Star on GitHub
          </a>
          <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
