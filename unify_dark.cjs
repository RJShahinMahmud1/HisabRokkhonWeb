const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.tsx')) {
      const p = path.join(dir, file);
      let pContent = fs.readFileSync(p, 'utf8');
      
      // Fix instances where dark:text-white is placed before text-slate-800
      let modified = false;
      const newContent = pContent.replace(/dark:text-white([ a-zA-Z0-9\/\-\:]+)text-slate-800/g, (match, middle) => {
        modified = true;
        return `text-slate-800${middle}dark:text-white`;
      });
      
      if (modified) {
        fs.writeFileSync(p, newContent, 'utf8');
      }
    } else if (fs.statSync(path.join(dir, file)).isDirectory()) {
      processDir(path.join(dir, file));
    }
  }
}

processDir(path.join(__dirname, 'src'));
