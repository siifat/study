# Study Notes Website Configuration

## Quick Setup Guide

Welcome to your advanced study notes website! Follow these steps to get started:

### 1. Update GitHub Configuration

Edit the `script.js` file and update these values:

```javascript
const CONFIG = {
    GITHUB_USER: 'your-username',     // Replace with your GitHub username
    GITHUB_REPO: 'your-repo-name',    // Replace with your repository name
    GITHUB_BRANCH: 'main',            // Usually 'main' or 'master'
    NOTE_FOLDERS: ['uploads'],        // Folders to scan (keep as 'uploads')
    // ... other settings
};
```

### 2. Repository Setup

1. Create a new repository on GitHub
2. Upload your files to the `/uploads` directory
3. Enable GitHub Pages in repository settings
4. Your website will be available at: `https://your-username.github.io/your-repo-name`

### 3. File Organization

#### Local Files
Place your study materials in the `/uploads` directory:
- `uploads/your-notes.pdf`
- `uploads/study-guide.md`
- `uploads/lecture-slides.txt`

#### Online Links
Add links to cloud files in `uploads/online-links.txt`:

```
Computer Science Notes - https://drive.google.com/file/d/your-file-id/view
Math Tutorial - https://onedrive.live.com/view.aspx?resid=your-file-id
Programming Guide - https://www.dropbox.com/s/your-file/guide.pdf
```

### 4. Supported File Types

- **PDFs**: `.pdf` files with download and preview
- **Markdown**: `.md`, `.markdown` files with formatted display
- **Text**: `.txt` files with simple preview
- **Online**: Google Drive, OneDrive, Dropbox, SharePoint links

### 5. Features

- 🔍 **Smart Search**: AI-powered search with suggestions
- 🎨 **Theme Toggle**: Dark/Light mode support
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 🗂️ **File Organization**: Automatic categorization and filtering
- ☁️ **Cloud Integration**: Direct preview of online files
- 📊 **Analytics Dashboard**: Track your study materials
- 🚀 **Drag & Drop**: Local file preview (no upload)

### 6. Customization

#### Colors & Branding
Edit `styles.css` to customize:
- Primary colors (UIU Orange theme included)
- Typography and fonts
- Spacing and layout
- Animations and effects

#### Content
Update `index.html` to modify:
- Site title and description
- Hero section content
- Footer information
- Meta tags for SEO

### 7. GitHub Pages Deployment

1. Go to your repository settings
2. Scroll to "Pages" section
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Save and wait for deployment

Your site will be live at: `https://your-username.github.io/your-repo-name`

### 8. Advanced Configuration

#### Custom Domain (Optional)
1. Add a `CNAME` file with your domain
2. Update DNS settings to point to GitHub Pages
3. Enable HTTPS in repository settings

#### Analytics (Optional)
Add Google Analytics tracking code to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 9. Troubleshooting

#### Files Not Loading
- Check GitHub username and repository name in `script.js`
- Ensure files are in the `/uploads` directory
- Verify repository is public or GitHub Pages is enabled

#### Online Links Not Working
- Check file permissions (must be publicly accessible)
- Verify link format in `online-links.txt`
- Test links directly in browser

#### Styling Issues
- Clear browser cache
- Check for CSS syntax errors
- Verify file paths are correct

### 10. Contributing

This website template is open for improvements:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Share feedback

---

**Version**: 2.0  
**Last Updated**: December 2024  
**License**: MIT  

For more help, check the README.md file or create an issue in the repository.
