---
title: Swap the brain, keep the body
date: 2026-09-12
category: Toolkit
summary: DeepSeek V4 Pro run inside Claude Code through its Anthropic-compatible endpoint — what the trick is, what the kit around it looks like, and an honest ledger of where the cheap brain falls short.
---

At the end of August I spent an afternoon finding out whether DeepSeek's top model could do real work — not answer trivia, but act as an agent on my computer the way Claude Code and Codex do. I pay for both of those at the top tier, so I know what the ceiling looks like. The question was not "is it good" but "is it a productivity tool", and the answer turned out to be more interesting than yes or no.

## What I had wrong going in

I went to DeepSeek's website looking for the upgrade button and could not find one. No Pro, no Max, nothing like the £180 a month I hand to Anthropic. Someone had told me "it has no front end"; someone else said it did. Both were right, and the confusion is the product model, which is the mirror image of the Western one.

The chat app, web and phone, is free — all of it, including the flagship model behind the *Expert* tab, with the small print that it is throttled at peak times, cannot search, and cannot take files. Money changes hands in exactly one place: the API, prepaid and metered per token. A friend's usage page showed 2.8 million tokens for about a pound. And until 13 August there was no official agent at all — no equivalent of Claude Code — which is what "no front end" meant. For coding you brought your own.

## The trick

DeepSeek publishes an Anthropic-compatible endpoint. Claude Code is a harness: the terminal interface, the file editing, the command execution, the permission prompts — and it talks to its model over Anthropic's protocol. Point it at DeepSeek's endpoint and the harness never notices. Four environment variables:

```
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
ANTHROPIC_AUTH_TOKEN=<your DeepSeek key>
ANTHROPIC_MODEL=deepseek-v4-pro
CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
```

The Chinese word for this is 夺舍 — a spirit taking over a body. Same body, new brain. Claude Code V4 Pro.

Two details matter more than the variables. First, isolation: the launcher sets `CLAUDE_CONFIG_DIR` to its own folder, so the possessed copy never sees my subscription login and my real Claude never sees DeepSeek — a shared config file is how you end up with the login wizard asking which account to use. Second, the harness does not recognise the model name and assumes a 200k context; V4 Pro has a million, so `CLAUDE_CODE_MAX_CONTEXT_TOKENS` tells it. Everything lives in one portable folder on D: with its own Node runtime — delete the folder and it is gone.

Around that I added the rest of the kit: DeepSeek Harness, the official open-source agent (developer preview, "everything is a plugin", a local web panel, no browser or screen control, no plugin ecosystem yet — roughly where Claude Code was two years ago); Cherry Studio as a chat shell for writing, bring-your-own-key, ignoring the built-in reseller; and Chatbox on the phone, where the App Store holds four copycats with the same name and the real one is id 6471368056.

## The honest ledger

**Text is strong, the eyes are weak.** V4 Pro is text only. Vision is a separate model with "exp" in its name, and only in the flash tier. Claude and GPT are natively multimodal; DeepSeek is not yet.

**It does not know its own name.** Asked who it was, with a picture of DeepSeek's whale-girl mascot attached, the vision model correctly identified the mascot as DeepSeek's and then insisted it was Claude, made by Anthropic. Twice. A model's identity comes from the system prompt and the training data, and with no system prompt you get the training data — which tells you what it was trained on. The lesson is old but worth repeating: never verify a model by asking who it is. Check the bill.

**Cheap sidekick, not a replacement.** On SWE-bench Verified, V4 Pro sits around 80 per cent, the open-weight best; Claude's current flagship is in the mid-nineties. The gap shows up as long-horizon autonomy — the community verdict is "don't let it run unsupervised, hand it a plan written by something better". Which is a perfectly good job description. Off-peak pricing, weekends included, is about half price, and Beijing's off-peak is a UK afternoon.

**The moat is the harness.** Everything I found impressive that afternoon was a Claude Code feature: the browser pane, the Chrome extension, taking over the screen, the permission cards, the polished desktop app around it all. Model capability can be rented for pounds a month; the experience cannot. That is the real finding.

## The rule

The API key lives in a text file next to the launcher and nowhere else — not in this post, not in the repository behind it. The rebuild instructions live off-site for the same reason. If a future self is reading this to set up a new machine: the folder is portable, the runbook exists, and the key is the one thing you type by hand.
