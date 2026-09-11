param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,
  [string]$OutputDirectory = "assets/icons"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$resolvedSource = (Resolve-Path -LiteralPath $SourcePath).Path
$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputDirectory))
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

$source = [System.Drawing.Image]::FromFile($resolvedSource)
try {
  $targets = @(
    @{ Name = "app-icon-1024.png"; Size = 1024 },
    @{ Name = "app-icon-512.png"; Size = 512 },
    @{ Name = "app-icon-192.png"; Size = 192 },
    @{ Name = "apple-touch-icon-180.png"; Size = 180 }
  )

  foreach ($target in $targets) {
    $bitmap = New-Object System.Drawing.Bitmap($target.Size, $target.Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $target.Size, $target.Size)
      }
      finally {
        $graphics.Dispose()
      }

      $destination = Join-Path $resolvedOutput $target.Name
      $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
      Write-Output "$($target.Name): $($target.Size)x$($target.Size)"
    }
    finally {
      $bitmap.Dispose()
    }
  }
}
finally {
  $source.Dispose()
}
