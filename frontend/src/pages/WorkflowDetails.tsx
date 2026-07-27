import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowDetail } from '../hooks/useApi';
import { ArrowLeft, Copy, Download, Code, Share2 } from 'lucide-react';

export default function WorkflowDetails() {
  const { filename } = useParams<{ filename: string }>();
  const navigate = useNavigate();
  const { detail, loading, error } = useWorkflowDetail(filename || '');

  // Render mermaid diagram placeholder logic or real integration here if needed.
  
  const handleCopy = () => {
    if (detail?.raw_json) {
      navigator.clipboard.writeText(JSON.stringify(detail.raw_json, null, 2));
      alert('JSON copied to clipboard!'); // Replace with custom toast in production
    }
  };

  const handleDownload = () => {
    if (detail?.raw_json) {
      const blob = new Blob([JSON.stringify(detail.raw_json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${detail.metadata.name || 'workflow'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <main className="main-content" style={{ marginTop: '100px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading workflow details...</p>
        </div>
      ) : error || !detail ? (
        <div className="empty-state">
          <h4>Error loading workflow</h4>
          <p>{error || 'Workflow not found.'}</p>
        </div>
      ) : (
        <div className="workflow-detail-container" style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
          
          <div className="drawer-header" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{detail.metadata.name}</h2>
                <div className="drawer-badges" style={{ display: 'flex', gap: '10px' }}>
                  <span className="badge" style={{ padding: '6px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '20px', fontSize: '0.8rem' }}>{detail.metadata.category}</span>
                  <span className="badge" style={{ padding: '6px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '20px', fontSize: '0.8rem' }}>{detail.metadata.node_count} Nodes</span>
                  <span className="badge" style={{ padding: '6px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '20px', fontSize: '0.8rem' }}>Trigger: {detail.metadata.trigger_type}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleShare} className="btn btn-outline">
                  <Share2 size={16} /> Share Link
                </button>
                <button onClick={handleCopy} className="btn btn-primary">
                  <Copy size={16} /> Copy JSON
                </button>
                <button onClick={handleDownload} className="btn btn-outline">
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '30px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Code size={20} /> Workflow JSON Definition
            </h4>
            <pre style={{ 
              backgroundColor: 'var(--code-bg)', 
              padding: '20px', 
              borderRadius: '8px', 
              overflowX: 'auto',
              maxHeight: '600px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}>
              {JSON.stringify(detail.raw_json, null, 2)}
            </pre>
          </div>

        </div>
      )}
    </main>
  );
}
