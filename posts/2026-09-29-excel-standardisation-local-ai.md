---
title: Deploying AI Locally
date: 2026-09-29
category: Essays
summary: My first experiments deploying AI locally with LM Studio, what offline chat and spreadsheet-image tests revealed, and the data workflows I would like to build next.
tables: true
draft: false
---

On 28 September, I switched off my computer's network connection and continued chatting with a model in LM Studio. It produced a short Python function and correctly explained a unit conversion. I knew local inference was possible, but seeing it work on my own machine made it much easier to understand.

The following evening, after thinking about the different Excel templates I encounter, my attention shifted from the model to the workflow around it. A script can work perfectly for one workbook and still be difficult to reuse. Another template moves the header, puts dates across columns, or spreads related records across several sheets.

I want to be able to ask for a particular monitoring point, parameter and date range, then receive a checked table suitable for a report. Before that can happen, the system needs a consistent understanding of the records it is being asked to retrieve.

This is a design note based on early experiments. The tests used my own non-confidential academic material and synthetic files. I have not built or validated the complete import, database and reporting workflow described below.

## A common data structure for different spreadsheets

My first thought was that every workbook would need to become the same Excel template. A more practical approach is to preserve the source files and translate their contents into a common internal structure.

Consider three fictional layouts:

| Feature | Layout A | Layout B | Layout C |
|---|---|---|---|
| Monitoring point | A column headed Point ID | A column headed Well reference | Stored in the sheet name |
| Header | First row | Below several title rows | Two header rows |
| Dates | Down a column | Down a column | Across columns |
| Organisation | One combined table | Several tables in one sheet | One sheet per point |

The input steps differ, but the resulting records can share the same fields: project, monitoring point, observation time, measurement type, original result, unit and source location.

A conversion must preserve meaning as well as layout. A blank, zero and `<0.1` are different observations. Keeping the original result alongside any parsed number and qualifier makes that distinction explicit. A familiar column heading is also insufficient evidence that two measurements use the same unit or reference basis.

I had pictured an apple-picking robot that needed a rule for every possible apple. The useful description is much smaller: where the apple is, whether it is suitable to pick, and where it can be grasped. For spreadsheets, the corresponding questions concern table boundaries, field meanings and the identity of a record.

## What I initially confused with quantisation

I connected this problem to the model I had just installed. Would a growing collection of spreadsheet rules eventually become too large? Could choosing fewer bytes for each parameter make the system manageable?

That mixed together three different ideas:

- **Standardisation:** translating different representations into agreed fields and meanings.
- **Abstraction:** reusing common operations while recording template differences in configuration or small conversion modules.
- **Model quantisation:** storing model weights at lower precision to reduce resource requirements, with a possible loss of accuracy.

