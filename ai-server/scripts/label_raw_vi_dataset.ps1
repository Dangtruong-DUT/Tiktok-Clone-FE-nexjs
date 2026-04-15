param(
  [string]$RawDir = "data/raw/vi",
  [string]$OutputDir = "data/labeled/vi"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

function Remove-Diacritics {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
  $normalized = $Text.Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object System.Text.StringBuilder
  foreach ($c in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($c)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$sb.Append($c)
    }
  }
  return $sb.ToString().Normalize([Text.NormalizationForm]::FormC)
}

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

$threatRegex = [regex]"\b(giet|dam chet|tao se giet|danh chet|chup no|chup no di|dap chet|xien chet)\b"
$identityRegex = [regex]"\b(3 que|ba que|phan dong|pbvm|bac ky|nam ky|dan toc)\b"
$obsceneRegex = [regex]"\b(dm|dit|cac|lon|clm|vcl|vl|cc|me kiep|thang cho|con cho|deo)\b"

$badWordsPath = Join-Path $RawDir "bad_words.json"
if (-not (Test-Path $badWordsPath)) {
  throw "Missing bad_words.json in $RawDir"
}

$badWordsRaw = Get-Content $badWordsPath -Raw | ConvertFrom-Json
$badWords = @()
foreach ($w in $badWordsRaw) {
  $x = Remove-Diacritics (Normalize-Text "$w")
  if ($x.Length -gt 1) {
    $badWords += $x
  }
}
$badWords = @($badWords | Select-Object -Unique)

function Label-Frame {
  param(
    [string]$InputCsv,
    [string]$OutputCsv,
    [string]$SplitName
  )

  if (-not (Test-Path $InputCsv)) {
    throw "Missing input file: $InputCsv"
  }

  $rows = Import-Csv $InputCsv
  $out = New-Object System.Collections.Generic.List[object]

  foreach ($r in $rows) {
    $comment = if ($r.PSObject.Properties.Name -contains "Comment") { "$($r.Comment)" } else { "" }
    $norm = Normalize-Text $comment
    $normAscii = Remove-Diacritics $norm

    if ([string]::IsNullOrWhiteSpace($norm)) { continue }

    $baseToxic = if ($r.PSObject.Properties.Name -contains "Toxicity") { To-Binary $r.Toxicity } else { 0 }

    $badHitCount = 0
    foreach ($bw in $badWords) {
      if ($normAscii.Contains($bw)) {
        $badHitCount += 1
      }
    }

    $obscene = if ($obsceneRegex.IsMatch($normAscii) -or $badHitCount -gt 0) { 1 } else { 0 }
    $threat = if ($threatRegex.IsMatch($normAscii)) { 1 } else { 0 }
    $identity = if ($identityRegex.IsMatch($normAscii)) { 1 } else { 0 }

    $toxic = if ($baseToxic -eq 1 -or $obscene -eq 1 -or $threat -eq 1 -or $identity -eq 1) { 1 } else { 0 }
    $insult = if ($toxic -eq 1 -and ($obscene -eq 1 -or $badHitCount -gt 0)) { 1 } else { 0 }
    $severe = if ($toxic -eq 1 -and ($threat -eq 1 -or $badHitCount -ge 2)) { 1 } else { 0 }

    $out.Add([PSCustomObject]@{
      Comment = $norm
      Toxicity = $toxic
      toxic = $toxic
      severe_toxic = $severe
      obscene = $obscene
      threat = $threat
      insult = $insult
      identity_hate = $identity
      source = "victsd_$SplitName"
      weak_label = 1
    }) | Out-Null
  }

  $out | Export-Csv $OutputCsv -NoTypeInformation -Encoding UTF8
  return $out
}

$train = Label-Frame -InputCsv (Join-Path $RawDir "victsd_train.csv") -OutputCsv (Join-Path $OutputDir "train.csv") -SplitName "train"
$valid = Label-Frame -InputCsv (Join-Path $RawDir "victsd_valid.csv") -OutputCsv (Join-Path $OutputDir "valid.csv") -SplitName "valid"
$test = Label-Frame -InputCsv (Join-Path $RawDir "victsd_test.csv") -OutputCsv (Join-Path $OutputDir "test.csv") -SplitName "test"

$all = @($train) + @($valid) + @($test)
$stats = @{
  train = @($train).Count
  valid = @($valid).Count
  test = @($test).Count
  total = @($all).Count
  toxic_total = @($all | Where-Object { $_.toxic -eq 1 }).Count
  toxic_rate = if (@($all).Count -gt 0) { [Math]::Round((@($all | Where-Object { $_.toxic -eq 1 }).Count / @($all).Count), 4) } else { 0 }
}

$stats | ConvertTo-Json | Set-Content (Join-Path $OutputDir "stats.json") -Encoding UTF8
$stats | ConvertTo-Json -Depth 3
