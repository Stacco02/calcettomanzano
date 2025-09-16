const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function isTextFile(file){
  // crude: only process common text extensions
  return /(\.(html|htm|css|js|json|md|txt)|\?2025-.*)$/.test(file) || !/\.(png|jpg|jpeg|gif|svg|webp|pdf|ico|zip|gz|mp4|mov|woff2?|ttf|eot)$/i.test(file);
}

function* walk(dir){
  const entries = fs.readdirSync(dir, {withFileTypes:true});
  for(const e of entries){
    const p = path.join(dir, e.name);
    if(e.isDirectory()){
      yield* walk(p);
    } else if(e.isFile()){
      yield p;
    }
  }
}

let changed = 0;
for(const file of walk(ROOT)){
  if(!isTextFile(file)) continue;
  let s = fs.readFileSync(file, 'utf8');
  const before = s;
  // Replace occurrences of ../images/Manzanologo.png
  s = s.replace(/\.\.\/images\/logo_manzano[^'"\)\s>]*/g, '../images/Manzanologo.png');
  // Replace occurrences of images/Manzanologo.png
  s = s.replace(/images\/logo_manzano[^'"\)\s>]*/g, 'images/Manzanologo.png');
  if(s !== before){
    fs.writeFileSync(file, s);
    changed++;
  }
}

console.log('Files updated:', changed);

