Add-Type -AssemblyName System.Drawing
$src = $args[0]
$public = $args[1]
New-Item -ItemType Directory -Force -Path $public | Out-Null
$img = [System.Drawing.Image]::FromFile($src)

function Save-Png($image, $size, $path, $punchBlack) {
  $fmt = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  $bmp = New-Object System.Drawing.Bitmap $size, $size, $fmt
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($image, 0, 0, $size, $size)
  $g.Dispose()
  if ($punchBlack) {
    for ($y = 0; $y -lt $size; $y++) {
      for ($x = 0; $x -lt $size; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 18 -and $c.G -lt 18 -and $c.B -lt 28) {
          $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
      }
    }
  }
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Copy-Item -LiteralPath $src -Destination (Join-Path $public 'logo.png') -Force
Save-Png $img 512 (Join-Path $public 'icon-512.png') $true
Save-Png $img 192 (Join-Path $public 'icon-192.png') $true
Save-Png $img 180 (Join-Path $public 'apple-touch-icon.png') $true
Save-Png $img 48 (Join-Path $public 'favicon-48.png') $true
Save-Png $img 32 (Join-Path $public 'favicon-32.png') $true
Save-Png $img 16 (Join-Path $public 'favicon-16.png') $true
$img.Dispose()
Write-Output 'icons-ok'
