param(
  [string]$RawDir = "data/raw/vi",
  [string]$OutputDir = "data/vietnamese",
  [int]$SyntheticFromToxicPerSample = 2,
  [int]$SyntheticFromBadWordsLimit = 4000,
  [int]$RandomSeed = 42
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."

New-Item -ItemType Directory -Force -Path $RawDir | Out-Null
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
  if ($null -eq $Value) { return 0 }
  $v = "$Value".Trim()
  if ($v -eq "") { return 0 }
  if ($v -eq "1") { return 1 }
  if ($v -eq "0") { return 0 }
  try {
    $n = [double]::Parse($v, [System.Globalization.CultureInfo]::InvariantCulture)
    if ($n -ge 0.5) { return 1 }
  } catch {
  }
  return 0
}

$threatRegex = [regex]"\b(giet|dam chet|tao se giet|danh chet|chup no|chup no di|dap chet|xien chet)\b"
$identityRegex = [regex]"\b(3 que|ba que|phan dong|pbvm|bac ky|nam ky|dan toc)\b"
$obsceneRegex = [regex]"\b(dm|dit|cac|lon|clm|vcl|vl|cc)\b"

$badWordsPath = Join-Path $RawDir "bad_words.json"
if (-not (Test-Path $badWordsPath)) {
  throw "Missing bad words file: $badWordsPath"
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

$records = New-Object System.Collections.Generic.List[object]

function Add-Record {
  param(
    [string]$Comment,
    [int]$Toxicity,
    [string]$Source,
    [int]$Synthetic,
    [int]$FromRuleOnly
  )

  $norm = Normalize-Text $Comment
  $normAscii = Remove-Diacritics $norm
  if ([string]::IsNullOrWhiteSpace($norm) -or $norm.Length -lt 2) { return }

  $toxicBase = $Toxicity
  $toxicRule = 0
  $badHitCount = 0

  foreach ($bw in $badWords) {
    if ($normAscii.Contains($bw)) {
      $toxicRule = 1
      $badHitCount += 1
    }
  }

  if ($obsceneRegex.IsMatch($normAscii)) {
    $toxicRule = 1
  }

  $toxic = if ($toxicBase -eq 1 -or $toxicRule -eq 1) { 1 } else { 0 }
  $threat = if ($threatRegex.IsMatch($normAscii)) { 1 } else { 0 }
  $identityHate = if ($identityRegex.IsMatch($normAscii)) { 1 } else { 0 }
  $obscene = if ($obsceneRegex.IsMatch($normAscii) -or $badHitCount -gt 0) { 1 } else { 0 }
  $insult = if ($toxic -eq 1 -and ($obscene -eq 1 -or $badHitCount -gt 0)) { 1 } else { 0 }
  $severe = if ($toxic -eq 1 -and ($threat -eq 1 -or $badHitCount -ge 2)) { 1 } else { 0 }

  $records.Add([PSCustomObject]@{
    Comment = $norm
    Toxicity = $toxic
    toxic = $toxic
    severe_toxic = $severe
    obscene = $obscene
    threat = $threat
    insult = $insult
    identity_hate = $identityHate
    source = $Source
    synthetic = $Synthetic
    rule_labeled = $FromRuleOnly
  }) | Out-Null
}

function Import-ViCTSD {
  param([string]$Path, [string]$SourceName)
  if (-not (Test-Path $Path)) { return }
  $rows = Import-Csv $Path
  foreach ($r in $rows) {
    $comment = if ($r.PSObject.Properties.Name -contains "Comment") { $r.Comment } else { "" }
    $tox = if ($r.PSObject.Properties.Name -contains "Toxicity") { To-Binary $r.Toxicity } else { 0 }
    Add-Record -Comment $comment -Toxicity $tox -Source $SourceName -Synthetic 0 -FromRuleOnly 0
  }
}

Import-ViCTSD -Path (Join-Path $RawDir "victsd_train.csv") -SourceName "victsd_train"
Import-ViCTSD -Path (Join-Path $RawDir "victsd_valid.csv") -SourceName "victsd_valid"
Import-ViCTSD -Path (Join-Path $RawDir "victsd_test.csv") -SourceName "victsd_test"

$shynRowsPath = Join-Path $RawDir "shynbui_rows.csv"
if (Test-Path $shynRowsPath) {
  $rows = Import-Csv $shynRowsPath
  foreach ($r in $rows) {
    $comment = ""
    if ($r.PSObject.Properties.Name -contains "vi_context") { $comment = $r.vi_context }
    $tox = 0
    if ($r.PSObject.Properties.Name -contains "label") {
      $label = "$($r.label)".Trim().ToUpperInvariant()
      if ($label -in @("NEG", "TOXIC", "1", "TRUE")) { $tox = 1 }
    }
    Add-Record -Comment $comment -Toxicity $tox -Source "shynbui_rows" -Synthetic 0 -FromRuleOnly 0
  }
}

$kaggleCandidates = @(
  (Join-Path $RawDir "kaggle_toxic_comment_vietnamese.csv"),
  (Join-Path $RawDir "toxic-comment-vietnamese.csv"),
  (Join-Path $RawDir "toxic_comment_vietnamese.csv")
)

foreach ($kp in $kaggleCandidates) {
  if (Test-Path $kp) {
    $rows = Import-Csv $kp
    foreach ($r in $rows) {
      $allNames = $r.PSObject.Properties.Name
      $comment = ""
      if ($allNames -contains "comment") { $comment = $r.comment }
      elseif ($allNames -contains "text") { $comment = $r.text }
      elseif ($allNames -contains "Comment") { $comment = $r.Comment }

      $tox = 0
      if ($allNames -contains "toxic") { $tox = To-Binary $r.toxic }
      elseif ($allNames -contains "label") { $tox = To-Binary $r.label }
      elseif ($allNames -contains "Toxicity") { $tox = To-Binary $r.Toxicity }

      Add-Record -Comment $comment -Toxicity $tox -Source "kaggle" -Synthetic 0 -FromRuleOnly 0
    }
  }
}

$random = [System.Random]::new($RandomSeed)
$toxicBaseRows = $records | Where-Object { $_.toxic -eq 1 -and $_.synthetic -eq 0 }

foreach ($row in $toxicBaseRows) {
  if ($SyntheticFromToxicPerSample -ge 1) {
    $v1 = Remove-Diacritics $row.Comment
    Add-Record -Comment $v1 -Toxicity 1 -Source "aug_no_diacritic" -Synthetic 1 -FromRuleOnly 1
  }

  if ($SyntheticFromToxicPerSample -ge 2) {
    $v2 = "$($row.Comment) vl"
    Add-Record -Comment $v2 -Toxicity 1 -Source "aug_suffix_slang" -Synthetic 1 -FromRuleOnly 1
  }

  if ($SyntheticFromToxicPerSample -ge 3) {
    $v3 = [regex]::Replace($row.Comment, "\s+", " ... ")
    Add-Record -Comment $v3 -Toxicity 1 -Source "aug_noisy_spacing" -Synthetic 1 -FromRuleOnly 1
  }
}

$templates = @(
  "{0} do",
  "dm {0}",
  "{0} ngu vl",
  "cai loai {0}",
  "may la {0}",
  "im di {0}",
  "{0} nhu cc",
  "bon {0} that kinh"
)

$maxBadWords = [Math]::Min($SyntheticFromBadWordsLimit, @($badWords).Count)
for ($i = 0; $i -lt $maxBadWords; $i++) {
  $bw = $badWords[$i]
  $tpl = $templates[$random.Next(0, $templates.Count)]
  $sentence = [string]::Format($tpl, $bw)
  Add-Record -Comment $sentence -Toxicity 1 -Source "synthetic_badwords" -Synthetic 1 -FromRuleOnly 1
}

$dedup = $records |
  Group-Object Comment |
  ForEach-Object {
    $_.Group |
      Sort-Object @{ Expression = { $_.toxic }; Descending = $true }, @{ Expression = { $_.severe_toxic }; Descending = $true } |
      Select-Object -First 1
  }

$withHash = foreach ($r in $dedup) {
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
    synthetic = $r.synthetic
    rule_labeled = $r.rule_labeled
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

$exportCols = @("Comment", "Toxicity", "toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate", "source", "synthetic", "rule_labeled")

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
  synthetic_total = ($sorted | Where-Object { $_.synthetic -eq 1 }).Count
}

$stats | ConvertTo-Json | Set-Content (Join-Path $OutputDir "stats.json") -Encoding UTF8
$stats | ConvertTo-Json -Depth 3
