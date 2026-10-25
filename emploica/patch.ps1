$files = @("Header.tsx","SeekerHome.tsx","EmployerHome.tsx","AdminPanel.tsx","OffersView.tsx","MessagesView.tsx","ProfileView.tsx","Messaging.tsx","OfferDetailModal.tsx")
$dir = "F:\Téléchargement\unemploy_solutions\emploica\src\components"
foreach ($f in $files) {
  $p = Join-Path $dir $f
  if (Test-Path $p) {
    $c = Get-Content $p -Raw
    $c = $c -replace 'const \{ state, patch, replace, remove \} = useStore\(\);', "const { state, patch, replace, remove, currentUser } = useStore();"
    $c = $c -replace 'const \{ state, patch, replace \} = useStore\(\);', "const { state, patch, replace, currentUser } = useStore();"
    $c = $c -replace 'const \{ state, patch \} = useStore\(\);', "const { state, patch, currentUser } = useStore();"
    $c = $c -replace 'const \{ state, update, patch, replace, remove \} = useStore\(\);', "const { state, update, patch, replace, remove, currentUser } = useStore();"
    $c = $c -replace 'const \{ state, update, patch \} = useStore\(\);', "const { state, update, patch, currentUser } = useStore();"
    $c = $c -replace 'const \{ state, update, replace \} = useStore\(\);', "const { state, update, replace, currentUser } = useStore();"
    $c = $c -replace 'const \{ state, update \} = useStore\(\);', "const { state, update, currentUser } = useStore();"
    $c = $c -replace 'const \{ state \} = useStore\(\);', "const { state, currentUser } = useStore();"
    $c = $c -replace 'state\.users\[0\]', 'currentUser'
    $c = $c -replace 'state\.users\.find\(\(u\) => u\.id === state\.users\[0\]\.id\)', 'state.users.find((u) => u.id === currentUser.id)'
    Set-Content $p $c
    Write-Output "patched $f"
  }
}