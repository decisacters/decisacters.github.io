/* function Expand-Epub {
  param (
      $Source,
      $Destination
  )
  Copy-Item $Source "$Destination.zip"
  Expand-Archive "$Destination.zip" $Destination
  Remove-Item "$Destination.zip"
}
$html = ""
(Get-ChildItem "$HOME\Downloads\ETS\GRE\*.epub").ForEach{
  $folder = "C:\github\temp\ebooks"
  $dir = $_.BaseName -replace "\.", " "
  if (!(Test-Path "$folder\$dir")) {
      Write-Host $dir
      Expand-Epub $_.FullName "$folder\$dir"
  }
} */

// https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1
const node = require('./node.js');
const dir = `${node.os.homedir}/Downloads/ETS/GRE/`;
const ebooks = `c:/github/temp/ebooks`;
fs.readdirSync(dir).forEach((file) => {
  if (!file.match(/epub/)) return;

  const folder = path.join(
      ebooks,
      file.replace(/\.epub/, '').replace(/\./g, ' '));
  if (!fs.existsSync(folder)) {
    const zip = path.join(ebooks, file.replace(/\.epub/g, '.zip'));
    fs.copyFileSync(path.join(dir, file), zip);
    node.cp.exec(
        'powershell.exe', [`-command "Get-History"`],
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });// Expand-Archive ${zip} ${folder}"`])
    // fs.unlinkSync(zip)
  }
});
