// Configuration
const CONFIG = {
    // GitHub repository information
    // Update these values with your actual repository details
    GITHUB_USER: 'siifat', // Your GitHub username
    GITHUB_REPO: 'study', // Your repository name
    GITHUB_BRANCH: 'main', // Usually 'main' or 'master'
    
    // Folders to scan for notes (relative to repository root)
    NOTE_FOLDERS: ['notes', 'pdfs', 'markdown', 'documents', ''], // Empty string scans Root
    
    // File extensions to include
    ALLOWED_EXTENSIONS: ['.pdf', '.md', '.markdown', '.txt'],
    
    // Online link patterns to detect
    ONLINE_LINK_PATTERNS: [
        'drive.google.com',
        'onedrive.live.com',
        '1drv.ms',
        'sharepoint.com',
        'dropbox.com'
    ],
    
    // GitHub API base URL
    GITHUB_API_BASE: 'https://api.github.com',
    GITHUB_RAW_BASE: 'https://raw.githubusercontent.com'
};

// Global variables
let allFiles = [];
let filteredFiles = [];
let currentFilter = 'all';
let currentCategory = 'all';

// DOM elements
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const filesList = document.getElementById('filesList');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const totalFilesCount = document.getElementById('totalFiles');
const pdfCountElement = document.getElementById('pdfCount');
const mdCountElement = document.getElementById('mdCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryButtons = document.querySelectorAll('.category-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Check if GitHub configuration is set
    if (CONFIG.GITHUB_USER === 'your-username' || CONFIG.GITHUB_REPO === 'your-repo-name') {
        showConfigurationMessage();
        return;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load files from GitHub
    await loadFilesFromGitHub();
}

function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setActiveFilter(filter);
            applyFilters();
        });
    });
    
    // Category buttons
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            setActiveCategory(category);
            applyFilters();
        });
    });
    
    // Clear search button visibility
    searchInput.addEventListener('input', () => {
        clearSearchBtn.classList.toggle('visible', searchInput.value.length > 0);
    });
}

async function loadFilesFromGitHub() {
    try {
        showLoading(true);
        hideMessages();
        
        allFiles = [];
        
        // Load files from each configured folder
        for (const folder of CONFIG.NOTE_FOLDERS) {
            await loadFilesFromFolder(folder);
        }
        
        // Remove duplicates and sort
        allFiles = removeDuplicates(allFiles);
        allFiles.sort((a, b) => a.name.localeCompare(b.name));
        
        filteredFiles = [...allFiles];
        
        updateStats();
        renderFiles();
        showLoading(false);
        
        if (allFiles.length === 0) {
            showNoResults();
        }
        
    } catch (error) {
        console.error('Error loading files:', error);
        showError();
        showLoading(false);
    }
}

async function loadFilesFromFolder(folder) {
    const url = `${CONFIG.GITHUB_API_BASE}/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${folder}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Folder not found: ${folder || 'root'}`);
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const items = await response.json();
        
        for (const item of items) {
            if (item.type === 'file' && isAllowedFile(item.name)) {
                allFiles.push({
                    name: item.name,
                    path: item.path,
                    size: item.size,
                    downloadUrl: item.download_url,
                    htmlUrl: item.html_url,
                    type: getFileType(item.name),
                    category: getFileCategory(item.path),
                    isOnline: false
                });
            } else if (item.type === 'file' && item.name.toLowerCase().includes('links') && item.name.endsWith('.txt')) {
                // Handle links files
                try {
                    const response = await fetch(item.download_url);
                    const content = await response.text();
                    const links = parseLinksFile(content);
                    
                    links.forEach(link => {
                        allFiles.push({
                            name: link.title,
                            path: item.path + ' → ' + link.title,
                            size: 0,
                            downloadUrl: link.url,
                            htmlUrl: link.url,
                            type: 'link',
                            category: getFileCategory(item.path),
                            isOnline: true,
                            originalUrl: link.url
                        });
                    });
                } catch (error) {
                    console.warn('Could not parse links file:', item.name);
                }
            } else if (item.type === 'dir') {
                // Recursively load subdirectories
                await loadFilesFromFolder(item.path);
            }
        }
    } catch (error) {
        console.warn(`Could not load folder ${folder}:`, error.message);
    }
}

