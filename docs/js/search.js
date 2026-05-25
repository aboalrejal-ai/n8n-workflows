/**
 * Client-side search functionality for N8N Workflow Collection
 * Handles searching, filtering, and displaying workflow results
 */

class WorkflowSearch {
    constructor() {
        this.searchIndex = null;
        this.currentResults = [];
        this.displayedCount = 0;
        this.resultsPerPage = 20;
        this.isLoading = false;

        // DOM elements
        this.searchInput = document.getElementById('search-input');
        this.categoryFilter = document.getElementById('category-filter');
        this.complexityFilter = document.getElementById('complexity-filter');
        this.triggerFilter = document.getElementById('trigger-filter');
        this.resultsGrid = document.getElementById('results-grid');
        this.resultsTitle = document.getElementById('results-title');
        this.resultsCount = document.getElementById('results-count');
        this.loadingEl = document.getElementById('loading');
        this.noResultsEl = document.getElementById('no-results');
        this.loadMoreBtn = document.getElementById('load-more');

        this.init();
    }

    async init() {
        try {
            await this.loadSearchIndex();
            this.setupEventListeners();
            this.populateFilters();
            this.updateStats();
            this.showFeaturedWorkflows();
        } catch (error) {
            console.error('Failed to initialize search:', error);
            this.showError('Failed to load workflow data. Please try again later.');
        }
    }

