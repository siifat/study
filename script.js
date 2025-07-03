// Configuration
const CONFIG = {
    // GitHub repository information
    // Update these values with your actual repository details
    GITHUB_USER: 'siifat', // Your GitHub username
    GITHUB_REPO: 'study-website', // Your repository name
    GITHUB_BRANCH: 'main', // Usually 'main' or 'master'
    
    // Folders to scan for notes (relative to repository root)
    NOTE_FOLDERS: ['uploads'], // Only scan uploads directory
    
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
let currentTheme = localStorage.getItem('theme') || 'dark';
let searchSuggestions = [];

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
const themeToggle = document.getElementById('themeToggle');
const dragDropZone = document.getElementById('dragDropZone');
const fileInput = document.getElementById('fileInput');
const browseFiles = document.getElementById('browseFiles');
const searchSuggestionsEl = document.getElementById('searchSuggestions');

// 📊 Analytics and Charts
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Initialize theme
    initializeTheme();
    
    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Check if GitHub configuration is set
    if (CONFIG.GITHUB_USER === 'your-username' || CONFIG.GITHUB_REPO === 'your-repo-name') {
        showConfigurationMessage();
        return;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize drag and drop
    initializeDragDrop();
    
    // Load files from GitHub
    await loadFilesFromGitHub();
}

// 🎨 Theme Management
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggleIcon();
    
    // Add smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeToggleIcon() {
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// 📁 Drag & Drop Functionality
function initializeDragDrop() {
    if (!dragDropZone || !fileInput || !browseFiles) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragDropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dragDropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dragDropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dragDropZone.addEventListener('drop', handleDrop, false);
    
    // Handle browse button
    browseFiles.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dragDropZone.classList.add('drag-over');
}

function unhighlight() {
    dragDropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    [...files].forEach(previewFile);
}

function previewFile(file) {
    // Create preview modal
    const modal = createPreviewModal(file);
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('active'), 10);
}

function createPreviewModal(file) {
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
        <div class="preview-modal-backdrop"></div>
        <div class="preview-modal-content">
            <div class="preview-header">
                <h3>${file.name}</h3>
                <button class="close-preview" onclick="closePreviewModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="preview-body">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="${getFileIcon(file.name)}"></i>
                    </div>
                    <div class="file-details">
                        <p><strong>Size:</strong> ${formatFileSize(file.size)}</p>
                        <p><strong>Type:</strong> ${file.type || 'Unknown'}</p>
                        <p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="preview-content" id="previewContent-${Date.now()}">
                    ${getPreviewContent(file)}
                </div>
            </div>
        </div>
    `;
    
    // Load file content for preview
    loadFilePreview(file, modal);
    
    return modal;
}

function loadFilePreview(file, modal) {
    const reader = new FileReader();
    const previewContent = modal.querySelector('.preview-content');
    
    if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
            previewContent.innerHTML = `<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto;">`;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        reader.onload = (e) => {
            previewContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: var(--font-mono);">${e.target.result}</pre>`;
        };
        reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
        previewContent.innerHTML = `
            <div class="pdf-preview">
                <i class="fas fa-file-pdf" style="font-size: 4rem; color: #dc3545;"></i>
                <p>PDF Preview</p>
                <p>File: ${file.name}</p>
                <p>Size: ${formatFileSize(file.size)}</p>
                <small>Note: PDF preview requires server environment</small>
            </div>
        `;
    } else {
        previewContent.innerHTML = `
            <div class="unsupported-preview">
                <i class="fas fa-file" style="font-size: 4rem; color: var(--text-muted);"></i>
                <p>Preview not supported for this file type</p>
            </div>
        `;
    }
}

function getPreviewContent(file) {
    return '<div class="preview-loading"><i class="fas fa-spinner fa-spin"></i> Loading preview...</div>';
}