[llama.cpp's quantisation documentation](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md) describes the last of these. Quantisation helps deploy a model; it does not remove duplicate business rules from a Python program.

The distinction changed the engineering question. Before worrying about the number of bytes used by a setting, I need to decide which operations can be shared. Header positions and field mappings may belong in configuration. Reading, validation and report generation can then be reused. Some unusual layouts will still need a dedicated conversion step.

## What the local AI tests actually showed

The model used in my experiments was a quantised Qwen3.8-27B. LM Studio handled the offline chat; the direct image experiment used a separate local runner. [LM Studio documents offline operation](https://lmstudio.ai/docs/app/offline) once the necessary model and runtime files are available.

For the spreadsheet experiment, I supplied nine photographs from a personal academic workbook. I did not try to photograph the entire file. The aim was to learn enough about its structure to ask better questions and prepare a targeted probe of the original workbook.

The results were mixed:

- Windows OCR processed all nine images, but missed or misread small headers, units and time intervals. A successful OCR call did not mean the table had been read correctly.
- Given the OCR text, the local model grouped some photographs incorrectly and treated a VLOOKUP button in the Excel interface as evidence of a worksheet formula.
- With three representative images supplied directly, it identified the active sheets and several useful regions. It still shifted column positions by one and read an active-cell address incorrectly.

The two routes used different inputs and prompts, so this was a diagnostic comparison rather than a controlled accuracy benchmark. I also permitted an online visual review of these non-confidential samples. The photo experiment was not a test of a completely isolated environment.

These errors suggest a limited but useful role: the model can propose a description and a list of questions. Exact addresses, formula locations and hidden content should be checked against the original file before becoming program settings.

A small Python structure probe was also prepared. It passed three synthetic test cases covering bounded header extraction, structural metadata, failure handling and a restricted sharing template. It has not yet been tested on the original large workbook. That is a useful prototype, not a completed ingestion system.

I have included the full script and a run example at the end of this post. You can also [download the Python script](https://jerryfang2026.github.io/downloads/xlsx-structure-probe/xlsx_structure_probe.py), or get the [ZIP with the script, usage notes and three synthetic tests](https://jerryfang2026.github.io/downloads/xlsx-structure-probe.zip).

## Existing tools already cover parts of the workflow

Reading the documentation helped me separate data collection, transformation, storage and reporting.

**Flowfinity** provides a documented route for Power BI to retrieve records from a configured view through its Export Automation Interface. That makes a direct connection possible; an intermediate geotechnical database is not a universal requirement. [Flowfinity's integration guide](https://www.flowfinity.com/kb/connecting-power-bi.html) explains the necessary configuration.

**gINT**, where it is already part of an established workflow, has correspondence files for mapping source fields into target tables and performing conversions. Bentley's [correspondence-file documentation](https://bentleysystems.service-now.com/community?id=kb_article&sysparm_article=KB0056913) shows that mappings for a known source format can be reused. This does not mean an arbitrary workbook will be interpreted automatically.

**Power Query** can save and repeat transformation steps. Its standard [Combine Files workflow](https://learn.microsoft.com/en-us/power-query/combine-files-overview) is intended for files with a shared schema. A collection of unrelated layouts still needs appropriate transformations before it becomes a reliable combined table.

**Power BI** can then provide the analytical model and interactive views. For a complete table that must run across multiple PDF pages, [paginated reports](https://learn.microsoft.com/en-us/power-bi/explore-reports/end-user-paginated-report) are a more relevant feature to investigate than a screenshot of a scrolling visual.

These are documented capabilities, not integrations I have tested. My proposed sequence is:

```text
Preserved source files
    -> structure checks and confirmed mappings
    -> standard records and validation results
    -> approved data store and analytical model
    -> filters, charts and report tables
```

Unresolved records would remain visible in an exception report. The input process should account for each relevant source record, including anything rejected or awaiting clarification.

## Where AI could save effort

For a familiar template, a validated mapping and ordinary Python or Power Query steps may be enough. There is little benefit in asking a model to rediscover the same layout every time.

For an unfamiliar template, an approved AI tool could suggest table boundaries, candidate field mappings and a conversion method. A person would confirm the meaning, the program would check the structure, and the accepted mapping could be saved. Later files would still need checks for changed headers, units or layout.

The same division of work applies to a conversational interface. A fictional request might be:

> Show the methane observations for Point A in Project X from 2021 through 2025, and prepare a report table.

The AI could translate that sentence into explicit filters. Tested code would query the permitted records and apply the report layout. The interface would need to resolve whether “observations” means every reading, a selected reading per visit, or an aggregate. It should show the chosen interpretation, date boundaries, record count and any exclusions.

Power BI already has Copilot features, and Microsoft's [model-preparation tutorial](https://learn.microsoft.com/en-us/power-bi/create-reports/tutorial-copilot-power-bi-prepare-model) makes clear how much depends on the underlying semantic model. Access would depend on the organisation's environment. A separate local assistant would be another design to investigate, not a model address that can simply be substituted for native Copilot.

The filters and report generator should also work through an ordinary form. Natural language would make them easier to access; the data definitions and calculations would remain independently testable.

## Keeping the information boundary explicit

My immediate reason for exploring local AI is narrower than building a complete office assistant. I want help describing a file's structure without spending an evening explaining every header and region to a coding assistant.

A future workflow might let a local model inspect material in an approved environment, then prepare a generic structure description for review. Real field mappings and full records would stay in that environment. An online coding assistant could work from permitted descriptions and synthetic examples.

One result from the academic experiment matters here: a model-generated sharing draft retained a real workbook title despite an instruction to remove identifying details. Free-form rewriting is not sufficient evidence of anonymisation. A fixed set of permitted fields, local checks and human review would be necessary; even structural details may reveal information.

Offline operation also does not establish permission to photograph or transfer work material, and it does not remove saved chats, logs or output files. Those questions belong in the design before confidential information enters the system.

## The next experiment should be small

I want to start with three synthetic workbooks that express the same observations in different layouts. Each would have a confirmed mapping into one record structure. A shared program would validate the records and produce the same expected report.

The test should include a changed header, a duplicate import, an unknown unit, a missing value and a qualified result. It should measure whether records are preserved correctly and how much intervention a new template requires. Only then would I add an AI proposal step and compare the time needed to review it against manual configuration.

That full experiment remains to be built. The offline model is working, the early visual tests have exposed concrete errors, and the structure probe has only synthetic validation so far.

My useful discovery is that a reusable workflow starts with an agreed meaning for a record. Once that is clear, each new template becomes a conversion problem with checks, and each report becomes a query over known data. That gives me a much more specific thing to build next.

## Workbook structure probe: code and usage

This is the complete prototype used in the synthetic checks above. It uses Python's standard library and needs no model or extra packages. Save it as `xlsx_structure_probe.py` and run it against one workbook you are permitted to process:

```text
python xlsx_structure_probe.py "example.xlsx" --header-rows 8 --max-columns 80 --output-dir "probe-output"
```

Replace `example.xlsx` with your file. Without arguments, the script asks for a path. Each run creates a separate output directory and leaves the original workbook unchanged.

- `private_structure.json` contains real sheet names, paths, selected cell values and formulas. Keep it in the permitted local environment.
- `share_structure_template.json` contains generated aliases and selected structural fields. Review it before sharing: removing raw values does not guarantee that layout or counts are harmless to disclose.

The first rows are a requested probe region, not automatically detected headers. Declared dimensions do not establish a valid record count. The script reads bounded worksheet XML to obtain metadata, but does not scan all data records. Defaults limit each required uncompressed XML member to 16 MiB and header parsing to 1024 KiB, so a large workbook can be rejected. It does not recalculate formulas, convert Excel date formats, or support `.xls`, `.xlsb`, encrypted files and every OOXML feature. The original large workbook is still untested.

[Download the script](https://jerryfang2026.github.io/downloads/xlsx-structure-probe/xlsx_structure_probe.py) or the [complete ZIP](https://jerryfang2026.github.io/downloads/xlsx-structure-probe.zip). The [usage notes](https://jerryfang2026.github.io/downloads/xlsx-structure-probe/README.md) explain the parameters and limits; the [three synthetic tests](https://jerryfang2026.github.io/downloads/xlsx-structure-probe/test_xlsx_structure_probe.py) can be run with:

```text
python -m unittest discover -s . -p test_xlsx_structure_probe.py -v
```

Keep both Python files in the same folder to run the tests. The published copy was checked with Python 3.13. This code performs local file inspection; it does not call an AI or send data over the network.

### Complete Python script

```python
"""Read-only OOXML structure probe; standard library only. Never recalculates cells."""
import argparse
import io
import json
import posixpath
import re
import sys
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET

RID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
CELL = re.compile(r"^\$?([A-Z]{1,3})\$?([1-9][0-9]*)$")
MAX_STRINGS = 10000


class ProbeError(Exception):
    pass


def local(tag):
    return tag.rsplit("}", 1)[-1]


def bounds(ref):
    result = []
    for address in ref.split(":"):
        match = CELL.fullmatch(address)
        if not match:
            return None
        column = 0
        for letter in match[1]:
            column = column * 26 + ord(letter) - 64
        row = int(match[2])
        if column > 16384 or row > 1048576:
            return None
        result.append({"row": row, "column": column})
    return result if len(result) in (1, 2) else None


class Package:
    def __init__(self, archive, max_bytes):
        self.archive, self.max_bytes = archive, max_bytes
        names = archive.namelist()
        if len(names) > 10000 or len(names) != len(set(names)):
            raise ProbeError("Too many ZIP members or duplicate member names.")

    def read(self, name):
        info = self.archive.getinfo(name)
        if info.file_size > self.max_bytes:
            raise ProbeError(f"Member exceeds byte limit: {name}")
        data = self.archive.read(name)
        if b"<!DOCTYPE" in data.upper() or b"<!ENTITY" in data.upper():
            raise ProbeError(f"DTD/entity declarations are unsupported: {name}")
        if b"\x00" in data[:100]:
            raise ProbeError(f"UTF-16 XML is unsupported: {name}")
        return data

    def xml(self, name):
        return ET.fromstring(self.read(name))

    def relationships(self, part):
        folder, filename = posixpath.split(part)
        name = posixpath.join(folder, "_rels", filename + ".rels")
        if name not in self.archive.namelist():
            return {}
        result = {}
        for rel in self.xml(name):
            external = rel.get("TargetMode") == "External"
            target = rel.get("Target", "")
            resolved = posixpath.normpath(posixpath.join(folder, target))
            if target.startswith("/"):
                resolved = target.lstrip("/")
            if resolved.startswith("../") or "\\" in resolved:
                raise ProbeError("Invalid internal relationship target.")
            result[rel.get("Id")] = (rel.get("Type", "").rsplit("/", 1)[-1],
                                      None if external else resolved)
        return result


def sheet_metadata(data):
    opening = re.search(rb"<((?:[\w.-]+:)?sheetData)\b[^>]*>", data)
    if not opening:
        raise ProbeError("Worksheet has no supported sheetData element.")
    if opening[0].rstrip().endswith(b"/>"):
        return ET.fromstring(data)
    closing = data.rfind(b"</" + opening[1] + b">")
    if closing < opening.end():
        raise ProbeError("Worksheet sheetData closing tag is missing.")
    # Locate the container boundary; never parse body cells for metadata.
    return ET.fromstring(data[:opening.start()] +
                         b"<" + opening[1] + b"/>" + data[closing + len(opening[1]) + 3:])


def headers(data, row_limit, column_limit, byte_limit):
    rows, pending = [], set()
    completed = False
    for event, element in ET.iterparse(io.BytesIO(data[:byte_limit]), events=("start", "end")):
        tag = local(element.tag)
        if event == "start" and tag == "row" and int(element.get("r", "0")) > row_limit:
            completed = True
            break
        if event == "end" and tag == "sheetData":
            completed = True
            break
        if event != "end" or tag != "row":
            continue
        row_number = int(element.get("r", "0"))
        if not 1 <= row_number <= row_limit:
            raise ProbeError("Header row has a missing/invalid row number.")
        for cell in element:
            if local(cell.tag) != "c":
                continue
            address = cell.get("r", "")
            location = bounds(address)
            if not location or len(location) != 1:
                raise ProbeError("Header cell has a missing/invalid address.")
            if location[0]["column"] > column_limit:
                continue
            xml_type = cell.get("t", "n")
            value = next((e.text or "" for e in cell if local(e.tag) == "v"), None)
            formula = next((e.text or "" for e in cell if local(e.tag) == "f"), None)
            if xml_type == "inlineStr":
                value = "".join(e.text or "" for e in cell.iter() if local(e.tag) == "t")
            kind = {"s": "text", "inlineStr": "text", "str": "text", "n": "number",
                    "b": "boolean", "e": "error", "d": "date"}.get(xml_type, "unknown")
            if value is None:
                kind = "blank"
            record = {"address": address, "row": row_number, "column": location[0]["column"],
                      "type": kind, "xml_type": xml_type, "value": value, "formula": formula,
                      "style_index": cell.get("s")}
            if xml_type == "s" and value is not None:
                record["shared_index"] = int(value)
                pending.add(int(value))
            rows.append(record)
        element.clear()
    if not completed:
        raise ProbeError("Header byte limit reached before the requested scope was complete.")
    return rows, pending


def resolve_strings(package, records, wanted, part):
    if not wanted:
        return
    if not part or min(wanted) < 0 or max(wanted) >= MAX_STRINGS:
        raise ProbeError("Required shared strings exceed scope or have no part.")
    found, index = {}, 0
    for event, element in ET.iterparse(io.BytesIO(package.read(part)), events=("end",)):
        if local(element.tag) != "si":
            continue
        if index in wanted:
            found[index] = "".join(e.text or "" for e in element.iter() if local(e.tag) == "t")
        index += 1
        element.clear()
        if len(found) == len(wanted):
            break
    if set(found) != wanted:
        raise ProbeError("Some header shared-string references could not be resolved.")
    for record in records:
        if "shared_index" in record:
            record["value"] = found[record.pop("shared_index")]


def probe(path, header_rows=10, max_columns=128, max_member_bytes=16 * 1024 * 1024,
          max_header_bytes=1024 * 1024):
    path = Path(path)
    if path.suffix.lower() not in (".xlsx", ".xlsm"):
        raise ProbeError("Input must be one explicitly selected .xlsx or .xlsm file.")
    if not 1 <= header_rows <= 50 or not 1 <= max_columns <= 1024:
        raise ProbeError("header_rows must be 1..50; max_columns must be 1..1024.")
    limits = {"header_rows": header_rows, "max_columns": max_columns,
              "max_member_bytes": max_member_bytes, "max_header_bytes": max_header_bytes,
              "max_shared_string_index_exclusive": MAX_STRINGS,
              "data_rows": "not_scanned", "effective_record_count": "unknown",
              "object_scope": "worksheet_tablePart_and_DrawingML_chart_pic_only"}
    private = {"status": "complete_for_requested_scope", "source_path": str(path.resolve()),
               "limits": limits, "sheets": []}
    share = {"review_required": True, "limits": dict(limits), "sheets": []}
    with zipfile.ZipFile(path, "r") as archive:
        package = Package(archive, max_member_bytes)
        book = package.xml("xl/workbook.xml")
        relations = package.relationships("xl/workbook.xml")
        shared = next((target for kind, target in relations.values() if kind == "sharedStrings"), None)
        for index, item in enumerate(book.findall(".//{*}sheet"), 1):
            kind, target = relations.get(item.get(RID), ("", None))
            if kind != "worksheet" or not target:
                raise ProbeError("Unsupported/non-local sheet relationship.")
            data = package.read(target)
            metadata = sheet_metadata(data)
            cells, wanted = headers(data, header_rows, max_columns, max_header_bytes)
            resolve_strings(package, cells, wanted, shared)
            merges = [e.get("ref", "") for e in metadata.iter() if local(e.tag) == "mergeCell"]
            hidden = [{"min": int(e.get("min", "0")), "max": int(e.get("max", "0"))}
                      for e in metadata.iter() if local(e.tag) == "col" and e.get("hidden") in ("1", "true")]
            selections = [e.get("activeCell") for e in metadata.iter()
                          if local(e.tag) == "selection" and e.get("activeCell")]
            dimensions = next((e.get("ref") for e in metadata.iter() if local(e.tag) == "dimension"), None)
            objects = {"charts": 0, "images": 0,
                       "tables": sum(local(e.tag) == "tablePart" for e in metadata.iter())}
            notes = []
            sheet_rels = package.relationships(target)
            for e in metadata.iter():
                if local(e.tag) == "legacyDrawing":
                    notes.append("Legacy/VML objects are not counted.")
                if local(e.tag) != "drawing":
                    continue
                drawing_kind, drawing_target = sheet_rels.get(e.get(RID), ("", None))
                if drawing_kind != "drawing" or not drawing_target:
                    raise ProbeError("Unresolved/non-local drawing relationship.")
                for obj in package.xml(drawing_target).iter():
                    if local(obj.tag) == "chart":
                        objects["charts"] += 1
                    if local(obj.tag) == "pic":
                        objects["images"] += 1
            visibility = item.get("state", "visible")
            visibility = visibility if visibility in ("visible", "hidden", "veryHidden") else "unknown"
            private["sheets"].append({"name": item.get("name"), "visibility": visibility,
                "declared_dimension": dimensions, "effective_record_count": "unknown",
                "header_cells": cells, "merged_ranges": merges, "hidden_columns": hidden,
                "active_cells": selections, "object_counts": objects, "limitations": notes})
            # Fixed whitelist: no names, paths, values, formula text, hashes, or images.
            share["sheets"].append({"alias": f"sheet_{index:03d}", "visibility": visibility,
                "declared_layout": bounds(dimensions) if dimensions else None,
                "merged_layout": [bounds(ref) for ref in merges],
                "hidden_column_spans": [{"first": f"column_{h['min']:03d}",
                                        "last": f"column_{h['max']:03d}"} for h in hidden],
                "active_positions": [bounds(ref) for ref in selections],
                "header_types": [{"row": c["row"], "column_alias": f"column_{c['column']:03d}",
                                  "type": c["type"], "formula_present": c["formula"] is not None}
                                 for c in cells],
                "object_counts": dict(objects), "limitations": list(notes),
                "effective_record_count": "unknown"})
    return private, share


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", nargs="?")
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--header-rows", type=int, default=10)
    parser.add_argument("--max-columns", type=int, default=128)
    parser.add_argument("--max-member-mb", type=int, default=16)
    parser.add_argument("--max-header-kb", type=int, default=1024)
    args = parser.parse_args(argv)
    entered = args.input or input("Workbook path (.xlsx/.xlsm): ").strip().strip('"')
    path = Path(entered).expanduser()
    base = args.output_dir or path.resolve().parent
    output = None
    try:
        base.mkdir(parents=True, exist_ok=True)
        output = Path(tempfile.mkdtemp(prefix="xlsx_structure_" +
                      datetime.now().strftime("%Y%m%d_%H%M%S_"), dir=base))
        if not 1 <= args.max_member_mb <= 64 or not 1 <= args.max_header_kb <= 4096:
            raise ProbeError("Member limit must be 1..64 MB; header limit must be 1..4096 KB.")
        private, share = probe(path, args.header_rows, args.max_columns,
                               args.max_member_mb * 1024 * 1024, args.max_header_kb * 1024)
        for name, value in (("private_structure.json", private),
                            ("share_structure_template.json", share)):
            with (output / name).open("x", encoding="utf-8") as handle:
                json.dump(value, handle, ensure_ascii=False, indent=2)
        print(f"Saved: {output}\nPrivate results stay local. Review the share template manually.")
        return 0
    except Exception as exc:
        print(f"FAILED: {type(exc).__name__}: {exc}", file=sys.stderr)
        if output:
            (output / "probe_error.txt").write_text(f"FAILED: {type(exc).__name__}: {exc}\n",
                                                   encoding="utf-8")
        return 1


if __name__ == "__main__":
    sys.exit(main())
```