function isAllowedFile(filename) {
    const extension = getFileExtension(filename);
    return CONFIG.ALLOWED_EXTENSIONS.includes(extension);
}

function isOnlineLink(content) {
    return CONFIG.ONLINE_LINK_PATTERNS.some(pattern => 
        content.toLowerCase().includes(pattern)
    );
}

function parseLinksFile(content) {
    const links = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && (trimmed.startsWith('http') || isOnlineLink(trimmed))) {
            // Extract title from line (format: "Title - URL" or just "URL")
            const parts = trimmed.split(' - ');
            if (parts.length >= 2) {
                links.push({
                    title: parts[0].trim(),
                    url: parts[1].trim()
                });
            } else {
                // Try to extract filename from URL
                const urlObj = new URL(trimmed);
                const pathname = urlObj.pathname;
                const filename = pathname.split('/').pop() || 'Online File';
                links.push({
                    title: filename,
                    url: trimmed
                });
            }
        }
    }
    return links;
}

function getFileExtension(filename) {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

function getFileType(filename) {
    const extension = getFileExtension(filename);
    if (extension === '.pdf') return 'pdf';
    if (['.md', '.markdown'].includes(extension)) return 'md';
    if (extension === '.txt') return 'txt';
    return 'other';
}

function getFileCategory(filepath) {
    const pathLower = filepath.toLowerCase();
    
    // Check for category keywords in the file path
    if (pathLower.includes('data-structure') || pathLower.includes('algorithm') || pathLower.includes('dsa')) {
        return 'data-structures';
    }
    if (pathLower.includes('computer-architecture') || pathLower.includes('architecture') || pathLower.includes('coa')) {
        return 'computer-architecture';
    }
    if (pathLower.includes('electronics') || pathLower.includes('circuit') || pathLower.includes('electronic')) {
        return 'electronics';
    }
    if (pathLower.includes('programming') || pathLower.includes('coding') || pathLower.includes('java') || pathLower.includes('python') || pathLower.includes('cpp')) {
        return 'programming';
    }
    if (pathLower.includes('math') || pathLower.includes('calculus') || pathLower.includes('algebra') || pathLower.includes('statistics')) {
        return 'mathematics';
    }
    if (pathLower.includes('network') || pathLower.includes('networking') || pathLower.includes('tcp') || pathLower.includes('ip')) {
        return 'networking';
    }
    if (pathLower.includes('database') || pathLower.includes('sql') || pathLower.includes('dbms')) {
        return 'database';
    }
    
    return 'other';
}

function removeDuplicates(files) {
    const seen = new Set();
    return files.filter(file => {
        if (seen.has(file.path)) {
            return false;
        }
        seen.add(file.path);
        return true;
    });
}

function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        filteredFiles = [...allFiles];
    } else {
        filteredFiles = allFiles.filter(file => 
            file.name.toLowerCase().includes(query) ||
            file.path.toLowerCase().includes(query)
        );
    }
    
    applyFilters();
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    filteredFiles = [...allFiles];
    applyFilters();
}

function setActiveFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