function closePreviewModal(btn) {
    const modal = btn.closest('.preview-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

// 🔍 Enhanced Search with Suggestions
function generateSearchSuggestions() {
    const suggestions = new Set();
    
    allFiles.forEach(file => {
        // Add file names
        suggestions.add(file.name);
        
        // Add file types
        suggestions.add(file.type.toUpperCase());
        
        // Add categories
        if (file.category && file.category !== 'other') {
            suggestions.add(file.category.replace('-', ' '));
        }
        
        // Add platforms for online files
        if (file.platform) {
            suggestions.add(file.platform);
        }
        
        // Add keywords from file names
        const words = file.name.split(/[\s\-_.]/).filter(word => word.length > 2);
        words.forEach(word => suggestions.add(word));
    });
    
    searchSuggestions = Array.from(suggestions).sort();
}

function showSearchSuggestions(query) {
    if (!searchSuggestionsEl || !query || query.length < 2) {
        hideSearchSuggestions();
        return;
    }
    
    const filtered = searchSuggestions
        .filter(suggestion => 
            suggestion.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
    
    if (filtered.length === 0) {
        hideSearchSuggestions();
        return;
    }
    
    searchSuggestionsEl.innerHTML = filtered
        .map(suggestion => `
            <div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">
                <i class="fas fa-search"></i>
                <span>${highlightMatch(suggestion, query)}</span>
            </div>
        `).join('');
    
    searchSuggestionsEl.classList.add('active');
}

function hideSearchSuggestions() {
    if (searchSuggestionsEl) {
        searchSuggestionsEl.classList.remove('active');
    }
}

function selectSuggestion(suggestion) {
    if (searchInput) {
        searchInput.value = suggestion;
        handleSearch();
        hideSearchSuggestions();
    }
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Enhanced event listeners
function setupEventListeners() {
    // Search functionality
    searchInput?.addEventListener('input', (e) => {
        handleSearch();
        showSearchSuggestions(e.target.value);
    });
    
    searchInput?.addEventListener('blur', () => {
        // Delay hiding to allow clicking suggestions
        setTimeout(hideSearchSuggestions, 200);
    });
    
    clearSearchBtn?.addEventListener('click', clearSearch);
    
    // Theme toggle
    themeToggle?.addEventListener('click', toggleTheme);
    
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
    searchInput?.addEventListener('input', () => {
        if (clearSearchBtn) {
            clearSearchBtn.classList.toggle('visible', searchInput.value.length > 0);
        }
    });
    
    // ⌨️ Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + F - Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape - Clear search or close modals
        if (e.key === 'Escape') {
            // Close modals first
            const modals = document.querySelectorAll('.preview-modal.active, .info-modal.active');
            if (modals.length > 0) {
                modals.forEach(modal => {
                    modal.classList.remove('active');
                    setTimeout(() => modal.remove(), 300);
                });
                return;
            }
            
            // Clear search if input is focused
            if (document.activeElement === searchInput) {
                clearSearch();
            }
        }
        
        // Ctrl/Cmd + Shift + T - Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Ctrl/Cmd + D - Download focused file (prevent default browser download)
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            const focusedCard = document.querySelector('.file-card:focus-within');
            if (focusedCard) {
                e.preventDefault();
                const downloadBtn = focusedCard.querySelector('.download-btn');
                if (downloadBtn) {
                    downloadBtn.click();
                }
            }
        }
        
        // Ctrl/Cmd + P - Preview focused file
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            const focusedCard = document.querySelector('.file-card:focus-within');
            if (focusedCard) {
                e.preventDefault();
                const previewBtn = focusedCard.querySelector('.preview-btn');
                if (previewBtn) {
                    previewBtn.click();
                }
            }
        }
    });
}

// Enhanced file loading
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
        
        // Generate search suggestions
        generateSearchSuggestions();
        
        updateStats();
        renderFiles();
        
        // Initialize charts after a short delay to ensure DOM is ready
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                try {
                    initializeCharts();
                    showToast('Analytics dashboard loaded successfully!', 'success', 2000);
                } catch (error) {
                    console.warn('Charts could not be initialized:', error);
                    showToast('Charts temporarily unavailable', 'warning', 2000);
                }
            }
        }, 1000);
        
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
                            downloadUrl: link.downloadUrl,
                            htmlUrl: link.viewUrl,
                            type: 'link',
                            category: getFileCategory(item.path),
                            isOnline: true,
                            originalUrl: link.url,
                            platform: link.platform,
                            platformType: link.type,
                            embedUrl: link.embedUrl,
                            viewUrl: link.viewUrl
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

function getGoogleDriveDirectLink(shareUrl) {
    // Convert Google Drive share link to direct download/view link
    const fileIdMatch = shareUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        return {
            viewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
            embedUrl: `https://drive.google.com/file/d/${fileId}/preview`
        };
    }
    return { viewUrl: shareUrl, downloadUrl: shareUrl, embedUrl: shareUrl };
}

