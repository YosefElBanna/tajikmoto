const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  const replacements = [
    { from: /bg-\[#0c0c0e\]/g, to: 'bg-background' },
    { from: /bg-\[#161618\]/g, to: 'bg-surface' },
    { from: /bg-\[#1e1e22\]/g, to: 'bg-surface-light' },
    { from: /border-\[#2a2a30\]/g, to: 'border-border' },
    { from: /border-\[#3a3a42\]/g, to: 'border-border-light' },
    { from: /text-\[#f0eee6\]/g, to: 'text-foreground' },
    { from: /text-\[#e8c27a\]/g, to: 'text-accent' },
    { from: /text-\[#c9a55a\]/g, to: 'text-accent-muted' },
    { from: /text-\[#8a8a96\]/g, to: 'text-text-muted' },
    { from: /text-\[#b0b0bc\]/g, to: 'text-text-secondary' },

    { from: /hover:bg-\[#0c0c0e\]/g, to: 'hover:bg-background' },
    { from: /hover:bg-\[#161618\]/g, to: 'hover:bg-surface' },
    { from: /hover:bg-\[#1e1e22\]/g, to: 'hover:bg-surface-light' },
    { from: /hover:bg-\[#e8c27a\]/g, to: 'hover:bg-accent' },
    { from: /hover:bg-\[#c9a55a\]/g, to: 'hover:bg-accent-muted' },
    
    { from: /hover:border-\[#2a2a30\]/g, to: 'hover:border-border' },
    { from: /hover:border-\[#3a3a42\]/g, to: 'hover:border-border-light' },
    
    { from: /hover:text-\[#f0eee6\]/g, to: 'hover:text-foreground' },
    { from: /hover:text-\[#e8c27a\]/g, to: 'hover:text-accent' },
    { from: /hover:text-\[#c9a55a\]/g, to: 'hover:text-accent-muted' },
    { from: /hover:text-\[#b0b0bc\]/g, to: 'hover:text-text-secondary' },

    { from: /focus:border-\[#e8c27a\]/g, to: 'focus:border-accent' },
    { from: /focus:ring-\[#e8c27a\]/g, to: 'focus:ring-accent' },
    
    { from: /shadow-\[#e8c27a\]/g, to: 'shadow-accent' },
    
    { from: /from-\[#0c0c0e\]/g, to: 'from-background' },
    { from: /via-\[#0c0c0e\]/g, to: 'via-background' },
    { from: /to-\[#0c0c0e\]/g, to: 'to-background' },
    { from: /from-\[#161618\]/g, to: 'from-surface' },
    { from: /via-\[#161618\]/g, to: 'via-surface' },
    { from: /to-\[#161618\]/g, to: 'to-surface' },

    { from: /group-hover:text-\[#f0eee6\]/g, to: 'group-hover:text-foreground' },
    { from: /group-hover:text-\[#b0b0bc\]/g, to: 'group-hover:text-text-secondary' },
    { from: /group-hover:bg-\[#e8c27a\]/g, to: 'group-hover:bg-accent' },
    { from: /group-hover\/btn:bg-\[#e8c27a\]/g, to: 'group-hover/btn:bg-accent' }
  ];

  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });

  // Handle any remaining hex codes manually using string replace if needed, but the above covers all tailwind classes
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Updated ' + file);
  }
});
console.log('Total files updated: ' + changedFiles);
