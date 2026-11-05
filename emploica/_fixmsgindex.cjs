const fs=require('fs');
const p='src/features/messaging/index.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace('export { useConversations, useMessages } from "./hooks/useConversations";',
            'export { useConversations } from "./hooks/useConversations";\nexport { useMessages } from "./hooks/useMessages";');
fs.writeFileSync(p,s,'utf8');
console.log(fs.readFileSync(p,'utf8'));
