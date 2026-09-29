# XLSX structure probe

A small Python prototype accompanying **Deploying AI Locally** on Aquifer Notes:

https://jerryfang2026.github.io/post.html?id=2026-09-29-excel-standardisation-local-ai

Published snapshot: 29 September 2026. The script uses Python's standard library; no AI model or third-party Python packages are required. The published copy was checked with Python 3.13 using the three included synthetic test cases. The original large academic workbook has not been tested.

## Run

Save `xlsx_structure_probe.py`, open a terminal in its folder, and run:

```text
python xlsx_structure_probe.py "example.xlsx" --header-rows 8 --max-columns 80 --output-dir "probe-output"
```

The example path is a placeholder. With no input argument, the script prompts for a workbook path:

```text
python xlsx_structure_probe.py
```

It reads one explicitly selected `.xlsx` or `.xlsm` file. It does not search folders, modify the source workbook, execute macros, recalculate formulas, contact a network service or call an AI model. It creates a new result directory on each run. Without `--output-dir`, that directory is created beside the input workbook.

## Outputs

- `private_structure.json`: actual sheet names, source path, selected header-region cell values and formulas, declared dimensions, merged ranges, hidden columns, sheet visibility, selected cells and supported object counts. Keep this detailed report in the permitted local environment.
- `share_structure_template.json`: a separate fixed-field template using generated sheet/column aliases, positions, cell types and object counts. It omits source names, paths, raw cell values and formula text. It remains marked `review_required: true`: layout, counts and combinations of fields can still disclose information.

The requested first rows are a probe region, not automatically identified headers. They can contain real records. Neither output establishes permission to share data. Errors may include private filenames or paths and should be handled like the detailed report.

## Scope and limits

- Defaults: first 10 rows and 128 columns. `--header-rows` accepts 1–50; `--max-columns` accepts 1–1024.
- The default maximum uncompressed size of each required ZIP/XML member is 16 MiB. `--max-member-mb` accepts 1–64. This is a per-member limit, not the compressed workbook size.
- The header XML parse limit defaults to 1024 KiB. `--max-header-kb` accepts 1–4096. Exceeding a limit fails explicitly.
- To locate metadata after the cells, the script reads the worksheet XML bytes within that limit, removes the main cell-data container for metadata parsing, and parses selected leading rows separately. It does not scan the remaining data records to count them.
- Declared sheet dimensions and the active cell are not evidence of the last valid record. `effective_record_count` remains `unknown`.
- Common shared and inline strings are supported. Required shared-string indexes must be below 10,000. Excel number formats are not converted, so numeric date serials may appear as `number`.
- Formula text and any stored cached value are reported without calculation or freshness checks. Unsupported OOXML features can cause failure; this is not a complete Excel reader. Legacy `.xls`, `.xlsb`, encrypted workbooks, chart sheets, UTF-16 XML and XML with DTD/entity declarations are outside its supported scope.
- Object counts cover worksheet table references and DrawingML chart/picture elements. Legacy VML objects are not counted. Embedded pictures and chart source data are not extracted.

Success returns exit code 0. Failure returns 1, prints `FAILED: ...`, and writes `probe_error.txt` if a result directory has been created. A failure is not evidence that the workbook contains no data.

## Reproduce the existing tests

Keep the two Python files together and run:

```text
python -m unittest discover -s . -p test_xlsx_structure_probe.py -v
```

The three cases create synthetic OOXML fixtures in a temporary directory. They check header scope, metadata, source preservation, exclusion of sentinel values from the sharing template, unique output directories, and reported failures. Names beginning with `SECRET_` are deliberately fictional test markers.

Start with a small file you are allowed to process, compare the outputs with the workbook, and adjust the scope deliberately. The included tests do not establish compatibility with every Excel workbook or guarantee anonymisation.
