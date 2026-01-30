const fs = require('fs');
const path = require('path');

function getAllMarkdownFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (item.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const folder = path.basename(path.dirname(fullPath));
      files.push({
        path: `Markdown/${relativePath}`,
        folder: folder
      });
    }
  });
  
  return files;
}

const markdownFiles = getAllMarkdownFiles('./Markdown');
const manifest = {
  files: markdownFiles
};

fs.writeFileSync('./Markdown/files.json', JSON.stringify(manifest, null, 2));
console.log(`Generated files.json with ${markdownFiles.length} files`);
