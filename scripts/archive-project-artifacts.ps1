param(
  [ValidateSet('Plan','Archive','Verify','Restore')][string]$Mode = 'Plan',
  [string]$Target = ''
)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$artifactRoot = Join-Path $projectRoot 'artifacts'
$recordRoot = Join-Path $artifactRoot 'storage-cleanup-20261007'
$manifestPath = Join-Path $recordRoot 'archive-manifest.json'
$archiveRoot = [IO.Path]::GetFullPath((Join-Path (Split-Path $projectRoot -Parent) 'HeroFrontier-Archives/2026-10-07'))
$separator = [IO.Path]::DirectorySeparatorChar

function Assert-Inside([string]$Base, [string]$Candidate) {
  $absolute = [IO.Path]::GetFullPath($Candidate)
  if (-not $absolute.StartsWith($Base + $separator, [StringComparison]::OrdinalIgnoreCase)) { throw "路徑不在指定範圍：$absolute" }
  return $absolute
}
function Read-Tree([string]$Directory, [string]$Relative = '') {
  $item = Get-Item -LiteralPath $Directory -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "拒絕搬移連結：$Directory" }
  if ($item.PSIsContainer) {
    foreach ($child in Get-ChildItem -LiteralPath $Directory -Force) {
      $childRelative = if ($Relative) { $Relative + '/' + $child.Name } else { $child.Name }
      Read-Tree $child.FullName $childRelative
    }
  } else {
    # Refuse files that are being written or held open by a running test browser.
    $stream = [IO.File]::Open($Directory, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::None)
    try { $hash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($stream)) }
    finally { $stream.Dispose() }
    [pscustomobject]@{ path=$Relative; bytes=$item.Length; sha256=$hash }
  }
}
function Verify-Tree([string]$Directory, $Expected) {
  $actual = @(Read-Tree $Directory)
  if ($actual.Count -ne @($Expected).Count) { throw "檔案數量已改變：$Directory" }
  $lookup = @{}
  foreach ($row in $actual) { $lookup[$row.path] = $row }
  foreach ($row in $Expected) {
    if (-not $lookup.ContainsKey($row.path) -or $lookup[$row.path].sha256 -ne $row.sha256 -or $lookup[$row.path].bytes -ne $row.bytes) { throw "內容已改變：$Directory / $($row.path)" }
  }
}
if ($archiveRoot.StartsWith($projectRoot + $separator, [StringComparison]::OrdinalIgnoreCase)) { throw '封存位置必須在專案外。' }

if ($Mode -eq 'Plan') {
  if (Test-Path -LiteralPath $manifestPath) { throw '封存清單已存在；請使用 Verify、Archive 或 Restore，勿覆寫原始證據。' }
  Push-Location $projectRoot
  try { $tracked = @(& git ls-files -- artifacts); if ($LASTEXITCODE -ne 0) { throw '無法讀取 Git 檔案清單。' } }
  finally { Pop-Location }
  $extras = @('release-snapshot','map-grid','qa-nature-motion','qa-thunder-td-v061','qa-wave-layout','qa-hero-v0690','design-previews')
  $targets = @()
  foreach ($entry in Get-ChildItem -LiteralPath $artifactRoot -Directory -Force) {
    $relative = 'artifacts/' + $entry.Name
    if ($entry.Name -match 'backup' -or $entry.Name -in $extras -or @($tracked | Where-Object { $_.StartsWith($relative + '/') }).Count) { $targets += $relative }
  }
  $targets += @($tracked | Where-Object { ($_ -split '/').Count -eq 2 })
  $records = @(foreach ($relative in $targets | Sort-Object -Unique) {
    $source = Assert-Inside $artifactRoot (Join-Path $projectRoot $relative)
    $files = @(Read-Tree $source)
    [pscustomobject]@{ path=$relative; files=$files; bytes=($files | Measure-Object bytes -Sum).Sum }
  })
  New-Item -ItemType Directory -Path $recordRoot -Force | Out-Null
  $manifest = [ordered]@{ schema=1; projectRoot=$projectRoot; archiveRoot=$archiveRoot; createdAt=[DateTimeOffset]::Now.ToString('o'); targets=$records }
  $manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestPath -Encoding utf8
  [pscustomobject]@{ mode=$Mode; targets=$records.Count; files=(@($records.files)).Count; bytes=($records | Measure-Object bytes -Sum).Sum; manifest=$manifestPath; archive=$archiveRoot } | ConvertTo-Json
  exit
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.schema -ne 1 -or $manifest.projectRoot -ne $projectRoot -or $manifest.archiveRoot -ne $archiveRoot) { throw '清單與此專案不一致。' }
$records = @($manifest.targets | Where-Object { -not $Target -or $_.path -eq $Target })
if (-not $records.Count) { throw '找不到指定封存項目。' }
foreach ($record in $records) {
  if ($record.path -notmatch '^artifacts/[^/]+$' -or $record.path -match '^artifacts/(map-history|storage-cleanup-|qa-adventure|naga-8d-|evolution-completion)') { throw "拒絕處理受保護的路徑：$($record.path)" }
  $source = Assert-Inside $artifactRoot (Join-Path $projectRoot $record.path)
  $destination = Assert-Inside $archiveRoot (Join-Path $archiveRoot $record.path)
  foreach ($base in @($projectRoot, $artifactRoot, (Split-Path $archiveRoot -Parent), $archiveRoot, (Split-Path $destination -Parent))) {
    if ((Test-Path -LiteralPath $base) -and ((Get-Item -LiteralPath $base -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "父目錄不可為連結：$base" }
  }
  $hasSource = Test-Path -LiteralPath $source
  $hasDestination = Test-Path -LiteralPath $destination
  if ($hasSource -and $hasDestination) { throw "兩處都有資料，拒絕覆寫：$($record.path)" }
  if (-not $hasSource -and -not $hasDestination) { throw "兩處都找不到資料：$($record.path)" }
  Verify-Tree $(if ($hasSource) { $source } else { $destination }) $record.files
}
if ($Mode -eq 'Archive') {
  New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null
  Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $archiveRoot 'archive-manifest.json')
}
foreach ($record in $records) {
  $source = Assert-Inside $artifactRoot (Join-Path $projectRoot $record.path)
  $destination = Assert-Inside $archiveRoot (Join-Path $archiveRoot $record.path)
  if ($Mode -eq 'Archive' -and (Test-Path -LiteralPath $source)) {
    New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
    Move-Item -LiteralPath $source -Destination $destination
    Verify-Tree $destination $record.files
  } elseif ($Mode -eq 'Restore' -and (Test-Path -LiteralPath $destination)) {
    Move-Item -LiteralPath $destination -Destination $source
    Verify-Tree $source $record.files
  }
}
[pscustomobject]@{ mode=$Mode; targets=$records.Count; files=(@($records.files)).Count; bytes=($records | Measure-Object bytes -Sum).Sum; archive=$archiveRoot; verified=$true } | ConvertTo-Json
