function Expand-Epub {
    param (
        $Source,
        $Destination
    )
    Copy-Item $Source "$Destination.zip"
    Expand-Archive "$Destination.zip" $Destination 
    Remove-Item "$Destination.zip"
}

(Get-ChildItem "$HOME\Downloads\ETS\GRE\*.epub").ForEach{
    $folder = "C:\github\temp\ebooks"
    $dir = $_.BaseName -replace "\.", " "
    if (!(Test-Path "$folder\$dir")) {
        Write-Host $dir
        Expand-Epub $_.FullName "$folder\$dir"
    }
}
