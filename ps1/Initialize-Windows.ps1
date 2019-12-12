
function Install-Programs {

  # https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-logicaldisk
  $PCFlag = (Get-CimInstance Win32_LogicalDisk).Size[0] / (2 -shl 29) -gt 60

  # https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-videocontroller
  $GPUFlag = ((Get-CimInstance Win32_VideoController).Name -join "\n") -match "nvidia"

  #region Install Chocolatey
  # https://docs.microsoft.com/en-us/dotnet/api/system.net.webclient.downloadstring
  if ($env:Path -notmatch "chocolatey") {
    $WebClient = New-Object System.Net.WebClient
    $Uri = 'https://chocolatey.org/install.ps1'
    Invoke-Expression ($WebClient.DownloadString($Uri))
  }
  #endregion

  $programs = "git", "nodejs", "7zip", "googlechrome", "vscode"
  if ($GPUFlag) { $programs += "nvidia-display-driver", "steam" }
  if ($PCFlag) {
    $programs += "utorrent", "teamviewer", "vlc", "vmware-workstation-player"#, "firefox", "icloud", "dotnetcore", "anaconda3"
  }
  # https://code.visualstudio.com/docs/?dv=win64 
  $offlineInstallers = "vscode", ""

  $programs.ForEach{
    $program = $_
    if ($program -match "7zip") {
      $path = $program -replace "7", "7-"
    } elseif ($program -match "googlechrome") {
      $path = $program -replace "google", "google\"
    } elseif ($program -match "vscode") {
      $path = $program -replace "vs", "vs "
    } elseif ($program -match "vmware") {
      $path = $program -replace "-.*"
    } else {
      $path = $program
    }
    
    if ($env:Path -match $path) {

      if ($program -match "vscode") {
      
        #region Install Extensions
        $extensions = "akamud.vscode-theme-onedark", "akamud.vscode-theme-onelight", "dbaeumer.vscode-eslint", "donjayamanne.jquerysnippets", "eamodio.gitlens", "HookyQR.beautify", "ms-vscode.powershell", "msjsdiag.debugger-for-chrome", "PKief.material-icon-theme"
        $installedExtensions = code.cmd --list-extensions
        $extensions.ForEach{
          $extension = $_
          if (!($installedExtensions -match $extension)) {
            Write-Host "Installing $_..."
            code.cmd --install-extension $extension
          }
        }
        #endregion

        #region Change Settings
        $settings = '{
                    "breadcrumbs.enabled": true,
                    "editor.wordWrap": "on",
                    "editor.tabSize": 2,
                    "files.autoSave": "afterDelay",
                    "html.format.wrapLineLength": 0,
                    "workbench.iconTheme": "material-icon-theme",
                    "workbench.colorTheme": "Atom One Light",
                    "[javascript]": {
                        "editor.defaultFormatter": "vscode.typescript-language-features"
                    },
                    "[html]": {
                        "editor.defaultFormatter": "vscode.html-language-features"
                    },
                    "git.enableSmartCommit": true,
                    "git.autofetch": true
                  }'
        Set-Content "$env:APPDATA\Code\User\settings.json" $settings
        #endregion
      
        code.cmd "C:\GitHub"
      }
      elseif ($program -match "git") {
        $user = "decisacter"
        git.exe config --global user.email "$user-@example.com"
        git.exe config --global user.name $user

        $cwd = "C:/GitHub"
        ("", "temp").ForEach{
          

          $repo = "$cwd/$_"
          if (!(Test-Path $repo)) { New-Item $repo -ItemType Directory }
          Set-Location $repo
      
          if (!(Test-Path "$repo\.git")) { git.exe init }
          if (!(git.exe remote)) {
            $git = if ($_) { $_ } else { "$user.github.io" }
            git.exe remote add origin "https://github.com/$user/$git.git"
          }
          git.exe pull origin master
        }
        if (!(Test-Path "C:\GitHub\index.js")) { Copy-Item C:\GitHub\temp\archive\js\index.js C:\ }
      }
      elseif ($program -match "nodejs") {
        $packages = "cheerio", "puppeteer", "request", "eslint"
        if ($PCFlag) {
          $packages += "jimp", "tesseract.js"
        }
        $dependencies = (npm ls -g -json | ConvertFrom-Json).dependencies
        $packages.forEach{
          if (!$dependencies -or ($dependencies | Get-Member -MemberType NoteProperty).Name -notmatch $package) {
            $package = $_
            Write-Host $package
            npm.cmd i $package -g
          }
        }
      }
    }
    else {
      # install offline for installer with low download speed
      
      if (!(Get-ChildItem "$env:Tmp\*$path") -and 
      !(Get-ChildItem "$env:ProgramFiles\*$path") -and 
      !(Get-ChildItem "$env:ProgramFiles (x86)\*$path") -and 
      !(Get-ChildItem "$env:LOCALAPPDATA\*$path") -and 
      !(Get-ChildItem "$env:APPDATA\*$path")) {
        if ($offlineInstallers -match $program) {
          $installer = Get-ChildItem "$HOME\Downloads\*$program*.exe"
          if ($installer) {
            Copy-Item $installer "$env:TEMP\chocolatey\$program"
          }
        }
        Write-Host $program
        cinst.exe $program -y # yes
      }
      
    }
  }
}

