Add-Type -AssemblyName System.Drawing
( Get-ChildItem "$env:LOCALAPPDATA\Packages\Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\LocalState\Assets").ForEach{
    $root = "$HOME\Pictures\Wallpapers"

    if ($_.Length -gt 100000) {
        $path = "$root\$($_.Name).jpg"
        Copy-Item $_.FullName $path -Force
        $image = New-Object System.Drawing.Bitmap($path)
        if ($image.Width -gt $image.Height) {
            Copy-Item $_.FullName "$root\Desktop\$($_.BaseName).jpg" -Force
        }
        else {
            Copy-Item $_.FullName "$root\Cellphone\$($_.BaseName).jpg" -Force
        }
        $image.Dispose()
        Remove-Item $path -Force
    }
}

