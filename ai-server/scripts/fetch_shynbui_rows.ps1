param(
  [string]$OutputPath = "data/raw/vi/shynbui_rows.csv",
  [int]$MaxRows = 50000,
  [int]$PageSize = 100
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($PageSize -gt 100) {
  throw "PageSize must be <= 100"
}

Set-Location "$PSScriptRoot\.."
New-Item -ItemType Directory -Force -Path (Split-Path $OutputPath -Parent) | Out-Null

$base = "https://datasets-server.huggingface.co/rows?dataset=ShynBui/Vietnamese-toxic-classification&config=default&split=train"
$first = Invoke-RestMethod -Uri "$base&offset=0&length=$PageSize" -Method Get
$totalAvailable = [int]$first.num_rows_total
$totalTarget = [Math]::Min($MaxRows, $totalAvailable)

$all = New-Object System.Collections.Generic.List[object]

for ($offset = 0; $offset -lt $totalTarget; $offset += $PageSize) {
  $length = [Math]::Min($PageSize, $totalTarget - $offset)
  $url = "$base&offset=$offset&length=$length"
  $res = Invoke-RestMethod -Uri $url -Method Get

  foreach ($item in $res.rows) {
    $all.Add([PSCustomObject]@{
      vi_context = $item.row.vi_context
      label = $item.row.label
    }) | Out-Null
  }

  if (($offset % 1000) -eq 0) {
    Write-Host "Fetched $($all.Count)/$totalTarget rows"
  }
}

$all | Export-Csv $OutputPath -NoTypeInformation -Encoding UTF8
Write-Host "Saved $($all.Count) rows to $OutputPath"
