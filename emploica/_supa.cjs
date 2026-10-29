const fs=require('fs');
const path=require('path');
function walk(d){let r=[];for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())r=r.concat(walk(p));else r.push(p);}return r;}
const files=walk('src').filter(f=>/\.(ts|tsx)$/.test(f));
for(const f of files){
  const s=fs.readFileSync(f,'utf8');
  const lines=s.split(/\r?\n/);
  lines.forEach((l,i)=>{
    if(/supabase\.from\((['"])(offers|applications|transactions)\1\)\.(insert|update)/.test(l)) console.log(f+':'+(i+1)+': '+l.trim());
  });
}
console.log('done');
