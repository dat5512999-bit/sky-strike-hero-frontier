param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory) { New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null }

$source = [System.Drawing.Bitmap]::FromFile($resolvedInput)
$bitmap = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.DrawImageUnscaled($source, 0, 0)
$graphics.Dispose()
$source.Dispose()

$rectangle = New-Object System.Drawing.Rectangle(0, 0, $bitmap.Width, $bitmap.Height)
$data = $bitmap.LockBits($rectangle, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$byteCount = [Math]::Abs($data.Stride) * $bitmap.Height
$pixels = New-Object byte[] $byteCount
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $pixels, 0, $byteCount)

for ($y = 0; $y -lt $bitmap.Height; $y++) {
  $row = $y * $data.Stride
  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    $offset = $row + $x * 4
    $blue = [int]$pixels[$offset]
    $green = [int]$pixels[$offset + 1]
    $red = [int]$pixels[$offset + 2]
    $distance = [Math]::Sqrt($red * $red + (255 - $green) * (255 - $green) + $blue * $blue)

    $colorMaximum = [Math]::Max($red, $blue)
    if ($green -gt $colorMaximum + 24 -and $distance -lt 150) {
      $alpha = [Math]::Round([Math]::Max(0, [Math]::Min(255, ($distance - 12) * 2.25)))
      if ($alpha -lt 45) { $alpha = 0 }
      $pixels[$offset + 3] = [byte]$alpha
    }
    if ($green -gt $colorMaximum + 24) {
      $decontaminatedGreen = [Math]::Max($blue, [Math]::Round($red * 0.35))
      $pixels[$offset + 1] = [byte][Math]::Min(255, $decontaminatedGreen)
    }
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($pixels, 0, $data.Scan0, $byteCount)
$bitmap.UnlockBits($data)
$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

Write-Output $OutputPath
