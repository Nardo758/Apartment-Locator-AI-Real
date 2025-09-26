param(
    [string]$GeneratedPath = 'supabase/types.generated.ts'
)

if (-not (Test-Path $GeneratedPath)) {
    Write-Error "Generated file not found: $GeneratedPath"
    exit 2
}

$dest = 'supabase/types.ts'
Copy-Item -Path $GeneratedPath -Destination $dest -Force
git add $dest
git commit -m "chore(types): integrate generated Supabase Database types"
git push -u origin HEAD

Write-Host "Integrated generated types into $dest and pushed branch"
