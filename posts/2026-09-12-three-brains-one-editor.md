---
title: Three brains, one editor
date: 2026-09-12
category: Toolkit
summary: How I split the work inside VS Code — Copilot for the free autocomplete, Claude Code for the heavy lifting, DeepSeek as the cheap sidekick through a bring-your-own-key door — and the afternoon a Windows sandbox made a config file lie to me.
---

The GitHub Student pack comes with Copilot, and I assumed that meant "unlimited AI chat in the editor". It does not. Working out what it actually means, and what to plug in around it, took a day; most of that day went into one bug that had nothing to do with AI at all.

## What the student plan actually is

Since 1 June 2026 Copilot bills chat and agent work in *AI credits*. One credit is one US cent. The student plan gets 200 a month — two dollars. Every message and every agent step costs tokens multiplied by the model's list price, and the expensive models cost about twenty-five times the cheap ones. People on the community forum reported burning the whole month on the first day, in Agent mode, without doing anything unusual.

On the student plan the model picker shows *Auto* and three locked entries marked *Upgrade*. You cannot choose the cheap model; Auto chooses for you, and Auto is allowed to pick the expensive one.

What is free and unlimited on every plan: inline completions — the grey text that appears while you type — and next-edit suggestions. So the honest description is this: Copilot Student is an excellent free autocomplete with a two-dollar chat allowance stapled to it. Treat the chat as a trial and the autocomplete as the product.

## Bring your own brain

VS Code will take any OpenAI- or Anthropic-compatible endpoint and put it in the same chat panel. The provider bills you directly; Copilot's credits are untouched; it works even without a Copilot plan. DeepSeek V4 has an OpenAI-compatible endpoint, a one-million-token context window, working tool calls (so Agent mode works), and a price between twenty cents and a little over a dollar per million tokens depending on the tier and the time of day.

One detail is worth knowing before you start. The key goes into VS Code's secret store through the *Manage Language Models → Add Models → Custom Endpoint* dialog; the config file that appears afterwards holds only a reference to it, something like `${input:chat.lm.secret.…}`. Writing the key into that file as plain text does nothing — VS Code reads every key field as a reference and looks it up. I read the source to be sure, after a runbook I had written earlier told me otherwise.

For the work that needs judgement I use the official Claude Code extension, signed in with the subscription I already pay for. It is its own panel, not the Copilot chat, and it edits files, runs commands and shows diffs the same way the terminal version does.

## The division of labour

| Job | Tool | Cost |
|---|---|---|
| Typing code | Copilot autocomplete | free |
| Multi-file changes, running scripts, anything needing judgement | Claude Code extension | subscription |
| Bulk, cheap, low-stakes questions | DeepSeek V4 in the Copilot chat panel | pennies |
| Copilot's own models | Auto only | two dollars a month, kept for emergencies |

Three test tasks on DeepSeek — a question, an agent run that created and executed a script, a file summary — cost less than a penny between them. Once the configuration was in the file VS Code actually reads, everything worked first time. That last clause is the story.

## The afternoon the file lied

For two hours the setup "did not work": the models never appeared in the picker. I checked everything I could think of. The extension had registered the provider. The student plan allowed bring-your-own-key. The key was in the secret store. The JSON was valid — I went as far as extracting VS Code's own parser from its minified bundle and running it on my file with a portable Node; it parsed. Trace logs showed the provider resolving to an empty list eleven times and never once asking for the key.

The break came when the human half of this operation re-ran the Add Models dialog and the editor opened a file whose contents differed from the one I was reading on disk. Same path, two different files.

The Claude desktop app I was working from is an MSIX package from the Microsoft Store. Windows gives packaged apps a copy-on-write view of AppData: anything the app — or a shell it spawns — writes under `%APPDATA%` lands in a private shadow folder under `Packages\…\LocalCache`. Reads fall through to the real file only until you have written your own copy; after that you only ever see your copy. VS Code, unpackaged, reads the real file. My agent had spent the afternoon editing a file nobody else on the machine could see, then re-reading it to confirm success.

The fix took thirty seconds: put the configuration on the clipboard, paste it into VS Code's own editor, save. The models appeared in the same second the log recorded the save.

Three lessons, in order of how much they cost me:

1. Let the program that owns a configuration write it. Pasting into its editor beats writing the file from outside.
2. Verify through that program's eyes — its logs, its UI — never by re-reading the file you just wrote.
3. If an agent runs inside a Store app, assume AppData is virtualised. The Claude Code extension inside VS Code is not affected; the desktop app is.

## Small things that bit

- A hand-written `settings.json` with single backslashes in a Windows path: VS Code read `C:\Users` as `C:sers`. Use forward slashes.
- Open the folder, not a single file, or the workspace settings are silently ignored.
- Agent mode will happily edit whatever file is auto-attached to your question. Detach it first; press *Undo* when it does anyway.
- Autocomplete needs a keystroke to wake up, and a Chinese input method eats some of its shortcuts.

## What I would tell myself a week ago

Read the billing page before the feature page. A student plan is a free autocomplete, not a free assistant. And the most expensive bug of the week was not in any configuration; it was in trusting my own view of the file system.
