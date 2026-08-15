const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

const files = walkSync('src').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Specifically replace fetch(`/api/ with fetch(`${import.meta.env.VITE_API_URL || ''}/api/
  let newContent = content.replace(/fetch\(`\/api\//g, 'fetch(`${import.meta.env.VITE_API_URL || \'\'}/api/');
  
  if (file.endsWith('geminiService.js')) {
     // Gemeni service needs a slightly different fix because we broke its fallback URL logic previously.
     newContent = newContent.replace(/const apiUrl = "";/g, "const apiUrl = import.meta.env.VITE_API_URL || '';");
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Restored URLs in ' + file);
  }
});
