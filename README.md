# Study Notes Repository

A simple, clean website for hosting and sharing PDF notes and markdown files. Built for GitHub Pages deployment with automatic file detection and search functionality.

## 🌟 Features

- **Automatic File Detection**: Scans your repository for PDF and markdown files
- **Real-time Search**: Search through all your notes by filename or path
- **File Type Filtering**: Filter by All files, PDFs only, or Markdown only
- **Download & View**: Direct links to download or view files on GitHub
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with file statistics
- **Zero Configuration**: Just add your files and deploy

## 🚀 Quick Start

### 1. Setup Repository

1. Fork or clone this repository
2. Update the configuration in `script.js`:
   ```javascript
   const CONFIG = {
       GITHUB_USER: 'your-username',     // Your GitHub username
       GITHUB_REPO: 'your-repo-name',    // Your repository name
       GITHUB_BRANCH: 'main',            // Usually 'main' or 'master'
       // ... rest of config
   };
   ```

### 2. Add Your Notes

Organize your files in these directories:
- `pdfs/` - For PDF documents
- `markdown/` - For markdown files (.md, .markdown)
- `notes/` - For mixed content

You can also create subdirectories for better organization:
```
pdfs/
├── mathematics/
│   ├── calculus.pdf
│   └── algebra.pdf
├── physics/
│   └── mechanics.pdf
└── programming/
    └── javascript-guide.pdf
```

### 3. Deploy to GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

Your website will be available at: `https://your-username.github.io/your-repo-name`

## 📁 Project Structure

```
study-website/
├── index.html          # Main website page
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── notes/              # General notes directory
├── pdfs/               # PDF files directory
├── markdown/           # Markdown files directory
└── README.md           # This file
```

## 🎨 Customization

### Changing Colors/Theme
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... other variables */
}
```

### Adding File Types
Update the `ALLOWED_EXTENSIONS` array in `script.js`:
```javascript
ALLOWED_EXTENSIONS: ['.pdf', '.md', '.markdown', '.txt', '.docx']
```

### Changing Scan Directories
Modify the `NOTE_FOLDERS` array in `script.js`:
```javascript
NOTE_FOLDERS: ['documents', 'files', 'resources', '']
```

## 🔧 Configuration Options

### `script.js` Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `GITHUB_USER` | Your GitHub username | `'your-username'` |
| `GITHUB_REPO` | Repository name | `'your-repo-name'` |
| `GITHUB_BRANCH` | Branch to scan | `'main'` |
| `NOTE_FOLDERS` | Directories to scan | `['notes', 'pdfs', 'markdown', '']` |
| `ALLOWED_EXTENSIONS` | File types to include | `['.pdf', '.md', '.markdown']` |

## 💡 Usage Tips

1. **File Naming**: Use descriptive names without special characters
   - ✅ `linear-algebra-notes.pdf`
   - ❌ `Notes (Final) #1.pdf`

2. **Organization**: Group related files in subdirectories
   - `pdfs/mathematics/`
   - `pdfs/computer-science/`
   - `markdown/tutorials/`

3. **Search**: The search function looks through:
   - File names
   - File paths
   - Directory names

4. **Performance**: The website works best with repositories under 1000 files

## 🛠️ Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **API**: Uses GitHub's public API for file discovery
- **Hosting**: Designed for GitHub Pages static hosting
- **Responsive**: CSS Grid and Flexbox for modern layouts
- **Icons**: Font Awesome for professional icons

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Demo

See a live example at: [Demo Site](https://your-username.github.io/study-website)

## 🐛 Troubleshooting

### Files Not Loading
1. Check that `GITHUB_USER` and `GITHUB_REPO` are correct
2. Ensure your repository is public
3. Verify files are in the specified directories

### Search Not Working
1. Clear browser cache
2. Check browser console for errors
3. Ensure JavaScript is enabled

### Styling Issues
1. Check that `styles.css` is loading properly
2. Verify Font Awesome CDN is accessible
3. Test in different browsers

---

Built with ❤️ for students and educators who want to share knowledge easily.