function Edit-Settings {

  <#
  .NOTES To do Uninstall Apps

  .NOTES https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_comment_based_help?view=powershell-6#comment-based-help-keywords
  #>

  # https://docs.microsoft.com/en-us/powershell/module/international/set-winsystemlocale?view=win10-ps
  Set-WinSystemLocale en-US

  # https://docs.microsoft.com/en-us/powershell/module/international/set-winuilanguageoverride?view=win10-ps
  Set-WinUILanguageOverride en-US

  # https://docs.microsoft.com/en-us/powershell/module/international/set-winhomelocation?view=win10-ps
  # https://docs.microsoft.com/en-us/windows/win32/intl/table-of-geographical-locations
  Set-WinHomeLocation 244 # United States

  # Get-ItemProperty $key
  $key = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
  Set-ItemProperty $key Hidden 1
  Set-ItemProperty $key HideFileExt 0
  Set-ItemProperty $key ShowSuperHidden 1

  $path = 'HKCU:\Software\Microsoft\Input\Settings'
  ('EnableHwkbTextPrediction', 'EnableHwkbAutocorrection').ForEach{
    if (!(Test-Path $path)) {
      $name = $_
      New-Itemproperty $path $name -Value '1' -PropertyType DWORD
    }
  }

  # remove chinese item from recent
  (Get-ChildItem $env:APPDATA\Microsoft\Windows\Recent\* -File).forEach{
    # https://docs.microsoft.com/en-us/dotnet/standard/base-types/character-classes-in-regular-expressions#supported-unicode-general-categories
    if ($_.Name -match "\p{IsCJKUnifiedIdeographs}") {
      Remove-Item $_
    }
  }

  # https://www.tenforums.com/tutorials/3123-clsid-key-guid-shortcuts-list-windows-10-a.html
  # Applications 4234d49b-0245-4df3-b780-3893943456e1
  # Quick Acess 679f85cb-0220-4080-b29b-5540cc05aab6

  $shell = (New-Object -Com Shell.Application)

  <#
  .Link
  https://docs.microsoft.com/en-us/windows/win32/shell/shell-namespace return folder

  .PARAMETER QuickAcessItems
  .LINK
  https://docs.microsoft.com/en-us/windows/win32/shell/folder-items return FolderItems

  .LINK
  https://docs.microsoft.com/en-us/windows/win32/shell/folderitems
  #>
  $QuickAcessItems = $shell.NameSpace("shell:::{679f85cb-0220-4080-b29b-5540cc05aab6}").Items()

  for ($i = 0; $i -lt $QuickAcessItems.Count; $i++) {
    <#
    .Link
    https://docs.microsoft.com/en-us/windows/win32/shell/folderitems-item return FolderItem

    .LINK
    https://docs.microsoft.com/en-us/windows/win32/shell/folderitem
    #>
    if ($QuickAcessItems.Item($i).Name -match "\p{IsCJKUnifiedIdeographs}") {
      <#
      .LINK
      https://docs.microsoft.com/en-us/windows/win32/shell/folderitem-InvokeVerb
      #>
      $QuickAcessItems.Item($i).InvokeVerb("remove")
    }
  }
  #

  if (Test-Path "C:\GitHub") {
    $shell.Namespace("C:\GitHub").Self.InvokeVerb("pintohome")
  }
}

Install-Programs
Edit-Settings