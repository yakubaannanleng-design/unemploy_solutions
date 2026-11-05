const fs=require('fs');
const reps=[
 ['src/features/jobs/types.ts','export type { Offer } from "@/types";'],
 ['src/features/messaging/types.ts','export type { Conversation, Message } from "@/types";'],
 ['src/features/notifications/types.ts','export type { Notification } from "@/types";'],
];
for(const [p,ins] of reps){
  let s=fs.readFileSync(p,'utf8');
  s=s.replace('export {};', ins);
  fs.writeFileSync(p,s,'utf8');
}
console.log('done');
