const fs=require('fs');
const p='src/features/jobs/index.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace('FlashOffersView";export','FlashOffersView";\nexport');
fs.writeFileSync(p,s,'utf8');
console.log('done');
