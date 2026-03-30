param(
  [int]$Port = 4173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "desktop-common.ps1")

$repoRoot = Get-RepoRoot -ScriptRoot $PSScriptRoot
$rootPrefix = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd("\")

$mimeTypes = @{
  ".css"  = "text/css; charset=utf-8"
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml; charset=utf-8"
  ".webp" = "image/webp"
  ".woff" = "font/woff"
  ".woff2" = "font/woff2"
}

function Get-TargetPath {
  param(
    [string]$RequestPath
  )

  $relativePath = [System.Uri]::UnescapeDataString($RequestPath.TrimStart("/").Replace("/", "\"))
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    $relativePath = "index.html"
  } elseif ($RequestPath.EndsWith("/")) {
    $relativePath = Join-Path $relativePath "index.html"
  }

  $fullPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $relativePath))
  if (-not $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Forbidden"
  }

  return $fullPath
}

function Find-HeaderEnd {
  param(
    [byte[]]$Bytes
  )

  for ($index = 0; $index -le $Bytes.Length - 4; $index += 1) {
    if ($Bytes[$index] -eq 13 -and
        $Bytes[$index + 1] -eq 10 -and
        $Bytes[$index + 2] -eq 13 -and
        $Bytes[$index + 3] -eq 10) {
      return ($index + 4)
    }
  }

  return -1
}

function Read-HttpRequest {
  param(
    [System.IO.Stream]$Stream
  )

  $buffer = New-Object byte[] 8192
  $memory = New-Object System.IO.MemoryStream
  $headerEnd = -1

  while ($headerEnd -lt 0) {
    $read = $Stream.Read($buffer, 0, $buffer.Length)
    if ($read -le 0) {
      return $null
    }

    $memory.Write($buffer, 0, $read)
    $headerEnd = Find-HeaderEnd -Bytes ($memory.ToArray())
  }

  $bytes = $memory.ToArray()
  $headerText = [System.Text.Encoding]::ASCII.GetString($bytes, 0, $headerEnd)
  $headerLines = $headerText -split "`r`n"
  $requestLine = $headerLines[0]
  $parts = $requestLine.Split(" ")
  if ($parts.Length -lt 2) {
    return $null
  }

  $headers = @{}
  foreach ($line in $headerLines[1..($headerLines.Length - 1)]) {
    if ([string]::IsNullOrWhiteSpace($line)) {
      continue
    }

    $separator = $line.IndexOf(":")
    if ($separator -lt 1) {
      continue
    }

    $name = $line.Substring(0, $separator).Trim()
    $value = $line.Substring($separator + 1).Trim()
    $headers[$name] = $value
  }

  $contentLength = 0
  if ($headers.ContainsKey("Content-Length")) {
    [void][int]::TryParse($headers["Content-Length"], [ref]$contentLength)
  }

  while (($memory.Length - $headerEnd) -lt $contentLength) {
    $read = $Stream.Read($buffer, 0, $buffer.Length)
    if ($read -le 0) {
      break
    }
    $memory.Write($buffer, 0, $read)
  }

  $bytes = $memory.ToArray()
  $bodyBytes = New-Object byte[] $contentLength
  if ($contentLength -gt 0) {
    [System.Array]::Copy($bytes, $headerEnd, $bodyBytes, 0, $contentLength)
  }

  return [pscustomobject]@{
    Method = $parts[0].ToUpperInvariant()
    RawPath = $parts[1]
    Path = $parts[1].Split("?")[0]
    Headers = $headers
    BodyBytes = $bodyBytes
  }
}

function Write-Response {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$ReasonPhrase,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8",
    [hashtable]$Headers = @{}
  )

  $responseHeaders = @(
    "HTTP/1.1 $StatusCode $ReasonPhrase",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    "Cache-Control: no-store",
    "Connection: close",
    "X-Tinnsi-Local-Server: true"
  )

  foreach ($key in $Headers.Keys) {
    $responseHeaders += "${key}: $($Headers[$key])"
  }

  $responseHeaders += ""
  $responseHeaders += ""

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes(($responseHeaders -join "`r`n"))
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
  $Stream.Flush()
}

