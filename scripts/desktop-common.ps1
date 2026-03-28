function Get-RepoRoot {
  param(
    [string]$ScriptRoot
  )

  return (Split-Path -Parent $ScriptRoot)
}

function Get-DesktopRoot {
  param(
    [string]$RepoRoot
  )

  return (Join-Path $RepoRoot ".desktop")
}

function Ensure-DesktopRoot {
  param(
    [string]$RepoRoot
  )

  $desktopRoot = Get-DesktopRoot -RepoRoot $RepoRoot
  if (-not (Test-Path -LiteralPath $desktopRoot)) {
    New-Item -ItemType Directory -Path $desktopRoot -Force | Out-Null
  }
  return $desktopRoot
}

function Get-DesktopStatePath {
  param(
    [string]$RepoRoot
  )

  return (Join-Path (Ensure-DesktopRoot -RepoRoot $RepoRoot) "state.json")
}

function Get-DesktopStatusPath {
  param(
    [string]$RepoRoot
  )

  return (Join-Path (Ensure-DesktopRoot -RepoRoot $RepoRoot) "status.json")
}

function Get-DesktopServerPidPath {
  param(
    [string]$RepoRoot
  )

  return (Join-Path (Ensure-DesktopRoot -RepoRoot $RepoRoot) "server.pid")
}

