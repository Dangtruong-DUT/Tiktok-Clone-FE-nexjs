param(
  [string]$InputRoot = "data/raw",
  [string]$OutputRoot = "data/processed"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."
New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null

# Clean legacy outputs so each run keeps a consistent structure.
foreach ($legacy in @("ViCTSD", "vihsd", "all.cleaned.csv")) {
  $legacyPath = Join-Path $OutputRoot $legacy
  if (Test-Path $legacyPath) {
    Remove-Item -Recurse -Force $legacyPath
  }
}

$slangRules = @(
  @{ pattern = "\bko\b"; replacement = "khong" },
  @{ pattern = "\bk\b"; replacement = "khong" },
  @{ pattern = "\bkg\b"; replacement = "khong" },
  @{ pattern = "\bhok\b"; replacement = "khong" },
  @{ pattern = "\bmn\b"; replacement = "moi nguoi" },
  @{ pattern = "\bmng\b"; replacement = "moi nguoi" },
  @{ pattern = "\btui\b"; replacement = "toi" },
  @{ pattern = "\bthik\b"; replacement = "thich" },
  @{ pattern = "\bthix\b"; replacement = "thich" },
  @{ pattern = "\br\b"; replacement = "roi" },
  @{ pattern = "\bvl\b"; replacement = "vai" },
  @{ pattern = "\bvkl\b"; replacement = "vai" },
  @{ pattern = "\bvcl\b"; replacement = "vai" },
  @{ pattern = "\bvcc\b"; replacement = "vai" }
)

$profanityRules = @(
  @{ pattern = "\b[dD][mM]+\b"; replacement = "dit me" },
  @{ pattern = "\b[dD][cC][mM]+\b"; replacement = "dit me" },
  @{ pattern = "\b[dD]i[tjTJ]+\b"; replacement = "dit" },
  @{ pattern = "\blo+z+\b"; replacement = "lon" },
  @{ pattern = "\blon\b"; replacement = "lon" }
)

$underscorePhrases = @(
  "dit me",
  "moi nguoi",
  "tuc gian"
)

function Normalize-Text {
  param([string]$Text)

  $t = if ($null -eq $Text) { "" } else { "$Text" }
  $t = $t.Normalize([Text.NormalizationForm]::FormC)
  $t = $t.ToLowerInvariant()

  # Replace key emojis with semantic tokens and remove the rest in supplementary plane.
  $t = $t.Replace([string][char]0x2764, " emoji_love ")
  $t = [regex]::Replace($t, "[\uD800-\uDBFF][\uDC00-\uDFFF]", " emoji ")

  $t = [regex]::Replace($t, "https?://\S+|www\.\S+", " ")
  $t = [regex]::Replace($t, "\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b", " ")
  $t = [regex]::Replace($t, "\b(?:\+?84|0)(?:[\s\.-]?\d){8,10}\b", " ")

  foreach ($rule in $slangRules) {
    $t = [regex]::Replace($t, $rule.pattern, $rule.replacement, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  }

  $t = [regex]::Replace($t, "([\p{L}])\1{2,}", '$1$1')

  foreach ($rule in $profanityRules) {
    $t = [regex]::Replace($t, $rule.pattern, $rule.replacement, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  }

  # Keep letters, numbers, whitespace and basic punctuation.
  $t = [regex]::Replace($t, "[^\p{L}\p{Nd}\s\.,!?;:\(\)_-]", " ")
  $t = [regex]::Replace($t, "\s+", " ").Trim()

  foreach ($phrase in $underscorePhrases) {
    $target = $phrase.Replace(" ", "_")
    $t = [regex]::Replace($t, "\b$([regex]::Escape($phrase))\b", $target)
  }

  return $t
}

function Get-Column {
  param(
    [string[]]$Columns,
    [string[]]$Candidates
  )
  foreach ($c in $Candidates) {
    if ($Columns -contains $c) { return $c }
  }
  return $null
}

function Convert-Label {
  param(
    $Raw,
    [string]$LabelColumn
  )

  if ($null -eq $Raw -or "$Raw".Trim() -eq "") {
    return [PSCustomObject]@{ label = $null; issue = "missing_label" }
  }

  $issue = $null
  $value = $null
  $isInt = [int]::TryParse("$Raw", [ref]$value)
  if (-not $isInt) {
    $x = "$Raw".Trim().ToLowerInvariant()
    if ($x -in @("toxic", "hate", "offensive", "true", "yes")) { $value = 1 }
    elseif ($x -in @("normal", "clean", "false", "no")) { $value = 0 }
    else {
      return [PSCustomObject]@{ label = $null; issue = "non_numeric_label" }
    }
  }

  if ($LabelColumn -eq "label_id") {
    if ($value -notin @(0, 1, 2)) { $issue = "unexpected_label_id_range" }
    $value = if ($value -gt 0) { 1 } else { 0 }
  } else {
    if ($value -notin @(0, 1)) {
      $issue = "label_out_of_range_binary"
      $value = if ($value -gt 0) { 1 } else { 0 }
    }
  }

  return [PSCustomObject]@{ label = [int]$value; issue = $issue }
}

function Contains-Profanity {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return $false }
  return [regex]::IsMatch($Text, "\b(lon|dit|dit_me)\b")
}

$datasets = @("ViCTSD", "vihsd")
$splits = @("train", "valid", "test")

$problematic = New-Object System.Collections.Generic.List[object]
$summary = @{}
$splitBuckets = @{}
foreach ($sp in $splits) {
  $splitBuckets[$sp] = New-Object System.Collections.Generic.List[object]
}

foreach ($ds in $datasets) {
  $summary[$ds] = @{}

  foreach ($sp in $splits) {
    $inPath = Join-Path (Join-Path $InputRoot $ds) "$sp.csv"
    if (-not (Test-Path $inPath)) { continue }

    $rows = Import-Csv $inPath
    if ($rows.Count -eq 0) { continue }

    $columns = $rows[0].PSObject.Properties.Name
    $textCol = Get-Column -Columns $columns -Candidates @("sentences", "sentence", "Comment", "comment", "free_text", "text", "content")
    $labelCol = Get-Column -Columns $columns -Candidates @("toxic", "Toxicity", "label", "label_id", "target")
    if ($null -eq $textCol -or $null -eq $labelCol) {
      throw "Cannot detect columns in $inPath"
    }

    $cleanRows = New-Object System.Collections.Generic.List[object]
    $rowIndex = 0
    foreach ($r in $rows) {
      $rawText = "$($r.$textCol)"
      $conv = Convert-Label -Raw $r.$labelCol -LabelColumn $labelCol
      $cleanText = Normalize-Text $rawText

      if ($null -ne $conv.issue) {
        $problematic.Add([PSCustomObject]@{
          dataset = $ds
          split = $sp
          row_index = $rowIndex
          issue_type = $conv.issue
          original_text = $rawText
          cleaned_text = $cleanText
          original_label = "$($r.$labelCol)"
          final_label = $conv.label
        }) | Out-Null
      }

      if ([string]::IsNullOrWhiteSpace($cleanText)) {
        $problematic.Add([PSCustomObject]@{
          dataset = $ds
          split = $sp
          row_index = $rowIndex
          issue_type = "empty_after_clean"
          original_text = $rawText
          cleaned_text = $cleanText
          original_label = "$($r.$labelCol)"
          final_label = $conv.label
        }) | Out-Null
        $rowIndex += 1
        continue
      }

      if ($null -eq $conv.label) {
        $rowIndex += 1
        continue
      }

      $tokenCount = @($cleanText.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)).Count
      if ($tokenCount -lt 2 -and $conv.label -eq 1) {
        $problematic.Add([PSCustomObject]@{
          dataset = $ds
          split = $sp
          row_index = $rowIndex
          issue_type = "very_short_but_toxic"
          original_text = $rawText
          cleaned_text = $cleanText
          original_label = "$($r.$labelCol)"
          final_label = $conv.label
        }) | Out-Null
      }

      if ((Contains-Profanity -Text $cleanText) -and $conv.label -eq 0) {
        $problematic.Add([PSCustomObject]@{
          dataset = $ds
          split = $sp
          row_index = $rowIndex
          issue_type = "contains_profanity_but_label_0"
          original_text = $rawText
          cleaned_text = $cleanText
          original_label = "$($r.$labelCol)"
          final_label = $conv.label
        }) | Out-Null
      }

      $obj = [PSCustomObject]@{
        sentences = $cleanText
        toxic = [int]$conv.label
        dataset = $ds
        split = $sp
      }
      $cleanRows.Add($obj) | Out-Null
      $splitBuckets[$sp].Add($obj) | Out-Null
      $rowIndex += 1
    }

    $group = $cleanRows | Group-Object sentences
    foreach ($g in $group) {
      $labels = @($g.Group | Select-Object -ExpandProperty toxic | Select-Object -Unique)
      if ($labels.Count -gt 1) {
        foreach ($rr in $g.Group) {
          $problematic.Add([PSCustomObject]@{
            dataset = $ds
            split = $sp
            row_index = -1
            issue_type = "duplicate_conflicting_labels"
            original_text = $rr.sentences
            cleaned_text = $rr.sentences
            original_label = $rr.toxic
            final_label = $rr.toxic
          }) | Out-Null
        }
      }
    }

    $summary[$ds][$sp] = $cleanRows.Count
  }
}

$cleanedRoot = Join-Path $OutputRoot "cleaned"
New-Item -ItemType Directory -Force -Path $cleanedRoot | Out-Null
foreach ($sp in $splits) {
  $outPath = Join-Path $cleanedRoot "$sp.clean.csv"
  $splitBuckets[$sp] | Select-Object sentences, toxic | Export-Csv $outPath -NoTypeInformation -Encoding UTF8
}

$problemPath = Join-Path $OutputRoot "problematic_samples.json"
$problematic | ConvertTo-Json -Depth 5 | Set-Content $problemPath -Encoding UTF8

$rules = @(
  "lowercase text",
  "unicode normalization NFC",
  "emoji normalize/remove",
  "remove urls emails phones",
  "slang/abbreviation normalization",
  "repeated character normalization",
  "profanity variant normalization",
  "remove special chars keep basic punctuation",
  "whitespace cleanup",
  "simple PhoBERT-style underscore phrases",
  "label normalization to binary",
  "flag suspicious/problematic samples"
)

$report = [PSCustomObject]@{
  summary = $summary
  total_problematic_samples = $problematic.Count
  applied_rules = $rules
}

$reportJsonPath = Join-Path $OutputRoot "cleaning_report.json"
$report | ConvertTo-Json -Depth 8 | Set-Content $reportJsonPath -Encoding UTF8

$reportMdPath = Join-Path $OutputRoot "cleaning_report.md"
$md = @()
$md += "# Vietnamese Toxic Dataset Cleaning Report"
$md += ""
$md += "## Applied Transformation Rules"
for ($i = 0; $i -lt $rules.Count; $i++) {
  $md += "{0}. {1}" -f ($i + 1), $rules[$i]
}
$md += ""
$md += "## Output Summary"
foreach ($k in $summary.Keys) {
  $md += "- ${k}: $($summary[$k] | ConvertTo-Json -Compress)"
}
$md += ""
$md += "## Problematic Samples"
$md += "- Total: $($problematic.Count)"
$md += "- File: problematic_samples.json"
$md | Set-Content $reportMdPath -Encoding UTF8

Write-Output "Done. Output root: $OutputRoot"
Write-Output "Problematic samples: $($problematic.Count)"
