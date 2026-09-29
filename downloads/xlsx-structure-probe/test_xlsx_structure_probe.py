import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

SCRIPT = Path(__file__).with_name("xlsx_structure_probe.py")
spec = importlib.util.spec_from_file_location("probe", SCRIPT)
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)
NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG = "http://schemas.openxmlformats.org/package/2006/relationships"


def make_book(path):
    workbook = f'<workbook xmlns="{NS}" xmlns:r="{REL}"><sheets><sheet name="SECRET_SITE_ALPHA" sheetId="1" state="hidden" r:id="r1"/></sheets></workbook>'
    sheet = f'''<worksheet xmlns="{NS}" xmlns:r="{REL}">
    <dimension ref="A1:C3"/><sheetViews><sheetView workbookViewId="0"><selection activeCell="AS342" sqref="AS342"/></sheetView></sheetViews>
    <cols><col min="2" max="3" hidden="1"/></cols><sheetData>
    <row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="inlineStr"><is><t>SECRET_INLINE</t></is></c></row>
    <row r="2"><c r="A2" t="inlineStr"><is><t>Subheading</t></is></c><c r="B2"><f>SECRET_FORMULA(17)</f><v>987654321</v></c></row>
    <row r="3"><c r="A3"><v>773355</v></c></row></sheetData>
    <mergeCells count="1"><mergeCell ref="A1:B1"/></mergeCells>
    <drawing r:id="draw1"/><tableParts count="1"><tablePart r:id="table1"/></tableParts></worksheet>'''
    parts = {
        "[Content_Types].xml": '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
        "xl/workbook.xml": workbook,
        "xl/_rels/workbook.xml.rels": f'<Relationships xmlns="{PKG}"><Relationship Id="r1" Type="{REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="strings" Type="{REL}/sharedStrings" Target="sharedStrings.xml"/></Relationships>',
        "xl/worksheets/sheet1.xml": sheet,
        "xl/sharedStrings.xml": f'<sst xmlns="{NS}"><si><t>SECRET_SHARED</t></si></sst>',
        "xl/worksheets/_rels/sheet1.xml.rels": f'<Relationships xmlns="{PKG}"><Relationship Id="draw1" Type="{REL}/drawing" Target="../drawings/drawing1.xml"/></Relationships>',
        "xl/drawings/drawing1.xml": '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"><xdr:pic/><c:chart/></xdr:wsDr>',
    }
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, text in parts.items():
            archive.writestr(name, text)


class StructureTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.book = self.root / "SECRET_FILENAME.xlsx"
        make_book(self.book)

    def test_metadata_and_share_allowlist(self):
        before = self.book.read_bytes()
        private, share = probe.probe(self.book, header_rows=2)
        self.assertEqual(before, self.book.read_bytes())
        sheet = private["sheets"][0]
        self.assertEqual(sheet["declared_dimension"], "A1:C3")
        self.assertEqual(sheet["active_cells"], ["AS342"])
        self.assertEqual(sheet["merged_ranges"], ["A1:B1"])
        self.assertEqual(sheet["visibility"], "hidden")
        self.assertEqual(sheet["hidden_columns"], [{"min": 2, "max": 3}])
        self.assertEqual(sheet["object_counts"], {"charts": 1, "images": 1, "tables": 1})
        self.assertEqual(sheet["header_cells"][0]["value"], "SECRET_SHARED")
        self.assertEqual(sheet["header_cells"][1]["value"], "SECRET_INLINE")
        self.assertEqual(sheet["header_cells"][-1]["formula"], "SECRET_FORMULA(17)")
        output = json.dumps(share)
        for secret in ("SECRET", "987654321", "773355", "Subheading", str(self.root)):
            self.assertNotIn(secret, output)
        self.assertEqual(share["sheets"][0]["effective_record_count"], "unknown")

    def test_header_scope_is_bounded(self):
        private, share = probe.probe(self.book, header_rows=1, max_columns=1)
        self.assertEqual(len(private["sheets"][0]["header_cells"]), 1)
        self.assertFalse(share["sheets"][0]["header_types"][0]["formula_present"])
        with self.assertRaises(probe.ProbeError):
            probe.probe(self.book, max_member_bytes=10)
        with self.assertRaises((probe.ProbeError, probe.ET.ParseError)):
            probe.probe(self.book, max_header_bytes=80)

    def test_cli_unique_directories_and_error(self):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(probe.main([str(self.book), "--header-rows", "2"]), 0)
            self.assertEqual(probe.main([str(self.book), "--header-rows", "2"]), 0)
            bad = self.root / "broken.xlsx"
            bad.write_bytes(b"not an XLSX zip")
            self.assertEqual(probe.main([str(bad)]), 1)
        folders = list(self.root.glob("xlsx_structure_*"))
        self.assertEqual(len(folders), 3)
        good = [p for p in folders if (p / "share_structure_template.json").exists()]
        failed = [p for p in folders if (p / "probe_error.txt").exists()]
        self.assertEqual(len(good), 2)
        self.assertEqual(len(failed), 1)
        self.assertFalse((failed[0] / "private_structure.json").exists())
        self.assertIn("FAILED:", (failed[0] / "probe_error.txt").read_text())
        for folder in good:
            self.assertNotIn("SECRET", (folder / "share_structure_template.json").read_text())


if __name__ == "__main__":
    unittest.main()
