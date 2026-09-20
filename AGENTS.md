# Aquifer Notes

This is Jerry's personal website. Communicate with Jerry in Chinese; keep the public articles in English.

## Attribution

Use Jerry's configured Git identity. Do not add AI tools or vendors, including Claude, Codex, or ChatGPT, as commit co-authors or append generated-by credits to commits or pull requests. Preserve legitimate human and third-party source credits, licences, and citations. References to AI tools in article content are not authorship credits and should not be removed merely for mentioning a tool.

## Article titles

Use direct, descriptive English titles that identify the software, setting, task, or problem. Avoid metaphorical headlines. Distinguish tested instructions, personal experience, and unimplemented plans. Preserve article filenames and IDs when retitling so existing links and comment associations keep working.

## Build and data

Read README.md and any available parent HANDOFF.md before changing build behaviour. The original website requires all four sibling `../outputs/book_catalog_*/data` directories. Preserve the 175-record catalogue and 7-post baseline unless Jerry explicitly requests a content change. Check complete inputs before running `python build.py`; run `node --test tests/catalogue.test.cjs` for catalogue/search validation. Refresh `artifact.html` with `python make_artifact.py` after public content changes.

The GitHub Pages original and the independent private Sites trial are separate projects. Only edit the requested target; publishing either one requires the user's publishing intent. Do not repeat completed OCR, cataloguing, or proofreading as routine maintenance.
