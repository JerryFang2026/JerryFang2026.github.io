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
