import { Link } from 'react-router-dom';
import { Settings, Bolt, Check, ArrowRight } from 'lucide-react';
import type { WorkflowSummary } from '../types';

interface WorkflowCardProps {
  workflow: WorkflowSummary;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const nodeCount = workflow.node_count || 0;
  let complexityClass = 'complexity-low';
  let complexityText = 'Low';
  
  if (nodeCount > 15) {
    complexityClass = 'complexity-high';
    complexityText = 'High';
  } else if (nodeCount > 5) {
    complexityClass = 'complexity-medium';
    complexityText = 'Medium';
  }

  const triggerType = workflow.trigger_type || 'Manual';

  return (
    <div className="brand-card">
      <div className="card-swatches">
        <span className="swatch-dot" style={{ background: 'var(--accent-orange)' }} title={`Node count: ${nodeCount}`}>
          <Settings size={12} />
        </span>
        <span className="swatch-dot" style={{ background: 'var(--accent-blue)' }} title={`Trigger: ${triggerType}`}>
          <Bolt size={12} />
        </span>
        <span className="swatch-dot" style={{ background: 'var(--accent-green)' }} title="Verified">
          <Check size={12} />
        </span>
      </div>
      
      <div className="brand-category">
        {workflow.tags && workflow.tags.length > 0 ? workflow.tags[0] : 'General'}
      </div>
      
      <h3>{workflow.name || 'Untitled Workflow'}</h3>
      <p className="brand-description">
        {workflow.description || `Automates ${workflow.name} using ${nodeCount} nodes.`}
      </p>
      
      <div className="card-footer">
        <span className={`complexity-badge ${complexityClass}`}>
          {complexityText} ({nodeCount} nodes)
        </span>
        <Link to={`/workflow/${encodeURIComponent(workflow.filename)}`} className="btn-card-action">
          Inspect <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
