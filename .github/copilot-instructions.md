<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Study Notes Website Instructions

This is a static website project for hosting PDF and markdown notes on GitHub Pages.

## Project Structure

- `index.html` - Main page with search and file listing functionality
- `styles.css` - Modern, responsive CSS styling
- `script.js` - JavaScript for GitHub API integration and search functionality
- `notes/`, `pdfs/`, `markdown/` - Directories for organizing study materials

## Key Features

- Automatically scans GitHub repository for PDF and markdown files
- Real-time search functionality across all files
- Responsive design that works on all devices
- Direct download and view capabilities
- File type filtering (All, PDF, Markdown)
- Clean, modern UI with statistics display

## Configuration

Before deployment, update the configuration in `script.js`:
- Set `GITHUB_USER` to your GitHub username
- Set `GITHUB_REPO` to your repository name
- Adjust `NOTE_FOLDERS` array if using different directory names

## GitHub Pages Deployment

This website is designed to work seamlessly with GitHub Pages static hosting.

## Code Style

- Use modern JavaScript (ES6+) features
- Maintain responsive design principles
- Keep the interface clean and functional
- Prioritize performance and accessibility
