$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms

$agentDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$launcherPath = Join-Path $agentDir "windows-app\LloydPrintControl.vbs"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Lloyd Print Control.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$launcherPath`""
$shortcut.WorkingDirectory = $agentDir
$shortcut.WindowStyle = 7
$shortcut.Description = "Start and stop the Lloyd Orders print agent"
$shortcut.IconLocation = "$env:SystemRoot\System32\imageres.dll,109"
$shortcut.Save()

[System.Windows.Forms.MessageBox]::Show("Desktop shortcut created: Lloyd Print Control", "Lloyd Orders") | Out-Null
