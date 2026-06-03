$cocExt = "$env:USERPROFILE\.config\coc\extensions\node_modules\coc-roslyn-vbnet"
$parent = Split-Path $cocExt
if (-not (Test-Path $parent)) { New-Item -ItemType Directory $parent -Force | Out-Null }
if (Test-Path $cocExt) { Remove-Item $cocExt -Force -Recurse }
cmd /c mklink /J "$cocExt" "C:\Users\wfang\Repos\coc-roslyn-vbnet"
Write-Host "Linked: $cocExt"
