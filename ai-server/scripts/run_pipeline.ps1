param(
  [string]$Python = "python",
  [string]$TrainConfig = "configs/train.yaml",
  [string]$DataConfig = "configs/data.yaml",
  [switch]$SkipEN,
  [switch]$SkipVI,
  [switch]$SkipMix
)

$env:PYTHONPATH = "."

if (-not $SkipEN) {
  & $Python -m src.training.train --stage en --train-config $TrainConfig --data-config $DataConfig
}

if (-not $SkipVI) {
  & $Python -m src.training.train --stage vi --train-config $TrainConfig --data-config $DataConfig
}

if (-not $SkipMix) {
  & $Python -m src.training.train --stage mix --train-config $TrainConfig --data-config $DataConfig
}

$bestMix = "artifacts/checkpoints/mix_stage/best"
& $Python -m src.eval.evaluate --model-path $bestMix --stage mix --train-config $TrainConfig --data-config $DataConfig --output artifacts/reports/eval_report.json
& $Python -m src.export.export_model --model-path $bestMix --train-config $TrainConfig --data-config $DataConfig --export-dir artifacts/exports/latest
& $Python -m src.infer.smoke_test --model-path artifacts/exports/latest
