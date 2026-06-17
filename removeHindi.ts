import fs from 'fs';
import path from 'path';

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // regex to match `lang === 'hi' ? 'something' : `
      const pattern = /lang\s*===\s*'hi'\s*\?\s*(`[^`]*`|'[^']*'|"[^"]*"|[^:]*)\s*:\s*/g;
      
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./src');
