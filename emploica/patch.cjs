const fs = require("fs");
const path = require("path");
const dir = "F:\\Téléchargement\\unemploy_solutions\\emploica\\src\\components";
const files = ["Header.tsx","SeekerHome.tsx","EmployerHome.tsx","AdminPanel.tsx","OffersView.tsx","MessagesView.tsx","ProfileView.tsx","Messaging.tsx","OfferDetailModal.tsx"];
for (const f of files) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) continue;
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(/const \{ state, patch, replace, remove \} = useStore\(\);/g, "const { state, patch, replace, remove, currentUser } = useStore();");
  c = c.replace(/const \{ state, patch, replace \} = useStore\(\);/g, "const { state, patch, replace, currentUser } = useStore();");
  c = c.replace(/const \{ state, patch \} = useStore\(\);/g, "const { state, patch, currentUser } = useStore();");
  c = c.replace(/const \{ state, update, patch, replace, remove \} = useStore\(\);/g, "const { state, update, patch, replace, remove, currentUser } = useStore();");
  c = c.replace(/const \{ state, update, patch \} = useStore\(\);/g, "const { state, update, patch, currentUser } = useStore();");
  c = c.replace(/const \{ state, update, replace \} = useStore\(\);/g, "const { state, update, replace, currentUser } = useStore();");
  c = c.replace(/const \{ state, update \} = useStore\(\);/g, "const { state, update, currentUser } = useStore();");
  c = c.replace(/const \{ state \} = useStore\(\);/g, "const { state, currentUser } = useStore();");
  c = c.replace(/state\.users\[0\]/g, "currentUser");
  c = c.replace(/state\.users\.find\(\(u\) => u\.id === state\.users\[0\]\.id\)/g, "state.users.find((u) => u.id === currentUser.id)");
  fs.writeFileSync(p, c);
  console.log("patched", f);
}