function getOneDriveDirectLink(shareUrl) {
    // Convert OneDrive share link to direct link
    if (shareUrl.includes('1drv.ms') || shareUrl.includes('onedrive.live.com')) {
        // For OneDrive, we'll use the original link and try to convert for download
        const downloadUrl = shareUrl.replace('/view.aspx?', '/download.aspx?');
        return {
            viewUrl: shareUrl,
            downloadUrl: downloadUrl,
            embedUrl: shareUrl
        };
    }
    return { viewUrl: shareUrl, downloadUrl: shareUrl, embedUrl: shareUrl };
}

function processOnlineLink(url) {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('drive.google.com')) {
        return { ...getGoogleDriveDirectLink(url), platform: 'Google Drive', type: 'googledrive' };
    } else if (lowerUrl.includes('onedrive.live.com') || lowerUrl.includes('1drv.ms')) {
        return { ...getOneDriveDirectLink(url), platform: 'OneDrive', type: 'onedrive' };
    } else if (lowerUrl.includes('sharepoint.com')) {
        return { viewUrl: url, downloadUrl: url, embedUrl: url, platform: 'SharePoint', type: 'sharepoint' };
    } else if (lowerUrl.includes('dropbox.com')) {
        const downloadUrl = url.replace('?dl=0', '?dl=1');
        return { viewUrl: url, downloadUrl: downloadUrl, embedUrl: url, platform: 'Dropbox', type: 'dropbox' };
    }
    
    return { viewUrl: url, downloadUrl: url, embedUrl: url, platform: 'Web Link', type: 'weblink' };
}

function parseLinksFile(content) {
    const links = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && (trimmed.startsWith('http') || isOnlineLink(trimmed))) {
            // Extract title from line (format: "Title - URL" or just "URL")
            const parts = trimmed.split(' - ');
            let title, url;
            
            if (parts.length >= 2) {
                title = parts[0].trim();
                url = parts[1].trim();
            } else {
                url = trimmed;
                // Try to extract filename from URL or use platform name
                try {
                    const urlObj = new URL(url);
                    const pathname = urlObj.pathname;
                    title = pathname.split('/').pop() || 'Online File';
                    
                    // If no meaningful title, use platform-specific title
                    if (!title || title === 'view' || title === 'preview') {
                        const linkInfo = processOnlineLink(url);
                        title = `${linkInfo.platform} File`;
                    }
                } catch {
                    title = 'Online File';
                }
            }
            
            const linkInfo = processOnlineLink(url);
            links.push({
                title: title,
                url: url,
                ...linkInfo
            });
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
    let iconColor = '';
    
    if (file.type === 'pdf') {
        iconClass = 'fas fa-file-pdf pdf';
    } else if (file.type === 'md') {
        iconClass = 'fab fa-markdown md';
    } else if (file.type === 'link') {
        if (file.platformType === 'googledrive') {
            iconClass = 'fab fa-google-drive';
            iconColor = 'color: #4285f4;';
        } else if (file.platformType === 'onedrive') {
            iconClass = 'fab fa-microsoft';
            iconColor = 'color: #0078d4;';
        } else if (file.platformType === 'dropbox') {
            iconClass = 'fab fa-dropbox';
            iconColor = 'color: #0061ff;';
        } else {
            iconClass = 'fas fa-external-link-alt link';
        }
    }
    
    const fileSize = file.isOnline ? 'Online File' : formatFileSize(file.size);
    
    // Create unique button IDs for event handling
    const viewBtnId = `view-${Math.random().toString(36).substr(2, 9)}`;
    const downloadBtnId = `download-${Math.random().toString(36).substr(2, 9)}`;
    const previewBtnId = `preview-${Math.random().toString(36).substr(2, 9)}`;
    
    card.innerHTML = `
        <div class="file-header">
            <i class="${iconClass} file-icon" style="${iconColor}"></i>
            <div class="file-name">${escapeHtml(file.name)}</div>
            <div class="file-path">${escapeHtml(file.path)}</div>
            <div class="file-size">${fileSize}</div>
            ${file.isOnline ? `<div class="platform-badge ${file.platformType}">
                <i class="fas fa-cloud"></i> ${file.platform}
            </div>` : ''}
        </div>
        <div class="file-actions">
            ${file.isOnline && (file.platformType === 'googledrive' || file.platformType === 'onedrive') ? `
                <button id="${previewBtnId}" class="action-btn preview-btn">
                    <i class="fas fa-play"></i>
                    Preview
                </button>
            ` : ''}
            <button id="${viewBtnId}" class="action-btn view-btn">
                <i class="fas fa-${file.isOnline ? 'external-link-alt' : 'eye'}"></i>
                ${file.isOnline ? 'Open' : 'View'}
            </button>
            <a id="${downloadBtnId}" href="${file.downloadUrl}" ${file.isOnline ? 'target="_blank"' : `download="${file.name}"`} class="action-btn download-btn">
                <i class="fas fa-${file.isOnline ? 'download' : 'download'}"></i>
                Download
            </a>
            <button class="action-btn copy-btn" onclick="copyToClipboard('${file.originalUrl || file.downloadUrl}')" title="Copy link">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    `;
    
    // Add event listeners after card is created
    setTimeout(() => {
        const viewBtn = document.getElementById(viewBtnId);
        const previewBtn = document.getElementById(previewBtnId);
        
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                window.open(file.viewUrl || file.downloadUrl, '_blank');
            });
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                showFilePreview(file);
            });
        }
    }, 0);
    
    return card;
}

