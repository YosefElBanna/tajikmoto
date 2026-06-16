const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /#0c0c0e/gi, to: '#f8f7f4' },
  { from: /#161618/gi, to: '#ffffff' },
  { from: /#1e1e22/gi, to: '#f0eee9' },
  { from: /#2a2a30/gi, to: '#e4e4e1' },
  { from: /#3a3a42/gi, to: '#d4d4d0' },
  { from: /#f0eee6/gi, to: '#1c1c21' },
  { from: /#b0b0bc/gi, to: '#4a4a52' },
  { from: /#8a8a96/gi, to: '#71717a' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { from, to } of replacements) {
        content = content.replace(from, to);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Phase 2 Refactoring complete!');
