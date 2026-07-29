param(
    [string]$NodeExecutable = 'node'
)

$ErrorActionPreference = 'Stop'

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Package = Get-Content -Raw (Join-Path $ProjectRoot 'package.json') | ConvertFrom-Json
$Version = $Package.version
$ReleaseDir = Join-Path $ProjectRoot 'release'
$StageDir = Join-Path $ReleaseDir 'staging'
$DistDir = Join-Path $ProjectRoot 'dist'

function Invoke-NodeTool {
    param(
        [string]$ToolPath,
        [Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments
    )
    & $NodeExecutable (Join-Path $ProjectRoot $ToolPath) @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$ToolPath $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
}

function Compress-DirectoryContents {
    param([string]$Source, [string]$Destination)
    Compress-Archive -Path (Join-Path $Source '*') -DestinationPath $Destination -CompressionLevel Optimal
}

if (Test-Path -LiteralPath $ReleaseDir) {
    $ResolvedReleaseDir = (Resolve-Path -LiteralPath $ReleaseDir).Path
    if (-not $ResolvedReleaseDir.StartsWith($ProjectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove release directory outside the project."
    }
    Remove-Item -LiteralPath $ResolvedReleaseDir -Recurse -Force
}

New-Item -ItemType Directory -Path $ReleaseDir, $StageDir | Out-Null

Push-Location $ProjectRoot
try {
    Invoke-NodeTool 'node_modules/typescript/bin/tsc' --noEmit
    Invoke-NodeTool 'node_modules/vitest/vitest.mjs' run

    Invoke-NodeTool 'node_modules/vite/bin/vite.js' build --mode firefox
    Compress-DirectoryContents $DistDir (Join-Path $ReleaseDir "webtyping-$Version-firefox.zip")

    Invoke-NodeTool 'node_modules/vite/bin/vite.js' build --mode chromium
    Compress-DirectoryContents $DistDir (Join-Path $ReleaseDir "webtyping-$Version-chromium.zip")

    $SourceStage = Join-Path $StageDir "webtyping-$Version-source"
    New-Item -ItemType Directory -Path $SourceStage | Out-Null

    $SourceFiles = @(
        'manifest.json',
        'package.json',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'tsconfig.json',
        'vite.config.ts',
        'README.md',
        'FIREFOX_REVIEW.md',
        'LICENSE',
        'STORE_DISCLOSURES.md'
    )
    $SourceDirectories = @('src', 'public', 'tests', 'docs', 'scripts')

    foreach ($File in $SourceFiles) {
        Copy-Item -LiteralPath (Join-Path $ProjectRoot $File) -Destination $SourceStage
    }
    foreach ($Directory in $SourceDirectories) {
        Copy-Item -LiteralPath (Join-Path $ProjectRoot $Directory) -Destination $SourceStage -Recurse
    }

    Compress-DirectoryContents $SourceStage (Join-Path $ReleaseDir "webtyping-$Version-source.zip")
}
finally {
    Pop-Location
    if (Test-Path -LiteralPath $StageDir) {
        Remove-Item -LiteralPath $StageDir -Recurse -Force
    }
}

Get-ChildItem -LiteralPath $ReleaseDir -Filter '*.zip' | Select-Object Name, Length