function Write-JsonResponse {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [object]$Payload
  )

  $json = $Payload | ConvertTo-Json -Depth 20
  $body = [System.Text.Encoding]::UTF8.GetBytes($json)
  Write-Response -Stream $Stream -StatusCode $StatusCode -ReasonPhrase "OK" -Body $body -ContentType "application/json; charset=utf-8"
}

function Get-JsonBody {
  param(
    $Request
  )

  if ($Request.BodyBytes.Length -eq 0) {
    return $null
  }

  $text = [System.Text.Encoding]::UTF8.GetString($Request.BodyBytes)
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }

  return ($text | ConvertFrom-Json)
}

function Write-DesktopApiResponse {
  param(
    [System.IO.Stream]$Stream,
    $Request
  )

  try {
    switch ($Request.Path) {
      "/_desktop/status" {
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Get-DesktopStatus -RepoRoot $repoRoot)
        return $true
      }
      "/_desktop/settings" {
        if ($Request.Method -eq "GET") {
          Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Get-DesktopGitHubSettings -RepoRoot $repoRoot)
          return $true
        }

        if ($Request.Method -ne "POST") {
          Write-Response -Stream $Stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed"))
          return $true
        }

        $payload = Get-JsonBody -Request $Request
        $state = Update-DesktopGitHubSettings -RepoRoot $repoRoot -Payload $payload
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload @{
          ok = $true
          autoPublish = [bool]$state.autoPublish
          gitHub = @{
            owner = $state.gitHub.owner
            repo = $state.gitHub.repo
            branch = $state.gitHub.branch
            hasToken = -not [string]::IsNullOrWhiteSpace((Get-DesktopGitHubToken -State $state))
          }
        }
        return $true
      }
      "/_desktop/auto-publish" {
        if ($Request.Method -eq "GET") {
          $status = Get-DesktopStatus -RepoRoot $repoRoot
          Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload @{
            autoPublish = [bool]$status.autoPublish
          }
          return $true
        }

        if ($Request.Method -ne "POST") {
          Write-Response -Stream $Stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed"))
          return $true
        }

        $payload = Get-JsonBody -Request $Request
        $state = Set-DesktopAutoPublish -RepoRoot $repoRoot -Enabled ([bool]$payload.enabled)
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload @{
          ok = $true
          autoPublish = [bool]$state.autoPublish
        }
        return $true
      }
      "/_desktop/snapshot" {
        if ($Request.Method -ne "POST") {
          Write-Response -Stream $Stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed"))
          return $true
        }

        $payload = Get-JsonBody -Request $Request
        Save-DesktopSnapshot -RepoRoot $repoRoot -Payload $payload
        $state = Read-DesktopState -RepoRoot $repoRoot
        $response = @{
          ok = $true
          saved = $true
          autoPublish = [bool]$state.autoPublish
          published = $false
          message = "Saved locally."
        }

        if ($state.autoPublish) {
          try {
            Set-DesktopPublishResult -RepoRoot $repoRoot -Status "pending" -Message "Auto publish in progress."
            $publishResult = Publish-DesktopProducts -RepoRoot $repoRoot -Manual:$false
            $response.published = $true
            $response.commitSha = $publishResult.commit.sha
            $response.message = "Saved locally and published."
          } catch {
            $response.message = $_.Exception.Message
          }
        }
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload $response
        return $true
      }
      "/_desktop/publish-now" {
        if ($Request.Method -ne "POST") {
          Write-Response -Stream $Stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed"))
          return $true
        }

        try {
          Set-DesktopPublishResult -RepoRoot $repoRoot -Status "pending" -Message "Manual publish in progress." -Manual $true
          $publishResult = Publish-DesktopProducts -RepoRoot $repoRoot -Manual:$true
          Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload @{
            ok = $true
            commitSha = $publishResult.commit.sha
            message = "Published to GitHub."
          }
        } catch {
          $message = $_.Exception.Message
          $body = [System.Text.Encoding]::UTF8.GetBytes($message)
          Write-Response -Stream $Stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Body $body
        }
        return $true
      }
      "/_desktop/upload-image" {
        if ($Request.Method -ne "POST") {
          Write-Response -Stream $Stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed"))
          return $true
        }

        $payload = Get-JsonBody -Request $Request
        if ([string]::IsNullOrWhiteSpace([string]$payload.targetPath) -or [string]::IsNullOrWhiteSpace([string]$payload.base64)) {
          Write-Response -Stream $Stream -StatusCode 400 -ReasonPhrase "Bad Request" -Body ([System.Text.Encoding]::UTF8.GetBytes("targetPath and base64 are required"))
          return $true
        }

        $message = if ([string]::IsNullOrWhiteSpace([string]$payload.message)) {
          "chore: upload image"
        } else {
          [string]$payload.message
        }

        try {
          $result = Upload-DesktopProductImage -RepoRoot $repoRoot -RepoPath ([string]$payload.targetPath) -Base64Content ([string]$payload.base64) -Message $message
          Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload @{
            ok = $true
            path = [string]$payload.targetPath
            sha = $result.content.sha
          }
        } catch {
          $message = $_.Exception.Message
          if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $message = $_.ErrorDetails.Message
          }
          Write-Response -Stream $Stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Body ([System.Text.Encoding]::UTF8.GetBytes($message))
        }
        return $true
      }
      "/_desktop/delete-image" {
        if ($Request.Method -ne "POST") {
          Write-Response -Stream $Stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed"))
          return $true
        }

        $payload = Get-JsonBody -Request $Request
        if ([string]::IsNullOrWhiteSpace([string]$payload.targetPath)) {
          Write-Response -Stream $Stream -StatusCode 400 -ReasonPhrase "Bad Request" -Body ([System.Text.Encoding]::UTF8.GetBytes("targetPath is required"))
          return $true
        }

        $message = if ([string]::IsNullOrWhiteSpace([string]$payload.message)) {
          "chore: delete image"
        } else {
          [string]$payload.message
        }

        try {
          $result = Remove-DesktopRepoFile -RepoRoot $repoRoot -RepoPath ([string]$payload.targetPath) -Message $message
          Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload @(
            @{
              ok = $true
              path = [string]$payload.targetPath
              removed = [bool]$result.removed
            }
          )[0]
        } catch {
          $message = $_.Exception.Message
          if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $message = $_.ErrorDetails.Message
          }
          Write-Response -Stream $Stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Body ([System.Text.Encoding]::UTF8.GetBytes($message))
        }
        return $true
      }
      default {
        return $false
      }
    }
  } catch {
    $message = $_.Exception.Message
    $body = [System.Text.Encoding]::UTF8.GetBytes($message)
    Write-Response -Stream $Stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Body $body
    return $true
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Set-DesktopServerPid -RepoRoot $repoRoot -ProcessId $PID

Write-Host "Tinnsi local server listening on http://127.0.0.1:$Port/"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $null

    try {
      $stream = $client.GetStream()
      $request = Read-HttpRequest -Stream $stream
      if ($null -eq $request) {
        continue
      }

      if (Write-DesktopApiResponse -Stream $stream -Request $request) {
        continue
      }

      if ($request.Method -ne "GET" -and $request.Method -ne "HEAD") {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
        Write-Response -Stream $stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body $body
        continue
      }

      try {
        $targetPath = Get-TargetPath -RequestPath $request.Path
        if (-not (Test-Path -LiteralPath $targetPath -PathType Leaf)) {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
          Write-Response -Stream $stream -StatusCode 404 -ReasonPhrase "Not Found" -Body $body
          continue
        }

        $extension = [System.IO.Path]::GetExtension($targetPath).ToLowerInvariant()
        $contentType = if ($mimeTypes.ContainsKey($extension)) {
          $mimeTypes[$extension]
        } else {
          "application/octet-stream"
        }

        $bytes = [System.IO.File]::ReadAllBytes($targetPath)
        $body = if ($request.Method -eq "HEAD") { [byte[]]::new(0) } else { $bytes }
        Write-Response -Stream $stream -StatusCode 200 -ReasonPhrase "OK" -Body $body -ContentType $contentType
      } catch {
        $message = $_.Exception.Message
        if ($message -eq "Forbidden") {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
          Write-Response -Stream $stream -StatusCode 403 -ReasonPhrase "Forbidden" -Body $body
        } else {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
          Write-Response -Stream $stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Body $body
        }
      }
    } catch {
      try {
        if ($null -ne $stream) {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
          Write-Response -Stream $stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Body $body
        }
      } catch {
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
  Clear-DesktopServerPid -RepoRoot $repoRoot
}
