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
