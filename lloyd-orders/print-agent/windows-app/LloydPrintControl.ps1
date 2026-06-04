Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$agentDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$envPath = Join-Path $agentDir ".env"
$stateDir = Join-Path $agentDir ".runtime"
$pidPath = Join-Path $stateDir "print-agent.pid"
$logPath = Join-Path $stateDir "print-agent.log"
$testLogPath = Join-Path $stateDir "test-print.log"

New-Item -ItemType Directory -Force -Path $stateDir | Out-Null

function Read-EnvFile {
  $values = @{}
  if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
      if ($_ -match "^\s*([^#=]+)=(.*)$") {
        $values[$matches[1].Trim()] = $matches[2].Trim()
      }
    }
  }
  return $values
}

function Write-EnvFile {
  param(
    [string] $BackendUrl,
    [string] $PrinterName,
    [string] $PollInterval,
    [string] $SumatraPath
  )

  @(
    "BACKEND_URL=$BackendUrl",
    "PRINTER_NAME=$PrinterName",
    "PRINT_POLL_INTERVAL_MS=$PollInterval",
    "SUMATRA_PDF_PATH=$SumatraPath"
  ) | Set-Content -Path $envPath -Encoding UTF8
}

function Get-AgentPid {
  if (!(Test-Path $pidPath)) {
    return $null
  }

  $raw = (Get-Content $pidPath -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($raw -match "^\d+$") {
    return [int] $raw
  }

  return $null
}

function Test-AgentRunning {
  $agentPid = Get-AgentPid
  if (!$agentPid) {
    return $false
  }

  return $null -ne (Get-Process -Id $agentPid -ErrorAction SilentlyContinue)
}

function Stop-ProcessTree {
  param([int] $RootPid)
  taskkill.exe /PID $RootPid /T /F | Out-Null
}

function Start-Agent {
  if (Test-AgentRunning) {
    return
  }

  $command = "npm run dev >> `"$logPath`" 2>&1"
  $process = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", $command) -WorkingDirectory $agentDir -WindowStyle Hidden -PassThru
  Set-Content -Path $pidPath -Value $process.Id
}

function Stop-Agent {
  $agentPid = Get-AgentPid
  if ($agentPid) {
    Stop-ProcessTree -RootPid $agentPid
  }

  Remove-Item $pidPath -ErrorAction SilentlyContinue
}

function Invoke-TestPrint {
  $command = "npm run test-print >> `"$testLogPath`" 2>&1"
  Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", $command) -WorkingDirectory $agentDir -WindowStyle Hidden | Out-Null
}

function Open-TextFile {
  param([string] $Path)
  if (!(Test-Path $Path)) {
    New-Item -ItemType File -Force -Path $Path | Out-Null
  }
  Start-Process notepad.exe $Path
}

function Get-Setting {
  param([hashtable] $Values, [string] $Key, [string] $Default)
  if ($Values.ContainsKey($Key) -and $Values[$Key]) {
    return $Values[$Key]
  }

  return $Default
}

$envValues = Read-EnvFile

$form = New-Object System.Windows.Forms.Form
$form.Text = "Lloyd Print Control"
$form.Size = New-Object System.Drawing.Size(560, 420)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false

$font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Font = $font

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Location = New-Object System.Drawing.Point(24, 20)
$statusLabel.Size = New-Object System.Drawing.Size(500, 32)
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($statusLabel)

function Add-Label {
  param([string] $Text, [int] $Y)
  $label = New-Object System.Windows.Forms.Label
  $label.Text = $Text
  $label.Location = New-Object System.Drawing.Point(24, $Y)
  $label.Size = New-Object System.Drawing.Size(160, 24)
  $form.Controls.Add($label)
}

function Add-TextBox {
  param([string] $Value, [int] $Y)
  $box = New-Object System.Windows.Forms.TextBox
  $box.Text = $Value
  $box.Location = New-Object System.Drawing.Point(190, $Y)
  $box.Size = New-Object System.Drawing.Size(330, 24)
  $form.Controls.Add($box)
  return $box
}

Add-Label "Backend URL" 70
$backendBox = Add-TextBox (Get-Setting $envValues "BACKEND_URL" "https://lloyd-orders-production.up.railway.app") 68

Add-Label "Printer Name" 110
$printerBox = Add-TextBox (Get-Setting $envValues "PRINTER_NAME" "SLK-TS400") 108

Add-Label "Poll Interval (ms)" 150
$pollBox = Add-TextBox (Get-Setting $envValues "PRINT_POLL_INTERVAL_MS" "10000") 148

Add-Label "SumatraPDF Path" 190
$sumatraBox = Add-TextBox (Get-Setting $envValues "SUMATRA_PDF_PATH" "C:\Users\kompj\AppData\Local\SumatraPDF\SumatraPDF.exe") 188

$saveButton = New-Object System.Windows.Forms.Button
$saveButton.Text = "Save Settings"
$saveButton.Location = New-Object System.Drawing.Point(24, 235)
$saveButton.Size = New-Object System.Drawing.Size(120, 38)
$form.Controls.Add($saveButton)

$startButton = New-Object System.Windows.Forms.Button
$startButton.Text = "Start Agent"
$startButton.Location = New-Object System.Drawing.Point(154, 235)
$startButton.Size = New-Object System.Drawing.Size(110, 38)
$startButton.BackColor = [System.Drawing.Color]::ForestGreen
$startButton.ForeColor = [System.Drawing.Color]::White
$startButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$startButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($startButton)

$stopButton = New-Object System.Windows.Forms.Button
$stopButton.Text = "Stop Agent"
$stopButton.Location = New-Object System.Drawing.Point(274, 235)
$stopButton.Size = New-Object System.Drawing.Size(110, 38)
$stopButton.BackColor = [System.Drawing.Color]::Firebrick
$stopButton.ForeColor = [System.Drawing.Color]::White
$stopButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$stopButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($stopButton)

$testButton = New-Object System.Windows.Forms.Button
$testButton.Text = "Test Print"
$testButton.Location = New-Object System.Drawing.Point(394, 235)
$testButton.Size = New-Object System.Drawing.Size(110, 38)
$form.Controls.Add($testButton)

$logButton = New-Object System.Windows.Forms.Button
$logButton.Text = "Open Agent Log"
$logButton.Location = New-Object System.Drawing.Point(24, 295)
$logButton.Size = New-Object System.Drawing.Size(150, 34)
$form.Controls.Add($logButton)

$testLogButton = New-Object System.Windows.Forms.Button
$testLogButton.Text = "Open Test Log"
$testLogButton.Location = New-Object System.Drawing.Point(184, 295)
$testLogButton.Size = New-Object System.Drawing.Size(150, 34)
$form.Controls.Add($testLogButton)

$openFolderButton = New-Object System.Windows.Forms.Button
$openFolderButton.Text = "Open Folder"
$openFolderButton.Location = New-Object System.Drawing.Point(344, 295)
$openFolderButton.Size = New-Object System.Drawing.Size(150, 34)
$form.Controls.Add($openFolderButton)

function Refresh-Status {
  if (Test-AgentRunning) {
    $statusLabel.Text = "Status: Running"
    $statusLabel.ForeColor = [System.Drawing.Color]::ForestGreen
  } else {
    $statusLabel.Text = "Status: Stopped"
    $statusLabel.ForeColor = [System.Drawing.Color]::Firebrick
  }
}

$saveButton.Add_Click({
  Write-EnvFile -BackendUrl $backendBox.Text -PrinterName $printerBox.Text -PollInterval $pollBox.Text -SumatraPath $sumatraBox.Text
  [System.Windows.Forms.MessageBox]::Show("Settings saved. Restart the agent if it is running.", "Lloyd Print Control") | Out-Null
})

$startButton.Add_Click({
  Write-EnvFile -BackendUrl $backendBox.Text -PrinterName $printerBox.Text -PollInterval $pollBox.Text -SumatraPath $sumatraBox.Text
  Start-Agent
  Start-Sleep -Milliseconds 500
  Refresh-Status
})

$stopButton.Add_Click({
  Stop-Agent
  Start-Sleep -Milliseconds 500
  Refresh-Status
})

$testButton.Add_Click({
  Write-EnvFile -BackendUrl $backendBox.Text -PrinterName $printerBox.Text -PollInterval $pollBox.Text -SumatraPath $sumatraBox.Text
  Invoke-TestPrint
  [System.Windows.Forms.MessageBox]::Show("Test print started. Check the printer or test log.", "Lloyd Print Control") | Out-Null
})

$logButton.Add_Click({ Open-TextFile $logPath })
$testLogButton.Add_Click({ Open-TextFile $testLogPath })
$openFolderButton.Add_Click({ Start-Process explorer.exe $agentDir })

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1500
$timer.Add_Tick({ Refresh-Status })
$timer.Start()

Refresh-Status
[void] $form.ShowDialog()
