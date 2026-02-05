# PowerShell script to replace color #BF124D with #E85A6B
$oldColor = "#BF124D"
$newColor = "#E85A6B"
$srcPath = "src"

$files = Get-ChildItem -Path $srcPath -Recurse -Include *.tsx,*.ts,*.jsx,*.js,*.css

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace the color
    $content = $content -replace [regex]::Escape($oldColor), $newColor
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        
        # Count replacements
        $matches = ([regex]::Matches($originalContent, [regex]::Escape($oldColor))).Count
        $totalReplacements += $matches
        
        Write-Host "Updated: $($file.FullName) ($matches replacements)"
    }
}

Write-Host "`nColor replacement complete!"
Write-Host "Files updated: $totalFiles"
Write-Host "Total replacements: $totalReplacements"
Write-Host "Old color: $oldColor"
Write-Host "New color: $newColor"
