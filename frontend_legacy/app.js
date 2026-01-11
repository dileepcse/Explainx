/**
 * ExplainX Frontend Application
 * Swagger-like UI for testing APIs with automatic trace explanation
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000';

// Endpoint configurations
const ENDPOINTS = {
    simple: {
        path: '/checkout/simple',
        method: 'POST',
        title: 'Simple Checkout',
        description: 'Basic checkout flow with user validation, discounts, and tax calculation',
        form: 'simple-form'
    },
    full: {
        path: '/checkout/full',
        method: 'POST',
        title: 'Full Checkout',
        description: 'Complete e-commerce checkout with inventory, discounts, promo codes, tax, and shipping',
        form: 'full-form'
    },
    products: {
        path: '/products',
        method: 'GET',
        title: 'List Products',
        description: 'Get all available products in inventory',
        form: null
    },
    'promo-codes': {
        path: '/promo-codes',
        method: 'GET',
        title: 'List Promo Codes',
        description: 'Get all available promotional codes',
        form: null
    },
    'user-types': {
        path: '/user-types',
        method: 'GET',
        title: 'List User Types',
        description: 'Get all user types and their discount tiers',
        form: null
    },
    states: {
        path: '/states',
        method: 'GET',
        title: 'List States',
        description: 'Get all US states with their tax rates',
        form: null
    }
};

// State
let currentEndpoint = 'simple';
let lastResponse = null;
let lastExplainText = '';

// DOM Elements
const elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    setupEventListeners();
    checkConnection();
    updateUI();
});

/**
 * Cache DOM elements for performance
 */
function cacheElements() {
    elements.apiItems = document.querySelectorAll('.api-item');
    elements.connectionStatus = document.getElementById('connection-status');
    elements.endpointTitle = document.getElementById('endpoint-title');
    elements.endpointDescription = document.getElementById('endpoint-description');
    elements.endpointUrl = document.getElementById('endpoint-url');
    elements.simpleForm = document.getElementById('simple-form');
    elements.fullForm = document.getElementById('full-form');
    elements.getPlaceholder = document.getElementById('get-placeholder');
    elements.executeBtn = document.getElementById('execute-btn');
    elements.clearBtn = document.getElementById('clear-btn');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.responseMetaStatus = document.getElementById('response-meta');
    elements.traceCount = document.getElementById('trace-count');
    elements.tabBtns = document.querySelectorAll('.tab-btn');
    elements.resultTab = document.getElementById('result-tab');
    elements.tracesTab = document.getElementById('traces-tab');
    elements.explainTab = document.getElementById('explain-tab');
    elements.resultEmpty = document.getElementById('result-empty');
    elements.resultJson = document.getElementById('result-json');
    elements.tracesEmpty = document.getElementById('traces-empty');
    elements.tracesList = document.getElementById('traces-list');
    elements.explainEmpty = document.getElementById('explain-empty');
    elements.explainContent = document.getElementById('explain-content');
    elements.explainText = document.getElementById('explain-text');
    elements.downloadBtn = document.getElementById('download-btn');
    elements.copyBtn = document.getElementById('copy-btn');
    elements.toastContainer = document.getElementById('toast-container');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // API navigation
    elements.apiItems.forEach(item => {
        item.addEventListener('click', () => {
            const endpoint = item.dataset.endpoint;
            selectEndpoint(endpoint);
        });
    });

    // Execute button
    elements.executeBtn.addEventListener('click', executeRequest);

    // Clear button
    elements.clearBtn.addEventListener('click', clearResponse);

    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Download button
    elements.downloadBtn.addEventListener('click', downloadExplainFile);

    // Copy button
    elements.copyBtn.addEventListener('click', copyExplainText);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            executeRequest();
        }
    });
}

/**
 * Check API connection
 */
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            elements.connectionStatus.classList.add('connected');
            elements.connectionStatus.classList.remove('error');
            elements.connectionStatus.querySelector('.status-text').textContent = 'Connected';
        } else {
            throw new Error('API not healthy');
        }
    } catch (error) {
        elements.connectionStatus.classList.add('error');
        elements.connectionStatus.classList.remove('connected');
        elements.connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
    }
}

/**
 * Select an endpoint
 */
