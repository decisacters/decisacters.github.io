
$repos = if (((Get-CimInstance Win32_VideoController).Name -join "\n") -match "nvidia") {
  "", "temp", "temp/audio", "temp/ebooks", "temp/html"
}
else {
  "", "temp"
}

$repos.ForEach{
  $cwd = "c:/github/$_"
  
  Set-Location $cwd
  Write-Host $cwd
  
  if (!(Test-Path "$repo\.git")) { git.exe init }

  if (!(git.exe remote)) {
    $user = "decisacters"
    $git = if ($_) { $_ } else { "$user.github.io" }
    git.exe remote add origin "https://github.com/$user/$git.git"
  }

  if ((git status) -match "nothing to commit") {
    
    Write-Host "Git Pull $cwd"
    git.exe pull origin master
  }
  else {
    if ($cwd -match "github/$") {
      $msg = Read-Host "Enter commit message"
    }
    
    if (!$msg) {
      $msg = "update"
    }

    Write-Host "Git Push $cwd"
  
    git add .
    git commit -m $msg
    git push -u origin master
  }

}