function showFilePreview(file) {
    // Create modal for file preview
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
        <div class="preview-modal-content">
            <div class="preview-header">
                <h3>${escapeHtml(file.name)}</h3>
                <button class="preview-close" onclick="closePreview()">&times;</button>
            </div>
            <div class="preview-body">
                <iframe src="${file.embedUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="preview-footer">
                <a href="${file.viewUrl}" target="_blank" class="action-btn view-btn">
                    <i class="fas fa-external-link-alt"></i>
                    Open in ${file.platform}
                </a>
                <a href="${file.downloadUrl}" target="_blank" class="action-btn download-btn">
                    <i class="fas fa-download"></i>
                    Download
                </a>
                <button class="action-btn copy-btn" onclick="copyToClipboard('${file.originalUrl}')">
                    <i class="fas fa-copy"></i>
                    Copy Link
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePreview();
        }
    });
}

function closePreview() {
    const modal = document.querySelector('.preview-modal');
    if (modal) {
        modal.remove();
    }
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
    const totalFiles = allFiles.length;
    const pdfCount = allFiles.filter(file => file.type === 'pdf').length;
    const mdCount = allFiles.filter(file => file.type === 'md').length;
    const onlineCount = allFiles.filter(file => file.isOnline).length;
    
    // Update basic stats
    updateElementText('totalFiles', totalFiles);
    updateElementText('pdfCount', pdfCount);
    updateElementText('mdCount', mdCount);
    updateElementText('onlineCount', onlineCount);
    
    // Update navigation stats
    updateElementText('navTotalFiles', totalFiles);
    updateElementText('navOnlineFiles', onlineCount);
    
    // Update tab counts
    updateElementText('allCount', totalFiles);
    updateElementText('pdfTabCount', pdfCount);
    updateElementText('mdTabCount', mdCount);
    updateElementText('linkTabCount', onlineCount);
    
    // Update charts if they exist
    if (typeof Chart !== 'undefined' && Object.keys(charts).length > 0) {
        initializeCharts();
    }
    
    // Update footer stats
    updateFooterStats();
}

// 📊 Chart.js Integration
function initializeCharts() {
    // Initialize Chart.js with global defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
        Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--glass-border').trim();
        Chart.defaults.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--glass-bg').trim();
        
        createFileTypeChart();
        createPlatformChart();
        createCategoryChart();
        updateMetrics();
    }
}

function createFileTypeChart() {
    const ctx = document.getElementById('fileTypeChart');
    if (!ctx) return;
    
    const fileTypeCounts = getFileTypeCounts();
    
    if (charts.fileType) {
        charts.fileType.destroy();
    }
    
    charts.fileType = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(fileTypeCounts),
            datasets: [{
                data: Object.values(fileTypeCounts),
                backgroundColor: [
                    'rgba(255, 107, 53, 0.8)',   // Primary orange
                    'rgba(40, 167, 69, 0.8)',    // Green for markdown
                    'rgba(0, 123, 255, 0.8)',    // Blue for online
                    'rgba(220, 53, 69, 0.8)',    // Red for PDF
                    'rgba(255, 193, 7, 0.8)'     // Yellow for others
                ],
                borderColor: [
                    'rgba(255, 107, 53, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(0, 123, 255, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(255, 193, 7, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 107, 53, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            }
        }
    });
}

