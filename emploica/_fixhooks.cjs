const fs=require('fs');
const files=[
 'src/features/auth/hooks/useUsers.ts',
 'src/features/jobs/hooks/useOffers.ts',
 'src/features/messaging/hooks/useConversations.ts',
 'src/features/messaging/hooks/useMessages.ts',
 'src/features/notifications/hooks/useNotifications.ts',
 'src/features/admin/hooks/useSignalements.ts',
 'src/features/dashboard/hooks/useTransactions.ts',
];
for(const f of files){
  let s=fs.readFileSync(f,'utf8');
  s=s.replace(/from "\.\.\/lib\/supabase"/g, 'from "@/lib/supabase"');
  fs.writeFileSync(f,s,'utf8');
}
console.log('done');