function Set-DesktopUtf8NoBomFile {
  param(
    [string]$Path,
    [string]$Content
  )

  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Set-DesktopBinaryFile {
  param(
    [string]$Path,
    [byte[]]$Bytes
  )

  $directory = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  [System.IO.File]::WriteAllBytes($Path, $Bytes)
}

function Get-DesktopDefaultState {
  return [pscustomobject]@{
    autoPublish = $true
    gitHub = [pscustomobject]@{
      owner = ""
      repo = ""
      branch = "main"
      token = ""
      tokenCipher = ""
      publishNote = ""
    }
    lastPublish = [pscustomobject]@{
      status = "idle"
      message = ""
      at = ""
      commitSha = ""
      manual = $false
    }
    server = [pscustomobject]@{
      pid = 0
      startedAt = ""
    }
  }
}

function Normalize-DesktopState {
  param(
    $State
  )

  $default = Get-DesktopDefaultState
  if ($null -eq $State) {
    return $default
  }

  if ($null -eq $State.gitHub) {
    $State | Add-Member -NotePropertyName gitHub -NotePropertyValue $default.gitHub -Force
  }
  if ($null -eq $State.lastPublish) {
    $State | Add-Member -NotePropertyName lastPublish -NotePropertyValue $default.lastPublish -Force
  }
  if ($null -eq $State.server) {
    $State | Add-Member -NotePropertyName server -NotePropertyValue $default.server -Force
  }

  if ($null -eq $State.autoPublish) {
    $State | Add-Member -NotePropertyName autoPublish -NotePropertyValue $default.autoPublish -Force
  }

  foreach ($property in "owner", "repo", "branch", "token", "tokenCipher", "publishNote") {
    if ($null -eq $State.gitHub.$property) {
      $State.gitHub | Add-Member -NotePropertyName $property -NotePropertyValue $default.gitHub.$property -Force
    }
  }

  foreach ($property in "status", "message", "at", "commitSha", "manual") {
    if ($null -eq $State.lastPublish.$property) {
      $State.lastPublish | Add-Member -NotePropertyName $property -NotePropertyValue $default.lastPublish.$property -Force
    }
  }

  foreach ($property in "pid", "startedAt") {
    if ($null -eq $State.server.$property) {
      $State.server | Add-Member -NotePropertyName $property -NotePropertyValue $default.server.$property -Force
    }
  }

  if ([string]::IsNullOrWhiteSpace($State.gitHub.branch)) {
    $State.gitHub.branch = "main"
  }

  return $State
}

function Ensure-DesktopCryptoLoaded {
  try {
    [void][System.Security.Cryptography.ProtectedData]
  } catch {
    Add-Type -AssemblyName System.Security
  }
}

function Protect-DesktopSecret {
  param(
    [string]$PlainText
  )

  if ([string]::IsNullOrEmpty($PlainText)) {
    return ""
  }

  Ensure-DesktopCryptoLoaded
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($PlainText)
  $protected = [System.Security.Cryptography.ProtectedData]::Protect(
    $bytes,
    $null,
    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
  )
  return [Convert]::ToBase64String($protected)
}

function Unprotect-DesktopSecret {
  param(
    [string]$CipherText
  )

  if ([string]::IsNullOrEmpty($CipherText)) {
    return ""
  }

  try {
    Ensure-DesktopCryptoLoaded
    $protected = [Convert]::FromBase64String($CipherText)
    $bytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
      $protected,
      $null,
      [System.Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    return [System.Text.Encoding]::UTF8.GetString($bytes)
  } catch {
    return ""
  }
}

function Set-DesktopGitHubToken {
  param(
    $State,
    [string]$Token
  )

  $State.gitHub.token = ""
  $State.gitHub.tokenCipher = Protect-DesktopSecret -PlainText $Token
}

function Get-DesktopGitHubToken {
  param(
    $State
  )

  $token = Unprotect-DesktopSecret -CipherText ([string]$State.gitHub.tokenCipher)
  if (-not [string]::IsNullOrWhiteSpace($token)) {
    return $token
  }

  return [string]$State.gitHub.token
}

function Read-DesktopState {
  param(
    [string]$RepoRoot
  )

  $path = Get-DesktopStatePath -RepoRoot $RepoRoot
  if (-not (Test-Path -LiteralPath $path)) {
    return (Get-DesktopDefaultState)
  }

  try {
    $state = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
    return (Normalize-DesktopState -State $state)
  } catch {
    return (Get-DesktopDefaultState)
  }
}

function Write-DesktopState {
  param(
    [string]$RepoRoot,
    $State
  )

  $normalized = Normalize-DesktopState -State $State
  if (-not [string]::IsNullOrWhiteSpace([string]$normalized.gitHub.token)) {
    Set-DesktopGitHubToken -State $normalized -Token ([string]$normalized.gitHub.token)
  } elseif ($null -eq $normalized.gitHub.tokenCipher) {
    $normalized.gitHub.tokenCipher = ""
  }
  $normalized.gitHub.token = ""
  $path = Get-DesktopStatePath -RepoRoot $RepoRoot
  $json = $normalized | ConvertTo-Json -Depth 10
  Set-DesktopUtf8NoBomFile -Path $path -Content "$json`n"
}

function Get-DesktopStatus {
  param(
    [string]$RepoRoot
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  $serverRunning = $false
  if ($state.server.pid -is [int] -and $state.server.pid -gt 0) {
    try {
      $process = Get-Process -Id $state.server.pid -ErrorAction Stop
      if ($null -ne $process) {
        $serverRunning = $true
      }
    } catch {
      $serverRunning = $false
    }
  }

  return [pscustomobject]@{
    serverRunning = $serverRunning
    autoPublish = [bool]$state.autoPublish
    lastPublish = $state.lastPublish
    gitHub = [pscustomobject]@{
      owner = $state.gitHub.owner
      repo = $state.gitHub.repo
      branch = $state.gitHub.branch
      hasToken = -not [string]::IsNullOrWhiteSpace((Get-DesktopGitHubToken -State $state))
    }
  }
}

function Write-DesktopStatus {
  param(
    [string]$RepoRoot
  )

  $statusPath = Get-DesktopStatusPath -RepoRoot $RepoRoot
  $status = Get-DesktopStatus -RepoRoot $RepoRoot | ConvertTo-Json -Depth 10
  Set-DesktopUtf8NoBomFile -Path $statusPath -Content "$status`n"
}

function Update-DesktopGitHubSettings {
  param(
    [string]$RepoRoot,
    $Payload
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  foreach ($property in "owner", "repo", "branch", "publishNote") {
    $payloadProperty = $Payload.PSObject.Properties[$property]
    if ($null -ne $payloadProperty) {
      $state.gitHub.$property = [string]$payloadProperty.Value
    }
  }
  $tokenProperty = $Payload.PSObject.Properties["token"]
  if ($null -ne $tokenProperty) {
    Set-DesktopGitHubToken -State $state -Token ([string]$tokenProperty.Value)
  }
  if ([string]::IsNullOrWhiteSpace($state.gitHub.branch)) {
    $state.gitHub.branch = "main"
  }

  Write-DesktopState -RepoRoot $RepoRoot -State $state
  Write-DesktopStatus -RepoRoot $RepoRoot
  return $state
}

function Set-DesktopAutoPublish {
  param(
    [string]$RepoRoot,
    [bool]$Enabled
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  $state.autoPublish = $Enabled
  Write-DesktopState -RepoRoot $RepoRoot -State $state
  Write-DesktopStatus -RepoRoot $RepoRoot
  return $state
}

function Set-DesktopServerPid {
  param(
    [string]$RepoRoot,
    [int]$ProcessId
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  $state.server.pid = $ProcessId
  $state.server.startedAt = [DateTime]::UtcNow.ToString("o")
  Write-DesktopState -RepoRoot $RepoRoot -State $state
  Set-Content -LiteralPath (Get-DesktopServerPidPath -RepoRoot $RepoRoot) -Value $ProcessId -Encoding ASCII
  Write-DesktopStatus -RepoRoot $RepoRoot
}

function Clear-DesktopServerPid {
  param(
    [string]$RepoRoot
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  $state.server.pid = 0
  $state.server.startedAt = ""
  Write-DesktopState -RepoRoot $RepoRoot -State $state
  $pidPath = Get-DesktopServerPidPath -RepoRoot $RepoRoot
  if (Test-Path -LiteralPath $pidPath) {
    Remove-Item -LiteralPath $pidPath -Force
  }
  Write-DesktopStatus -RepoRoot $RepoRoot
}

function Save-DesktopSnapshot {
  param(
    [string]$RepoRoot,
    $Payload
  )

  $targetPath = Join-Path $RepoRoot "data\products.json"
  $json = $Payload | ConvertTo-Json -Depth 100
  Set-DesktopUtf8NoBomFile -Path $targetPath -Content "$json`n"
}

function Set-DesktopPublishResult {
  param(
    [string]$RepoRoot,
    [string]$Status,
    [string]$Message,
    [string]$CommitSha = "",
    [bool]$Manual = $false
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  $state.lastPublish.status = $Status
  $state.lastPublish.message = $Message
  $state.lastPublish.at = [DateTime]::UtcNow.ToString("o")
  $state.lastPublish.commitSha = $CommitSha
  $state.lastPublish.manual = $Manual
  Write-DesktopState -RepoRoot $RepoRoot -State $state
  Write-DesktopStatus -RepoRoot $RepoRoot
}

function Get-DesktopExceptionStatusCode {
  param(
    $ErrorRecord
  )

  if ($null -eq $ErrorRecord -or $null -eq $ErrorRecord.Exception) {
    return $null
  }

  $responseProperty = $ErrorRecord.Exception.PSObject.Properties["Response"]
  if ($null -eq $responseProperty -or $null -eq $responseProperty.Value) {
    return $null
  }

  try {
    return [int]$responseProperty.Value.StatusCode
  } catch {
    return $null
  }
}

function Get-DesktopGitHubSettings {
  param(
    [string]$RepoRoot
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  return [pscustomobject]@{
    owner = $state.gitHub.owner
    repo = $state.gitHub.repo
    branch = $state.gitHub.branch
    publishNote = $state.gitHub.publishNote
    hasToken = -not [string]::IsNullOrWhiteSpace((Get-DesktopGitHubToken -State $state))
  }
}

function Get-DesktopGitHubHeaders {
  param(
    $State
  )

  $token = Get-DesktopGitHubToken -State $State
  if ([string]::IsNullOrWhiteSpace($token)) {
    throw "GitHub settings are incomplete."
  }

  return @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent" = "Tinnsi-Desktop"
  }
}

function Convert-ToDesktopRepoApiPath {
  param(
    [string]$RepoPath
  )

  return ((($RepoPath -split "/") | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }) | ForEach-Object {
    [System.Uri]::EscapeDataString($_)
  }) -join "/"
}

function Get-DesktopGitHubContentsUri {
  param(
    $State,
    [string]$RepoPath
  )

  $encodedPath = Convert-ToDesktopRepoApiPath -RepoPath $RepoPath
  return "https://api.github.com/repos/$($State.gitHub.owner)/$($State.gitHub.repo)/contents/$encodedPath"
}

function Publish-DesktopRepoFile {
  param(
    [string]$RepoRoot,
    [string]$RepoPath,
    [string]$Base64Content,
    [string]$Message,
    [bool]$TrackPublish = $false,
    [bool]$Manual = $false
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  if ([string]::IsNullOrWhiteSpace($state.gitHub.owner) -or
      [string]::IsNullOrWhiteSpace($state.gitHub.repo) -or
      [string]::IsNullOrWhiteSpace((Get-DesktopGitHubToken -State $state))) {
    if ($TrackPublish) {
      Set-DesktopPublishResult -RepoRoot $RepoRoot -Status "error" -Message "GitHub settings are incomplete." -Manual $Manual
    }
    throw "GitHub settings are incomplete."
  }

  $branch = if ([string]::IsNullOrWhiteSpace($state.gitHub.branch)) { "main" } else { $state.gitHub.branch }
  $headers = Get-DesktopGitHubHeaders -State $state
  $contentsUri = Get-DesktopGitHubContentsUri -State $state -RepoPath $RepoPath
  $sha = ""

  try {
    $existing = Invoke-RestMethod -Method Get -Headers $headers -Uri "${contentsUri}?ref=$([System.Uri]::EscapeDataString($branch))"
    $sha = $existing.sha
  } catch {
    $statusCode = Get-DesktopExceptionStatusCode -ErrorRecord $_
    if ($statusCode -ne 404) {
      if ($TrackPublish) {
        Set-DesktopPublishResult -RepoRoot $RepoRoot -Status "error" -Message $_.Exception.Message -Manual $Manual
      }
      throw
    }
  }

  $body = @{
    message = $Message
    content = $Base64Content
    branch = $branch
  }
  if (-not [string]::IsNullOrWhiteSpace($sha)) {
    $body.sha = $sha
  }

  try {
    $result = Invoke-RestMethod -Method Put -Headers $headers -ContentType "application/json" -Uri $contentsUri -Body ($body | ConvertTo-Json -Depth 10 -Compress)
    if ($TrackPublish) {
      Set-DesktopPublishResult -RepoRoot $RepoRoot -Status "success" -Message "Published to GitHub." -CommitSha $result.commit.sha -Manual $Manual
    }
    return $result
  } catch {
    $errorMessage = $_.Exception.Message
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      $errorMessage = $_.ErrorDetails.Message
    }
    if ($TrackPublish) {
      Set-DesktopPublishResult -RepoRoot $RepoRoot -Status "error" -Message $errorMessage -Manual $Manual
    }
    throw
  }
}

function Publish-DesktopProducts {
  param(
    [string]$RepoRoot,
    [bool]$Manual = $false
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  $filePath = Join-Path $RepoRoot "data\products.json"
  $content = Get-Content -LiteralPath $filePath -Raw -Encoding UTF8
  $encodedContent = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
  $message = if (-not [string]::IsNullOrWhiteSpace($state.gitHub.publishNote)) {
    "content: $($state.gitHub.publishNote)"
  } elseif ($Manual) {
    "content: desktop manual publish $(Get-Date -Format s)"
  } else {
    "content: desktop auto publish $(Get-Date -Format s)"
  }

  return (Publish-DesktopRepoFile -RepoRoot $RepoRoot -RepoPath "data/products.json" -Base64Content $encodedContent -Message $message -TrackPublish $true -Manual $Manual)
}

function Upload-DesktopProductImage {
  param(
    [string]$RepoRoot,
    [string]$RepoPath,
    [string]$Base64Content,
    [string]$Message
  )

  $localPath = Join-Path $RepoRoot ($RepoPath.Replace("/", "\"))
  $bytes = [Convert]::FromBase64String($Base64Content)
  Set-DesktopBinaryFile -Path $localPath -Bytes $bytes

  return (Publish-DesktopRepoFile -RepoRoot $RepoRoot -RepoPath $RepoPath -Base64Content $Base64Content -Message $Message)
}

function Remove-DesktopRepoFile {
  param(
    [string]$RepoRoot,
    [string]$RepoPath,
    [string]$Message
  )

  $state = Read-DesktopState -RepoRoot $RepoRoot
  if ([string]::IsNullOrWhiteSpace($state.gitHub.owner) -or
      [string]::IsNullOrWhiteSpace($state.gitHub.repo) -or
      [string]::IsNullOrWhiteSpace((Get-DesktopGitHubToken -State $state))) {
    throw "GitHub settings are incomplete."
  }

  $branch = if ([string]::IsNullOrWhiteSpace($state.gitHub.branch)) { "main" } else { $state.gitHub.branch }
  $headers = Get-DesktopGitHubHeaders -State $state
  $contentsUri = Get-DesktopGitHubContentsUri -State $state -RepoPath $RepoPath
  $existing = $null

  try {
    $existing = Invoke-RestMethod -Method Get -Headers $headers -Uri "${contentsUri}?ref=$([System.Uri]::EscapeDataString($branch))"
  } catch {
    $statusCode = Get-DesktopExceptionStatusCode -ErrorRecord $_
    if ($statusCode -ne 404) {
      throw
    }
  }

  if ($null -ne $existing -and -not [string]::IsNullOrWhiteSpace([string]$existing.sha)) {
    $body = @{
      message = $Message
      sha = [string]$existing.sha
      branch = $branch
    }
    Invoke-RestMethod -Method Delete -Headers $headers -ContentType "application/json" -Uri $contentsUri -Body ($body | ConvertTo-Json -Depth 10 -Compress) | Out-Null
  }

  $localPath = Join-Path $RepoRoot ($RepoPath.Replace("/", "\"))
  if (Test-Path -LiteralPath $localPath) {
    Remove-Item -LiteralPath $localPath -Force
  }

  return @{
    ok = $true
    removed = ($null -ne $existing)
  }
}

function Test-DesktopServerRunning {
  param(
    [int]$Port = 4173
  )

  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/_desktop/status" -UseBasicParsing -TimeoutSec 2
    return ($response.StatusCode -eq 200)
  } catch {
    return $false
  }
}