    async loadSearchIndex() {
        this.showLoading(true);
        try {
            const response = await fetch('api/search-index.json');
            if (!response.ok) {
                throw new Error('Failed to load search index');
            }
            this.searchIndex = await response.json();
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Filters
        this.categoryFilter.addEventListener('change', this.handleSearch.bind(this));
        this.complexityFilter.addEventListener('change', this.handleSearch.bind(this));
        this.triggerFilter.addEventListener('change', this.handleSearch.bind(this));

        // Load more button
        this.loadMoreBtn.addEventListener('click', this.loadMoreResults.bind(this));

        // Search button
        document.getElementById('search-btn').addEventListener('click', this.handleSearch.bind(this));
    }

    populateFilters() {
        // Populate category filter
        this.searchIndex.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.categoryFilter.appendChild(option);
        });
    }

    updateStats() {
        const stats = this.searchIndex.stats;

        document.getElementById('total-count').textContent = stats.total_workflows.toLocaleString();
        document.getElementById('workflows-count').textContent = stats.total_workflows.toLocaleString();
        document.getElementById('active-count').textContent = stats.active_workflows.toLocaleString();
        document.getElementById('integrations-count').textContent = stats.unique_integrations.toLocaleString();
        document.getElementById('categories-count').textContent = stats.categories.toLocaleString();
    }

    handleSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        const category = this.categoryFilter.value;
        const complexity = this.complexityFilter.value;
        const trigger = this.triggerFilter.value;

        this.currentResults = this.searchWorkflows(query, { category, complexity, trigger });
        this.displayedCount = 0;
        this.displayResults(true);
        this.updateResultsHeader(query, { category, complexity, trigger });
    }

    searchWorkflows(query, filters = {}) {
        let results = [...this.searchIndex.workflows];

        // Text search
        if (query) {
            results = results.filter(workflow =>
                workflow.searchable_text.includes(query)
            );

            // Sort by relevance (name matches first, then description)
            results.sort((a, b) => {
                const aNameMatch = a.name.toLowerCase().includes(query);
                const bNameMatch = b.name.toLowerCase().includes(query);

                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;

                return 0;
            });
        }

        // Apply filters
        if (filters.category) {
            results = results.filter(workflow => workflow.category === filters.category);
        }

        if (filters.complexity) {
            results = results.filter(workflow => workflow.complexity === filters.complexity);
        }

        if (filters.trigger) {
            results = results.filter(workflow => workflow.trigger_type === filters.trigger);
        }

        return results;
    }

    showFeaturedWorkflows() {
        // Show recent workflows or popular ones when no search
        const featured = this.searchIndex.workflows
            .filter(w => w.integrations.length > 0)
            .slice(0, this.resultsPerPage);

        this.currentResults = featured;
        this.displayedCount = 0;
        this.displayResults(true);
        this.resultsTitle.textContent = 'Featured Workflows';
        this.resultsCount.textContent = '';
    }

    displayResults(reset = false) {
        if (reset) {
            this.resultsGrid.innerHTML = '';
            this.displayedCount = 0;
        }

        if (this.currentResults.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideNoResults();

        const startIndex = this.displayedCount;
        const endIndex = Math.min(startIndex + this.resultsPerPage, this.currentResults.length);
        const resultsToShow = this.currentResults.slice(startIndex, endIndex);

        resultsToShow.forEach(workflow => {
            const card = this.createWorkflowCard(workflow);
            this.resultsGrid.appendChild(card);
        });

        this.displayedCount = endIndex;

        // Update load more button
        if (this.displayedCount < this.currentResults.length) {
            this.loadMoreBtn.classList.remove('hidden');
        } else {
            this.loadMoreBtn.classList.add('hidden');
        }
    }

    createWorkflowCard(workflow) {
        const card = document.createElement('div');
        card.className = 'workflow-card';
        card.onclick = () => this.openWorkflowDetails(workflow);

        const integrationTags = workflow.integrations
            .slice(0, 3)
            .map(integration => `<span class="integration-tag">${integration}</span>`)
            .join('');

        const moreIntegrations = workflow.integrations.length > 3
            ? `<span class="integration-tag">+${workflow.integrations.length - 3} more</span>`
            : '';

        card.innerHTML = `
            <h3 class="workflow-title">${this.escapeHtml(workflow.name)}</h3>
            <p class="workflow-description">${this.escapeHtml(workflow.description)}</p>

            <div class="workflow-meta">
                <span class="meta-tag category">${workflow.category}</span>
                <span class="meta-tag trigger">${workflow.trigger_type}</span>
                <span class="meta-tag">${workflow.complexity} complexity</span>
                <span class="meta-tag">${workflow.node_count} nodes</span>
            </div>

            <div class="workflow-integrations">
                ${integrationTags}
                ${moreIntegrations}
            </div>

            <div class="workflow-actions">
                <a href="${workflow.download_url}" class="btn btn-primary" target="_blank" onclick="event.stopPropagation()">
                    📥 Download JSON
                </a>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); window.copyWorkflowId('${workflow.filename}')">
                    📋 Copy ID
                </button>
            </div>
        `;

        return card;
    }

    openWorkflowDetails(workflow) {
        // Create modal or expand card with more details
        const modal = this.createDetailsModal(workflow);
        document.body.appendChild(modal);

        // Add event listener to close modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    createDetailsModal(workflow) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const allIntegrations = workflow.integrations
            .map(integration => `<span class="integration-tag">${integration}</span>`)
            .join('');

        const allTags = workflow.tags
            .map(tag => `<span class="meta-tag">${tag}</span>`)
            .join('');

        modalContent.innerHTML = `
            <button class="modal-close-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>

            <h2 class="modal-title">${this.escapeHtml(workflow.name)}</h2>

            <div class="modal-section">
                <span class="modal-section-title">Description</span>
                <p class="modal-description">${this.escapeHtml(workflow.description)}</p>
            </div>

            <div class="modal-section">
                <span class="modal-section-title">Workflow Specs</span>
                <div class="modal-details-grid">
                    <div class="modal-detail-item"><strong>Category:</strong> <span>${workflow.category}</span></div>
                    <div class="modal-detail-item"><strong>Trigger:</strong> <span>${workflow.trigger_type}</span></div>
                    <div class="modal-detail-item"><strong>Complexity:</strong> <span>${workflow.complexity}</span></div>
                    <div class="modal-detail-item"><strong>Nodes:</strong> <span>${workflow.node_count}</span></div>
                    <div class="modal-detail-item"><strong>Status:</strong> <span>${workflow.active ? 'Active' : 'Inactive'}</span></div>
                    <div class="modal-detail-item modal-detail-file"><strong>File:</strong> <code>${workflow.filename}</code></div>
                </div>
            </div>

            <div class="modal-section">
                <span class="modal-section-title">Integrations (${workflow.integrations.length})</span>
                <div class="modal-integrations-flex">
                    ${allIntegrations}
                </div>
            </div>

            ${workflow.tags.length > 0 ? `
                <div class="modal-section">
                    <span class="modal-section-title">Tags</span>
                    <div class="modal-tags-flex">
                        ${allTags}
                    </div>
                </div>
            ` : ''}

            <div class="modal-actions">
                <a href="${workflow.download_url}" class="btn btn-primary" target="_blank">
                    📥 Download JSON
                </a>
                <button class="btn btn-secondary" onclick="window.copyWorkflowId('${workflow.filename}')">
                    📋 Copy Filename
                </button>
            </div>
        `;

        modal.appendChild(modalContent);
        return modal;
    }

    updateResultsHeader(query, filters) {
        let title = 'Search Results';
        let filterDesc = [];

        if (query) {
            title = `Search: "${query}"`;
        }

        if (filters.category) filterDesc.push(`Category: ${filters.category}`);
        if (filters.complexity) filterDesc.push(`Complexity: ${filters.complexity}`);
        if (filters.trigger) filterDesc.push(`Trigger: ${filters.trigger}`);

        if (filterDesc.length > 0) {
            title += ` (${filterDesc.join(', ')})`;
        }

        this.resultsTitle.textContent = title;
        this.resultsCount.textContent = `${this.currentResults.length} workflows found`;
    }

    loadMoreResults() {
        this.displayResults(false);
    }

    showLoading(show) {
        this.isLoading = show;
        this.loadingEl.classList.toggle('hidden', !show);
    }

    showNoResults() {
        this.noResultsEl.classList.remove('hidden');
        this.loadMoreBtn.classList.add('hidden');
    }

    hideNoResults() {
        this.noResultsEl.classList.add('hidden');
    }

    showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            text-align: center;
        `;
        errorEl.textContent = message;

        this.resultsGrid.innerHTML = '';
        this.resultsGrid.appendChild(errorEl);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global functions
window.copyWorkflowId = function(filename) {
    navigator.clipboard.writeText(filename).then(() => {
        // Show temporary success message
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = filename;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
};

// Initialize search when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WorkflowSearch();
});