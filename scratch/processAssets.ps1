Add-Type -AssemblyName System.Drawing

# Create directories
New-Item -ItemType Directory -Force -Path "d:\RM_Tanzania\public\images\brand"
New-Item -ItemType Directory -Force -Path "d:\RM_Tanzania\public\images\products"
New-Item -ItemType Directory -Force -Path "d:\RM_Tanzania\public\images\lifestyle"

# Copy logo
Copy-Item -Path "D:\RM_Tanzania\RMaroon_logo1.png" -Destination "d:\RM_Tanzania\public\images\brand\logo.png" -Force

function Resize-Image {
    param (
        [string]$sourcePath,
        [string]$destPath,
        [int]$width,
        [int]$height
    )
    Write-Host "Resizing $sourcePath to $destPath ($width x $height)..."
    try {
        $srcImage = [System.Drawing.Image]::FromFile($sourcePath)
        $destImage = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($destImage)
        
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        $graphics.DrawImage($srcImage, 0, 0, $width, $height)
        
        $encoder = [System.Drawing.Imaging.Encoder]::Quality
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, 75)
        
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageDecoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
        
        $destImage.Save($destPath, $codec, $encoderParams)
        
        $graphics.Dispose()
        $destImage.Dispose()
        $srcImage.Dispose()
        Write-Host "  → Done."
    } catch {
        Write-Host "  ✗ Error resizing: $_"
    }
}

# Source folder
$srcDir = "d:\RM_Tanzania\temp_unzip\Highlights"

# Process product images
Resize-Image "$srcDir\ZOZ_2169.JPG" "d:\RM_Tanzania\public\images\products\lemon_tea.jpg" 800 800
Resize-Image "$srcDir\ZOZ_2171.JPG" "d:\RM_Tanzania\public\images\products\digestive_tea.jpg" 800 800
Resize-Image "$srcDir\ZOZ_2172.JPG" "d:\RM_Tanzania\public\images\products\relaxation_tea.jpg" 800 800
Resize-Image "$srcDir\ZOZ_2174.JPG" "d:\RM_Tanzania\public\images\products\soothing_balm.jpg" 800 800
Resize-Image "$srcDir\ZOZ_2176.JPG" "d:\RM_Tanzania\public\images\products\evening_shamba.jpg" 800 800
Resize-Image "$srcDir\ZOZ_2178.JPG" "d:\RM_Tanzania\public\images\products\relaxing_salts.jpg" 800 800

# Process hero image
Resize-Image "$srcDir\ZOZ_2180.JPG" "d:\RM_Tanzania\public\images\lifestyle\hero_banner.jpg" 1600 900
