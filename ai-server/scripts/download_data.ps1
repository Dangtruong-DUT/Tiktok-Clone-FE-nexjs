param(
  [switch]$SkipEnglish,
  [switch]$SkipVietnamese
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."

New-Item -ItemType Directory -Force -Path "data/english" | Out-Null
New-Item -ItemType Directory -Force -Path "data/vietnamese" | Out-Null
New-Item -ItemType Directory -Force -Path "data/raw/vi" | Out-Null

if (-not $SkipEnglish) {
  Write-Host "Downloading English Jigsaw dataset..."

  Invoke-WebRequest -Uri "https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge/resolve/main/train.csv" -OutFile "data/english/train.csv"
  Invoke-WebRequest -Uri "https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge/resolve/main/test.csv" -OutFile "data/english/test.csv"
  Invoke-WebRequest -Uri "https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge/resolve/main/test_labels.csv" -OutFile "data/english/test_labels.csv"

  Write-Host "Preparing English train/valid/test_labeled..."
  $train = Import-Csv "data/english/train.csv"

  $md5 = New-Object System.Security.Cryptography.MD5CryptoServiceProvider
  $indexed = for ($i = 0; $i -lt $train.Count; $i++) {
    $row = $train[$i]
    $hash = [System.BitConverter]::ToString($md5.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($row.id))).Replace("-", "")
    [PSCustomObject]@{
      id = $row.id
      comment_text = $row.comment_text
      toxic = $row.toxic
      severe_toxic = $row.severe_toxic
      obscene = $row.obscene
      threat = $row.threat
      insult = $row.insult
      identity_hate = $row.identity_hate
      hash = $hash
    }
  }

  $sorted = $indexed | Sort-Object hash
  $validCount = [int]([Math]::Floor($sorted.Count * 0.1))

  $valid = $sorted | Select-Object -First $validCount
  $trainNew = $sorted | Select-Object -Skip $validCount

  $valid | Select-Object id, comment_text, toxic, severe_toxic, obscene, threat, insult, identity_hate |
    Export-Csv "data/english/valid.csv" -NoTypeInformation -Encoding UTF8

  $trainNew | Select-Object id, comment_text, toxic, severe_toxic, obscene, threat, insult, identity_hate |
    Export-Csv "data/english/train_split.csv" -NoTypeInformation -Encoding UTF8

  $test = Import-Csv "data/english/test.csv"
  $labels = Import-Csv "data/english/test_labels.csv"

  $labelMap = @{}
  foreach ($row in $labels) {
    $labelMap[$row.id] = $row
  }

  $merged = foreach ($row in $test) {
    if ($labelMap.ContainsKey($row.id)) {
      $lb = $labelMap[$row.id]
      if ($lb.toxic -ne "-1") {
        [PSCustomObject]@{
          id = $row.id
          comment_text = $row.comment_text
          toxic = $lb.toxic
          severe_toxic = $lb.severe_toxic
          obscene = $lb.obscene
          threat = $lb.threat
          insult = $lb.insult
          identity_hate = $lb.identity_hate
        }
      }
    }
  }

  $merged | Export-Csv "data/english/test_labeled.csv" -NoTypeInformation -Encoding UTF8
}

if (-not $SkipVietnamese) {
  Write-Host "Downloading Vietnamese raw sources (ViCTSD, bad words, ShynBui metadata/parquet)..."
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tarudesu/ViCTSD/main/ViCTSD_train.csv" -OutFile "data/raw/vi/victsd_train.csv"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tarudesu/ViCTSD/main/ViCTSD_valid.csv" -OutFile "data/raw/vi/victsd_valid.csv"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tarudesu/ViCTSD/main/ViCTSD_test.csv" -OutFile "data/raw/vi/victsd_test.csv"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/behitek/vietnam-sensitive-words/master/bad_words.json" -OutFile "data/raw/vi/bad_words.json"
  Invoke-WebRequest -Uri "https://huggingface.co/api/datasets/ShynBui/Vietnamese-toxic-classification" -OutFile "data/raw/vi/shynbui_meta.json"
  Invoke-WebRequest -Uri "https://huggingface.co/datasets/ShynBui/Vietnamese-toxic-classification/resolve/main/data/train-00000-of-00001.parquet" -OutFile "data/raw/vi/shynbui_train.parquet"

  Write-Host "Building labeled/normalized/augmented Vietnamese train-valid-test..."
  powershell -ExecutionPolicy Bypass -File ".\scripts\prepare_vi_labeled_dataset.ps1"
}

Write-Host "Done. Dataset files in data/english and data/vietnamese."
