# 🎓 Sifat's Handnotes - Advanced Study Notes Platform

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://siifat.github.io/study-website)
[![Version](https://img.shields.io/badge/Version-2.0-blue)](https://github.com/siifat/study-website)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A beautiful, feature-rich, and highly polished static website for hosting and sharing study materials, PDFs, markdown notes, and online links. Built with modern web technologies and designed for academic excellence.

## ✨ Features

### 🔍 Smart Search & Navigation
- **AI-Powered Search**: Intelligent search with real-time suggestions
- **Advanced Filtering**: Filter by file type, category, and source
- **Keyboard Shortcuts**: Fast navigation with hotkeys
- **Auto-Complete**: Smart suggestions based on content

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Ultra-modern glass effect interface
- **Dark/Light Themes**: Toggle between themes with smooth transitions
- **Responsive Design**: Perfect experience on all devices
- **Smooth Animations**: Fluid micro-interactions and transitions

### ☁️ Cloud Integration
- **Google Drive**: Direct preview and download support
- **OneDrive**: Seamless integration with Microsoft's cloud
- **Dropbox**: File sharing and access
- **SharePoint**: Enterprise document management

### 📊 Analytics Dashboard
- **Visual Charts**: File distribution and platform analytics
- **Real-time Stats**: Live statistics and metrics
- **Performance Insights**: Storage and usage analytics
- **Export Data**: Download analytics in JSON format

### 🚀 Advanced Features
- **Drag & Drop**: Local file preview without upload
- **PWA Ready**: Progressive Web App capabilities
- **GitHub Pages**: Zero-cost hosting solution
- **No Backend**: Fully static, serverless architecture

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/siifat/study-website.git
cd study-website
```

### 2. Configure GitHub Settings
Edit `script.js` and update:
```javascript
const CONFIG = {
    GITHUB_USER: 'your-username',
    GITHUB_REPO: 'your-repo-name',
    GITHUB_BRANCH: 'main',
    NOTE_FOLDERS: ['uploads']
};
```

### 3. Add Your Files
Place your study materials in the `/uploads` directory:
```
uploads/
├── your-notes.pdf
├── study-guide.md
├── lecture-slides.txt
└── online-links.txt
```

### 4. Deploy to GitHub Pages
1. Push to GitHub
2. Go to repository Settings
3. Enable GitHub Pages
4. Select "Deploy from a branch"
5. Choose "main" branch

Your site will be live at: `https://your-username.github.io/your-repo-name`

## 📁 File Organization

### Local Files
Supported formats:
- **PDF Files** (`.pdf`) - With preview and download
- **Markdown** (`.md`, `.markdown`) - Formatted display
- **Text Files** (`.txt`) - Simple preview

### Online Links
Add cloud file links to `uploads/online-links.txt`:
```
Computer Science Notes - https://drive.google.com/file/d/your-file-id/view
Math Tutorial - https://onedrive.live.com/view.aspx?resid=your-file-id
Programming Guide - https://www.dropbox.com/s/your-file/guide.pdf
```

## 🛠️ Technology Stack

- **HTML5** - Semantic markup and modern structure
- **CSS3** - Advanced styling with glassmorphism
- **JavaScript ES6+** - Modern, asynchronous functionality
- **Chart.js** - Interactive data visualizations
- **GitHub API** - Dynamic file loading
- **Font Awesome** - Beautiful iconography
- **Google Fonts** - Premium typography

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + F` | Focus search box |
| `Escape` | Clear search / Close modals |
| `Ctrl + Shift + T` | Toggle theme |
| `Ctrl + D` | Download focused file |
| `Ctrl + P` | Preview focused file |
| `Tab` | Navigate through filters |

## 🎨 Customization

### Colors & Branding
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #ff6b35;
    --secondary-color: #f7931e;
    --accent-color: #ffd54f;
    /* ... more variables */
}
```

### Content & Information
Update `index.html` for:
- Site title and meta information
- Hero section content
- University branding
- Footer information

## 📊 Analytics Features

### File Distribution Charts
- Pie chart showing file types
- Bar chart of platform sources
- Polar area chart of categories

### Metrics Dashboard
- Total storage calculation
- Largest file identification
- Most common file type
- Last update timestamp

### Export Capabilities
- JSON data export
- Statistics backup
- File metadata download

## 🔧 Advanced Configuration

### Custom Domain
1. Add `CNAME` file with your domain
2. Update DNS settings
3. Enable HTTPS in GitHub Pages

### Google Analytics
Add tracking code to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

### PWA Setup
The site includes:
- Service worker ready
- Manifest file support
- Offline capabilities
- App-like experience

## 🐛 Troubleshooting

### Files Not Loading
- Verify GitHub username and repository name
- Check if files are in `/uploads` directory
- Ensure repository is public

### Online Links Issues
- Verify file permissions (public access required)
- Check link format in `online-links.txt`
- Test links directly in browser

### Performance Issues
- Optimize file sizes
- Reduce number of simultaneous requests
- Use CDN for external resources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sifat** - [GitHub](https://github.com/siifat)

Built with ❤️ for United International University

## 🙏 Acknowledgments

- Chart.js for beautiful data visualizations
- Font Awesome for comprehensive iconography
- Google Fonts for premium typography
- GitHub for free hosting with GitHub Pages

---

⭐ **Star this repository if you found it helpful!**

📚 **Perfect for students, researchers, and educators who need a modern way to organize and share study materials.**