function selectEndpoint(endpoint) {
    currentEndpoint = endpoint;
    
    // Update active state
    elements.apiItems.forEach(item => {
        item.classList.toggle('active', item.dataset.endpoint === endpoint);
    });

    updateUI();
}

/**
 * Update UI based on current endpoint
 */
function updateUI() {
    const config = ENDPOINTS[currentEndpoint];
    
    // Update header
    elements.endpointTitle.textContent = config.title;
    elements.endpointDescription.textContent = config.description;
    
    // Update endpoint URL
    elements.endpointUrl.innerHTML = `
        <span class="method-badge ${config.method.toLowerCase()}">${config.method}</span>
        <code>${API_BASE_URL}${config.path}</code>
    `;

    // Show/hide forms
    elements.simpleForm.classList.remove('active');
    elements.fullForm.classList.remove('active');
    elements.getPlaceholder.classList.remove('active');

    if (config.form === 'simple-form') {
        elements.simpleForm.classList.add('active');
    } else if (config.form === 'full-form') {
        elements.fullForm.classList.add('active');
    } else {
        elements.getPlaceholder.classList.add('active');
    }
}

/**
 * Execute API request
 */
async function executeRequest() {
    const config = ENDPOINTS[currentEndpoint];
    
    showLoading(true);
    const startTime = performance.now();

    try {
        let response;
        
        if (config.method === 'GET') {
            response = await fetch(`${API_BASE_URL}${config.path}`);
        } else {
            const body = getRequestBody();
            response = await fetch(`${API_BASE_URL}${config.path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        }

        const endTime = performance.now();
        const data = await response.json();
        
        lastResponse = data;
        
        // Display response
        displayResponse(data, response.status, endTime - startTime);
        
        showToast('Request completed successfully', 'success');
    } catch (error) {
        console.error('Request error:', error);
        showToast(`Error: ${error.message}`, 'error');
        
        // Show error in result
        elements.responseMetaStatus.innerHTML = `
            <span class="status-badge error">
                <span>❌</span>
                Error
            </span>
        `;
        elements.resultEmpty.style.display = 'none';
        elements.resultJson.classList.add('visible');
        elements.resultJson.querySelector('code').textContent = JSON.stringify({ error: error.message }, null, 2);
    } finally {
        showLoading(false);
    }
}

/**
 * Get request body from form
 */
function getRequestBody() {
    const config = ENDPOINTS[currentEndpoint];
    
    if (config.form === 'simple-form') {
        return {
            price: parseFloat(document.getElementById('simple-price').value),
            user_type: document.getElementById('simple-user-type').value
        };
    } else if (config.form === 'full-form') {
        return {
            product_id: document.getElementById('full-product').value,
            quantity: parseInt(document.getElementById('full-quantity').value),
            user_type: document.getElementById('full-user-type').value,
            state: document.getElementById('full-state').value,
            promo_code: document.getElementById('full-promo').value || '',
            express_shipping: document.getElementById('full-express').checked
        };
    }
    
    return {};
}

/**
 * Display response data
 */
function displayResponse(data, status, responseTime) {
    // Update meta
    const isSuccess = status >= 200 && status < 300;
    elements.responseMetaStatus.innerHTML = `
        <span class="status-badge ${isSuccess ? 'success' : 'error'}">
            <span>${isSuccess ? '✓' : '✗'}</span>
            ${status}
        </span>
        <span class="response-time">${responseTime.toFixed(0)}ms</span>
    `;

    // Result tab
    elements.resultEmpty.style.display = 'none';
    elements.resultJson.classList.add('visible');
    
    // For checkout endpoints, show only the result
    const displayData = data.result || data;
    elements.resultJson.querySelector('code').innerHTML = syntaxHighlight(JSON.stringify(displayData, null, 2));

    // Traces tab
    if (data.traces && data.traces.length > 0) {
        elements.traceCount.textContent = data.traces.length;
        elements.tracesEmpty.style.display = 'none';
        elements.tracesList.classList.add('visible');
        renderTraces(data.traces);
    } else {
        elements.traceCount.textContent = '0';
        elements.tracesEmpty.style.display = 'flex';
        elements.tracesList.classList.remove('visible');
    }

    // Explain tab
    if (data.explain_text) {
        lastExplainText = data.explain_text;
        elements.explainEmpty.style.display = 'none';
        elements.explainContent.classList.add('visible');
        elements.explainText.textContent = data.explain_text;
        elements.downloadBtn.disabled = false;
        elements.copyBtn.disabled = false;
    } else {
        elements.explainEmpty.style.display = 'flex';
        elements.explainContent.classList.remove('visible');
        elements.downloadBtn.disabled = true;
        elements.copyBtn.disabled = true;
    }

    // Switch to result tab
    switchTab('result');
}

/**
 * Render trace cards
 */
function renderTraces(traces) {
    elements.tracesList.innerHTML = traces.map((trace, index) => {
        const fileName = trace.file.split(/[/\\]/).pop();
        const duration = trace.duration_ms?.toFixed(2) || '0.00';
        
        return `
            <div class="trace-card" data-index="${index}">
                <div class="trace-header" onclick="toggleTrace(${index})">
                    <div class="trace-title">
                        <span class="trace-number">${index + 1}</span>
                        <div>
                            <div class="trace-name">${trace.function}()</div>
                            <div class="trace-file">${fileName}</div>
                        </div>
                    </div>
                    <span class="trace-duration">${duration}ms</span>
                </div>
                <div class="trace-body">
                    <div class="trace-section">
                        <div class="trace-section-title">
                            <span>📥</span>
                            Inputs
                        </div>
                        <pre>${syntaxHighlight(JSON.stringify(trace.inputs, null, 2))}</pre>
                    </div>
                    <div class="trace-section">
                        <div class="trace-section-title">
                            <span>📤</span>
                            Output
                        </div>
                        <pre>${syntaxHighlight(JSON.stringify(trace.output, null, 2))}</pre>
                    </div>
                    <div class="trace-section">
                        <div class="trace-section-title">
                            <span>💡</span>
                            Explanation
                        </div>
                        <div class="trace-explanation">${trace.explanation || 'No explanation available'}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Toggle trace card expansion
 */
window.toggleTrace = function(index) {
    const card = document.querySelector(`.trace-card[data-index="${index}"]`);
    card.classList.toggle('expanded');
};

/**
 * Switch active tab
 */
function switchTab(tab) {
    // Update button states
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
}

/**
 * Clear response display
 */
function clearResponse() {
    lastResponse = null;
    lastExplainText = '';
    
    // Reset meta
    elements.responseMetaStatus.innerHTML = '';
    elements.traceCount.textContent = '0';
    
    // Reset result tab
    elements.resultEmpty.style.display = 'flex';
    elements.resultJson.classList.remove('visible');
    elements.resultJson.querySelector('code').textContent = '';
    
    // Reset traces tab
    elements.tracesEmpty.style.display = 'flex';
    elements.tracesList.classList.remove('visible');
    elements.tracesList.innerHTML = '';
    
    // Reset explain tab
    elements.explainEmpty.style.display = 'flex';
    elements.explainContent.classList.remove('visible');
    elements.explainText.textContent = '';
    elements.downloadBtn.disabled = true;
    elements.copyBtn.disabled = true;

    showToast('Response cleared', 'success');
}

/**
 * Download explainX.txt file
 */
function downloadExplainFile() {
    if (!lastExplainText) return;

    const blob = new Blob([lastExplainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'explainX.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('File downloaded', 'success');
}

/**
 * Copy explain text to clipboard
 */
async function copyExplainText() {
    if (!lastExplainText) return;

    try {
        await navigator.clipboard.writeText(lastExplainText);
        showToast('Copied to clipboard', 'success');
    } catch (error) {
        showToast('Failed to copy', 'error');
    }
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    elements.loadingOverlay.classList.toggle('active', show);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : '✗'}</span>
        <span class="toast-message">${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Syntax highlight JSON
 */
function syntaxHighlight(json) {
    return json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
            let cls = 'json-string';
            if (/:$/.test(match)) {
                cls = 'json-key';
                match = match.slice(0, -1) + ':';
            }
            return `<span class="${cls}">${match}</span>`;
        })
        .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
        .replace(/\bnull\b/g, '<span class="json-null">null</span>')
        .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');
}

// Periodically check connection
setInterval(checkConnection, 30000);
