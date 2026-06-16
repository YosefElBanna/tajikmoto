const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /#1a1a20/gi, to: '#f8f7f4' },
  { from: /#222229/gi, to: '#ffffff' },
  { from: /#2b2b33/gi, to: '#f0eee9' },
  { from: /#3a3a44/gi, to: '#e4e4e1' },
  { from: /#4a4a55/gi, to: '#d4d4d0' },
  { from: /#f5f4ef/gi, to: '#1c1c21' },
  { from: /#bcbcc8/gi, to: '#4a4a52' },
  { from: /#9494a0/gi, to: '#71717a' },
  { from: /#e8c27a/gi, to: '#c89f55' },
  { from: /#c9a55a/gi, to: '#b08b49' }
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
console.log('Refactoring complete!');