function setActiveCategory(category) {
    currentCategory = category;
    categoryButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

function applyFilters() {
    let displayFiles = [...filteredFiles];
    
    // Apply file type filter
    if (currentFilter !== 'all') {
        displayFiles = displayFiles.filter(file => file.type === currentFilter);
    }
    
    // Apply category filter
    if (currentCategory !== 'all') {
        displayFiles = displayFiles.filter(file => file.category === currentCategory);
    }
    
    renderFiles(displayFiles);
    
    if (displayFiles.length === 0 && allFiles.length > 0) {
        showNoResults();
    } else {
        hideMessages();
    }
}

function renderFiles(filesToRender = filteredFiles) {
    filesList.innerHTML = '';
    
    filesToRender.forEach(file => {
        const fileCard = createFileCard(file);
        filesList.appendChild(fileCard);
    });
}

function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    let iconClass = 'fas fa-file';
    if (file.type === 'pdf') iconClass = 'fas fa-file-pdf pdf';
    else if (file.type === 'md') iconClass = 'fab fa-markdown md';
    else if (file.type === 'link') iconClass = 'fas fa-link link';
    
    const fileSize = file.isOnline ? 'Online File' : formatFileSize(file.size);
    
    // Create unique button IDs for event handling
    const viewBtnId = `view-${Math.random().toString(36).substr(2, 9)}`;
    const downloadBtnId = `download-${Math.random().toString(36).substr(2, 9)}`;
    
    card.innerHTML = `
        <div class="file-header">
            <i class="${iconClass} file-icon"></i>
            <div class="file-name">${escapeHtml(file.name)}</div>
            <div class="file-path">${escapeHtml(file.path)}</div>
            <div class="file-size">${fileSize}</div>
            ${file.isOnline ? '<div class="online-badge"><i class="fas fa-cloud"></i> Online</div>' : ''}
        </div>
        <div class="file-actions">
            <button id="${viewBtnId}" class="action-btn view-btn">
                <i class="fas fa-${file.isOnline ? 'external-link-alt' : 'eye'}"></i>
                ${file.isOnline ? 'Open' : 'View'}
            </button>
            <a id="${downloadBtnId}" href="${file.downloadUrl}" ${file.isOnline ? 'target="_blank"' : `download="${file.name}"`} class="action-btn download-btn">
                <i class="fas fa-${file.isOnline ? 'external-link-alt' : 'download'}"></i>
                ${file.isOnline ? 'Access' : 'Download'}
            </a>
            <button class="action-btn copy-btn" onclick="copyToClipboard('${file.downloadUrl}')" title="Copy link">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    `;
    
    // Add event listener for view button after card is created
    setTimeout(() => {
        const viewBtn = document.getElementById(viewBtnId);
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                window.open(file.downloadUrl, '_blank');
            });
        }
    }, 0);
    
    return card;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats() {
    const pdfCount = allFiles.filter(file => file.type === 'pdf').length;
    const mdCount = allFiles.filter(file => file.type === 'md').length;
    
    totalFilesCount.textContent = allFiles.length;
    pdfCountElement.textContent = pdfCount;
    mdCountElement.textContent = mdCount;
}

function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

function showError() {
    errorMessage.style.display = 'block';
}

function showNoResults() {
    noResults.style.display = 'block';
}

function hideMessages() {
    errorMessage.style.display = 'none';
    noResults.style.display = 'none';
}

function showConfigurationMessage() {
    filesList.innerHTML = `
        <div class="configuration-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <i class="fas fa-cog" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem; display: block;"></i>
            <h3 style="margin-bottom: 1rem; color: #333;">Configuration Required</h3>
            <p style="margin-bottom: 2rem; color: #666; max-width: 500px; margin-left: auto; margin-right: auto;">
                To get started, please update the configuration in <code>script.js</code>:
            </p>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; font-family: monospace; text-align: left; max-width: 400px; margin: 0 auto;">
                <strong>Update these values:</strong><br>
                GITHUB_USER: 'your-username'<br>
                GITHUB_REPO: 'your-repo-name'<br>
                GITHUB_BRANCH: 'main'
            </div>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                Then organize your notes in folders like: notes/, pdfs/, markdown/, etc.
            </p>
        </div>
    `;
    showLoading(false);
}

// Utility function to copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Show feedback (you can enhance this with a toast notification)
        const event = new CustomEvent('showToast', { 
            detail: { message: 'Download link copied to clipboard!' }
        });
        document.dispatchEvent(event);
        
    } catch (err) {
        console.error('Failed to copy text: ', err);
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            const event = new CustomEvent('showToast', { 
                detail: { message: 'Download link copied to clipboard!' }
            });
            document.dispatchEvent(event);
        } catch (fallbackErr) {
            console.error('Fallback copy failed: ', fallbackErr);
        }
        
        document.body.removeChild(textArea);
    }
}

// Simple toast notification system
document.addEventListener('showToast', function(e) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add CSS animation
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    toast.textContent = e.detail.message;
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
});
