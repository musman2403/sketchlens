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
  let newContent = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}/g, '');
  newContent = newContent.replace(/import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'/g, '""');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
