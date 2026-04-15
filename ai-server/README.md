# AI Training Pipeline (EN + VI)

Pipeline nay dung de huan luyen model phat hien toxic da nhan cho tieng Anh va tieng Viet.

Flow:

1. Chon base model multilingual (mac dinh `xlm-roberta-base`)
2. Stage `en`: warmup voi du lieu tieng Anh
3. Stage `vi`: fine-tune voi du lieu tieng Viet
4. Stage `mix`: train lai voi ratio 70% VI / 30% EN
5. Evaluate rieng EN, VI va tong hop
6. Export artifact san sang cho API inference

## Cau truc thu muc

```
ai-server/
	configs/
		train.yaml
		data.yaml
	src/
		data/
			loaders.py
			preprocess.py
		training/
			train.py
			losses.py
		eval/
			evaluate.py
		export/
			export_model.py
		infer/
			smoke_test.py
	scripts/
		download_data.ps1
		prepare_vi_labeled_dataset.ps1
		run_pipeline.ps1
	artifacts/
```

## Cai dat

Yeu cau:

- Python 3.10+
- GPU local (khuyen nghi)

Lenh cai dat:

```powershell
cd ai-server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

## Dinh dang dataset

Mac dinh pipeline doc CSV theo config `configs/data.yaml`.

Ban co the tu dong tai va tien xu ly data bang mot lenh:

```powershell
./scripts/download_data.ps1
```

De clean data cho train va ap nhan tay seed (manual override):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\clean_data_for_train.ps1
```

Nguon dang duoc cau hinh san:

- EN: `thesofakillers/jigsaw-toxic-comment-classification-challenge`
- VI: `tarudesu/ViCTSD` + `ShynBui/Vietnamese-toxic-classification` (raw parquet) + `behitek/vietnam-sensitive-words`

Nguon bo sung:

- Kaggle `trandong2932002/toxic-comment-vietnamese`: dat file CSV vao `data/raw/vi/` voi ten mot trong cac ten sau de script tu nhan:
  - `kaggle_toxic_comment_vietnamese.csv`
  - `toxic-comment-vietnamese.csv`
  - `toxic_comment_vietnamese.csv`

Sau khi chay script, cac file chinh se la:

- `data/english/train_split.csv`
- `data/english/valid.csv`
- `data/english/test_labeled.csv`
- `data/vietnamese/train.csv`
- `data/vietnamese/valid.csv`
- `data/vietnamese/test.csv`
- `data/manual/vi/manual_labels.csv`

Va raw source o:

- `data/raw/vi/victsd_train.csv`
- `data/raw/vi/victsd_valid.csv`
- `data/raw/vi/victsd_test.csv`
- `data/raw/vi/shynbui_train.parquet`
- `data/raw/vi/bad_words.json`

Cot du lieu thuc te dang dung:

- EN text: `comment_text`, nhan: `toxic`, `severe_toxic`, `obscene`, `threat`, `insult`, `identity_hate`
- VI text: `Comment`, nhan: `toxic`, `severe_toxic`, `obscene`, `threat`, `insult`, `identity_hate`

Pipeline VI da bo sung:

- Chuan hoa text
- Gan nhan weak-supervision theo tu khoa nhay cam va regex (toxic/threat/insult/obscene/identity_hate)
- Sinh them mau toxic tu augmentation va template bad words
- Tach train/valid/test deterministic (80/10/10)
- Ap manual override tu `data/manual/vi/manual_labels.csv` de sua nhan sai
- Loai bo du lieu synthetic chua duoc review khi xuat bo train cuoi

Neu ban muon chay lai rieng buoc VI labeling:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare_vi_labeled_dataset.ps1
```

Neu dataset thuc te cua ban khac ten cot, sua mapping trong `configs/data.yaml`.

## Chay train theo tung stage

```powershell
$env:PYTHONPATH = "."

python -m src.training.train --stage en --train-config configs/train.yaml --data-config configs/data.yaml
python -m src.training.train --stage vi --train-config configs/train.yaml --data-config configs/data.yaml
python -m src.training.train --stage mix --train-config configs/train.yaml --data-config configs/data.yaml
```

Checkpoint tot nhat moi stage nam o:

- `artifacts/checkpoints/en_stage/best`
- `artifacts/checkpoints/vi_stage/best`
- `artifacts/checkpoints/mix_stage/best`

## Evaluate

```powershell
python -m src.eval.evaluate \
	--model-path artifacts/checkpoints/mix_stage/best \
	--stage mix \
	--train-config configs/train.yaml \
	--data-config configs/data.yaml \
	--output artifacts/reports/eval_report.json
```

Report se co metric:

- Accuracy
- micro-F1
- macro-F1
- PR-AUC macro
- F1 theo tung label

Dong thoi tach theo subset `vi`, `en`, `all`.

## Export model

```powershell
python -m src.export.export_model \
	--model-path artifacts/checkpoints/mix_stage/best \
	--train-config configs/train.yaml \
	--data-config configs/data.yaml \
	--export-dir artifacts/exports/latest
```

Artifact export:

- `config.json`, `model.safetensors`, tokenizer files
- `label_map.json`
- `thresholds.json`
- `model_card.json`

## Smoke test inference

```powershell
python -m src.infer.smoke_test --model-path artifacts/exports/latest
```

## Chay end-to-end bang script

```powershell
./scripts/run_pipeline.ps1
```

Co the bo qua stage:

```powershell
./scripts/run_pipeline.ps1 -SkipEN
```

## Ghi chu

- Trong `configs/data.yaml`, bat `duplicate_vi_no_diacritic: true` neu muon tang robust voi slang khong dau.
- `threshold_default` trong `configs/train.yaml` la nguong mac dinh de quyet dinh label.
- Pipeline hien tai tap trung train/eval/export, chua gom API serving.