function createPlatformChart() {
    const ctx = document.getElementById('platformChart');
    if (!ctx) return;
    
    const platformCounts = getPlatformCounts();
    
    if (charts.platform) {
        charts.platform.destroy();
    }
    
    charts.platform = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(platformCounts),
            datasets: [{
                label: 'Files',
                data: Object.values(platformCounts),
                backgroundColor: 'rgba(255, 107, 53, 0.8)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 107, 53, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const categoryCounts = getCategoryCounts();
    
    if (charts.category) {
        charts.category.destroy();
    }
    
    charts.category = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                data: Object.values(categoryCounts),
                backgroundColor: [
                    'rgba(255, 107, 53, 0.6)',
                    'rgba(40, 167, 69, 0.6)',
                    'rgba(0, 123, 255, 0.6)',
                    'rgba(220, 53, 69, 0.6)',
                    'rgba(255, 193, 7, 0.6)',
                    'rgba(108, 117, 125, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 107, 53, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(0, 123, 255, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 107, 53, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function getFileTypeCounts() {
    const counts = {};
    allFiles.forEach(file => {
        const type = file.type.toUpperCase();
        counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
}

function getPlatformCounts() {
    const counts = { 'Local': 0 };
    allFiles.forEach(file => {
        if (file.isOnline && file.platform) {
            counts[file.platform] = (counts[file.platform] || 0) + 1;
        } else {
            counts['Local']++;
        }
    });
    return counts;
}

function getCategoryCounts() {
    const counts = {};
    allFiles.forEach(file => {
        const category = file.category || 'other';
        const displayCategory = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        counts[displayCategory] = (counts[displayCategory] || 0) + 1;
    });
    return counts;
}

function updateMetrics() {
    // Calculate total storage
    const totalBytes = allFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    
    // Find largest file
    const largestFile = allFiles.reduce((largest, file) => 
        (file.size || 0) > (largest.size || 0) ? file : largest, {});
    
    // Find most common type
    const typeCounts = getFileTypeCounts();
    const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
        typeCounts[a] > typeCounts[b] ? a : b, 'N/A');
    
    // Update DOM elements
    updateElementText('totalStorage', `${totalMB} MB`);
    updateElementText('largestFile', largestFile.name || 'N/A');
    updateElementText('commonType', mostCommonType);
    updateElementText('lastUpdated', new Date().toLocaleDateString());
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// 🦶 Footer Utility Functions
function showSetupGuide() {
    const modal = createInfoModal('Setup Guide', `
        <div class="setup-guide">
            <h3>Quick Setup Steps</h3>
            <ol>
                <li><strong>Update Configuration:</strong> Edit <code>script.js</code> with your GitHub details</li>
                <li><strong>Add Files:</strong> Upload materials to the <code>/uploads</code> directory</li>
                <li><strong>Online Links:</strong> Add cloud links to <code>uploads/online-links.txt</code></li>
                <li><strong>Deploy:</strong> Enable GitHub Pages in repository settings</li>
            </ol>
            
            <h3>Supported File Types</h3>
            <ul>
                <li>📄 PDF files (.pdf)</li>
                <li>📝 Markdown files (.md, .markdown)</li>
                <li>📄 Text files (.txt)</li>
                <li>☁️ Online links (Google Drive, OneDrive, Dropbox)</li>
            </ul>
            
            <h3>Features</h3>
            <ul>
                <li>🔍 Advanced search with suggestions</li>
                <li>🎨 Dark/Light theme toggle</li>
                <li>📊 Analytics dashboard with charts</li>
                <li>📱 Fully responsive design</li>
                <li>🚀 Drag & drop file preview</li>
            </ul>
        </div>
    `);
    document.body.appendChild(modal);
}

function showShortcuts() {
    const modal = createInfoModal('Keyboard Shortcuts', `
        <div class="shortcuts-guide">
            <div class="shortcut-group">
                <h3>Search & Navigation</h3>
                <div class="shortcut-item">
                    <kbd>Ctrl + F</kbd>
                    <span>Focus search box</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Escape</kbd>
                    <span>Clear search / Close modals</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Tab</kbd>
                    <span>Navigate through filters</span>
                </div>
            </div>
            
            <div class="shortcut-group">
                <h3>File Actions</h3>
                <div class="shortcut-item">
                    <kbd>Enter</kbd>
                    <span>Open selected file</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl + D</kbd>
                    <span>Download file</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl + P</kbd>
                    <span>Preview file</span>
                </div>
            </div>
            
            <div class="shortcut-group">
                <h3>Theme & View</h3>
                <div class="shortcut-item">
                    <kbd>Ctrl + Shift + T</kbd>
                    <span>Toggle theme</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl + G</kbd>
                    <span>Toggle grid/list view</span>
                </div>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
}

function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        totalFiles: allFiles.length,
        files: allFiles.map(file => ({
            name: file.name,
            type: file.type,
            category: file.category,
            isOnline: file.isOnline,
            platform: file.platform,
            size: file.size
        })),
        stats: {
            fileTypes: getFileTypeCounts(),
            platforms: getPlatformCounts(),
            categories: getCategoryCounts()
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-notes-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!');
}

function showAbout() {
    const modal = createInfoModal('About Sifat\'s Handnotes', `
        <div class="about-content">
            <div class="about-hero">
                <i class="fas fa-graduation-cap" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <h3>Advanced Study Notes Platform</h3>
                <p>A modern, feature-rich digital library built for academic excellence</p>
            </div>
            
            <div class="about-section">
                <h4>🚀 Features</h4>
                <ul>
                    <li>Smart search with AI-powered suggestions</li>
                    <li>Cloud integration (Google Drive, OneDrive, Dropbox)</li>
                    <li>Advanced analytics dashboard</li>
                    <li>Drag & drop file preview</li>
                    <li>Dark/Light theme support</li>
                    <li>Fully responsive design</li>
                    <li>GitHub Pages compatible</li>
                </ul>
            </div>
            
            <div class="about-section">
                <h4>🛠️ Technology Stack</h4>
                <div class="tech-badges">
                    <span class="tech-badge">HTML5</span>
                    <span class="tech-badge">CSS3</span>
                    <span class="tech-badge">JavaScript ES6+</span>
                    <span class="tech-badge">Chart.js</span>
                    <span class="tech-badge">GitHub API</span>
                    <span class="tech-badge">PWA Ready</span>
                </div>
            </div>
            
            <div class="about-section">
                <h4>📊 Statistics</h4>
                <div class="about-stats">
                    <div class="about-stat">
                        <span class="stat-number">${allFiles.length}</span>
                        <span class="stat-label">Total Files</span>
                    </div>
                    <div class="about-stat">
                        <span class="stat-number">${Object.keys(getFileTypeCounts()).length}</span>
                        <span class="stat-label">File Types</span>
                    </div>
                    <div class="about-stat">
                        <span class="stat-number">${allFiles.filter(f => f.isOnline).length}</span>
                        <span class="stat-label">Online Files</span>
                    </div>
                </div>
            </div>
            
            <div class="about-footer">
                <p><strong>Version:</strong> 2.0 • <strong>Built for:</strong> United International University</p>
                <p><strong>Developer:</strong> Academic Excellence Team • <strong>Year:</strong> 2024-2025</p>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
}

function createInfoModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
        <div class="info-modal-backdrop" onclick="closeInfoModal(this)"></div>
        <div class="info-modal-content">
            <div class="info-modal-header">
                <h2>${title}</h2>
                <button class="close-info-modal" onclick="closeInfoModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="info-modal-body">
                ${content}
            </div>
        </div>
    `;
    
    setTimeout(() => modal.classList.add('active'), 10);
    return modal;
}

function closeInfoModal(element) {
    const modal = element.closest('.info-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

// Update footer stats
function updateFooterStats() {
    updateElementText('footerTotalFiles', allFiles.length);
    updateElementText('footerOnlineFiles', allFiles.filter(f => f.isOnline).length);
}

// 🍞 Enhanced Toast Notifications
function showToast(message, type = 'success', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    });
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="closeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('toast-in'), 10);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('toast-in');
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

function closeToast(button) {
    const toast = button.closest('.toast-notification');
    toast.classList.remove('toast-in');
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
}
