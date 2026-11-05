const fs=require('fs');
const reps=[
 ['src/features/auth/index.ts','export { useUsers } from "./hooks/useUsers";\n'],
 ['src/features/jobs/index.ts','export { useOffers } from "./hooks/useOffers";\n'],
 ['src/features/messaging/index.ts','export { useConversations, useMessages } from "./hooks/useConversations";\n'], // placeholder, but useMessages is separate file
 ['src/features/notifications/index.ts','export { useNotifications } from "./hooks/useNotifications";\n'],
 ['src/features/admin/index.ts','export { useSignalements } from "./hooks/useSignalements";\n'],
 ['src/features/dashboard/index.ts','export { useTransactions } from "./hooks/useTransactions";\n'],
];
for(const [p,ins] of reps){
  let s=fs.readFileSync(p,'utf8');
  if(!s.includes(ins.trim())) s += ins;
  fs.writeFileSync(p,s,'utf8');
}
console.log('done');
