# Vietnamese Toxic Dataset Cleaning Report

## Applied Transformation Rules
1. lowercase text
2. unicode normalization NFC
3. emoji normalize/remove
4. remove urls emails phones
5. slang/abbreviation normalization
6. repeated character normalization
7. profanity variant normalization
8. remove special chars keep basic punctuation
9. whitespace cleanup
10. simple PhoBERT-style underscore phrases
11. label normalization to binary
12. flag suspicious/problematic samples

## Output Summary
- ViCTSD: {"train":7000,"valid":2000,"test":1000}
- vihsd: {"train":24038,"valid":2671,"test":6676}

## Problematic Samples
- Total: 443
- File: problematic_samples.json
