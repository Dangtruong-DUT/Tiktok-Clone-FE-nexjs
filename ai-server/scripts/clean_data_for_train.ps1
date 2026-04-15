param(
  [string]$InputDir = "data/vietnamese",
  [string]$ManualPath = "data/manual/vi/manual_labels.csv",
  [string]$OutputDir = "data/vietnamese",
  [int]$MinTextLength = 6,
  [int]$RandomSeed = 42
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."

function Normalize-Text {
  param([string]$Text)
  $t = if ($null -eq $Text) { "" } else { $Text }
  $t = $t.ToLowerInvariant()
  $t = [regex]::Replace($t, "https?://\S+|www\.\S+", " ")
  $t = [regex]::Replace($t, "@[a-zA-Z0-9_\.]+", " ")
  $t = [regex]::Replace($t, "[^\p{L}\p{Nd}\s]", " ")
  $t = [regex]::Replace($t, "\s+", " ").Trim()
  return $t
}

function To-Binary {
  param($Value)
  try {
    if ([double]::Parse("$Value", [System.Globalization.CultureInfo]::InvariantCulture) -ge 0.5) { return 1 }
  } catch {
  }
  return 0
}

if (-not (Test-Path $ManualPath)) {
  throw "Missing manual labels file: $ManualPath"
}

$manualRows = Import-Csv $ManualPath
$manualMap = @{}
foreach ($m in $manualRows) {
  $key = Normalize-Text $m.Comment
  if (-not [string]::IsNullOrWhiteSpace($key)) {
    $manualMap[$key] = $m
  }
}

$trainPath = Join-Path $InputDir "train.csv"
$validPath = Join-Path $InputDir "valid.csv"
$testPath = Join-Path $InputDir "test.csv"

$all = @(Import-Csv $trainPath) + @(Import-Csv $validPath) + @(Import-Csv $testPath)

$cleaned = New-Object System.Collections.Generic.List[object]
$seen = @{}

foreach ($r in $all) {
  $comment = Normalize-Text $r.Comment
  if ($comment.Length -lt $MinTextLength) { continue }

  $src = if ($r.PSObject.Properties.Name -contains "source") { "$($r.source)" } else { "unknown" }
  $isSynthetic = 0
  if ($r.PSObject.Properties.Name -contains "synthetic") {
    $isSynthetic = To-Binary $r.synthetic
  }

  $hasManual = $manualMap.ContainsKey($comment)

  # Clean policy: keep non-synthetic by default, keep synthetic only when manually reviewed.
  if ($isSynthetic -eq 1 -and -not $hasManual) {
    continue
  }

  if ($seen.ContainsKey($comment)) { continue }
  $seen[$comment] = $true

  $toxic = if ($r.PSObject.Properties.Name -contains "toxic") { To-Binary $r.toxic } else { To-Binary $r.Toxicity }
  $severe = if ($r.PSObject.Properties.Name -contains "severe_toxic") { To-Binary $r.severe_toxic } else { 0 }
  $obscene = if ($r.PSObject.Properties.Name -contains "obscene") { To-Binary $r.obscene } else { 0 }
  $threat = if ($r.PSObject.Properties.Name -contains "threat") { To-Binary $r.threat } else { 0 }
  $insult = if ($r.PSObject.Properties.Name -contains "insult") { To-Binary $r.insult } else { 0 }
  $identity = if ($r.PSObject.Properties.Name -contains "identity_hate") { To-Binary $r.identity_hate } else { 0 }

  $manualOverride = 0
  if ($hasManual) {
    $m = $manualMap[$comment]
    $toxic = To-Binary $m.toxic
    $severe = To-Binary $m.severe_toxic
    $obscene = To-Binary $m.obscene
    $threat = To-Binary $m.threat
    $insult = To-Binary $m.insult
    $identity = To-Binary $m.identity_hate
    $manualOverride = 1
  }

  $cleaned.Add([PSCustomObject]@{
    Comment = $comment
    Toxicity = $toxic
    toxic = $toxic
    severe_toxic = $severe
    obscene = $obscene
    threat = $threat
    insult = $insult
    identity_hate = $identity
    source = $src
    manual_override = $manualOverride
  }) | Out-Null
}

$withHash = foreach ($r in $cleaned) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($r.Comment)
  $hash = [System.BitConverter]::ToString((New-Object System.Security.Cryptography.MD5CryptoServiceProvider).ComputeHash($bytes)).Replace("-", "")
  [PSCustomObject]@{
    Comment = $r.Comment
    Toxicity = $r.Toxicity
    toxic = $r.toxic
    severe_toxic = $r.severe_toxic
    obscene = $r.obscene
    threat = $r.threat
    insult = $r.insult
    identity_hate = $r.identity_hate
    source = $r.source
    manual_override = $r.manual_override
    hash = $hash
  }
}

$sorted = $withHash | Sort-Object hash
$total = $sorted.Count
$trainCount = [int]([Math]::Floor($total * 0.8))
$validCount = [int]([Math]::Floor($total * 0.1))
$testCount = $total - $trainCount - $validCount

$trainRows = $sorted | Select-Object -First $trainCount
$validRows = $sorted | Select-Object -Skip $trainCount -First $validCount
$testRows = $sorted | Select-Object -Skip ($trainCount + $validCount)

$exportCols = @("Comment", "Toxicity", "toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate", "source", "manual_override")

$trainRows | Select-Object $exportCols | Export-Csv (Join-Path $OutputDir "train.csv") -NoTypeInformation -Encoding UTF8
$validRows | Select-Object $exportCols | Export-Csv (Join-Path $OutputDir "valid.csv") -NoTypeInformation -Encoding UTF8
$testRows | Select-Object $exportCols | Export-Csv (Join-Path $OutputDir "test.csv") -NoTypeInformation -Encoding UTF8

$stats = @{
  total = $total
  train = $trainRows.Count
  valid = $validRows.Count
  test = $testRows.Count
  toxic_total = ($sorted | Where-Object { $_.toxic -eq 1 }).Count
  toxic_rate = if ($total -gt 0) { [Math]::Round((($sorted | Where-Object { $_.toxic -eq 1 }).Count / $total), 4) } else { 0 }
  manual_overrides = ($sorted | Where-Object { $_.manual_override -eq 1 }).Count
}

$stats | ConvertTo-Json | Set-Content (Join-Path $OutputDir "stats.json") -Encoding UTF8
$stats | ConvertTo-Json -Depth 4
