---
title: Let the agent hold the phone
date: 2026-09-06
category: Ideas
summary: An idea parked for lack of hardware — the same AI that now runs my computer should run my phone, files, apps and all, and on Android nothing stops it but the setup.
---

Over the past few weeks Claude Code has become the caretaker of this computer. It set up the new machine, stripped out what the hardware vendors had pre-installed, changed settings, moved files, worked through application forms with me. I describe the outcome; it does the clicking. Once you have lived with that for a while, the phone in your pocket starts to look neglected. It is a computer too, and a far more personal one: contacts, messages, photos, the apps I actually use every day. Why does it not have a butler?

## Where the idea came from

The first version was small: let the AI look after my contacts — deduplicate them, fix the naming, keep notes on people. Then the obvious generalisation: not just contacts, everything. Files, apps, settings, and the daily chores that are only chores because a human has to tap through them.

The obvious objection is that the AI lives on the computer and the phone is a separate device. Mirroring the screen to the PC would let the AI *see* the phone, but seeing is not touching. That objection turns out to be half right, and the half that is wrong is the interesting part.

## How the AI runs the computer, and why the phone is no different

The mechanism on the PC is a loop: take a screenshot, decide what to do, emit a structured command such as "click at these coordinates", have a small local program translate that into an operating-system input event, look again. The model never touches the mouse. A helper program does, through the same interfaces remote-desktop tools have used for decades. Where a structured view of the interface exists — the accessibility tree, or the DOM in a browser — the model reads that instead of guessing pixels, and becomes more reliable.

Nothing in that loop is specific to a mouse. A touch is an input event with coordinates; Android's `input tap` produces a MotionEvent exactly as a click does. The loop transfers.

What does not transfer is the permission to run it. On a PC, any program I launch may screenshot the screen and inject input. Phone operating systems forbid ordinary apps from doing either, because watching the screen and pressing *confirm* on the user's behalf is precisely what malware wants. The obstacle is not technical. It is a locked door, and the question becomes which doors the system provides.

## The doors, in order of usefulness

- **adb from the computer.** Android's official debugging channel. Enable wireless debugging, pair once, and the PC gets a shell with far more power than an app: install and remove apps, change settings, read and write the contacts and calendar databases, push and pull files, take screenshots, inject taps and swipes, dump the interface tree. The phone runs nothing extra. This is the phone-sized equivalent of what Claude Code already does here; scrcpy adds a live mirror with mouse control over the same channel. No root, so app-private data stays out of reach — probably the right boundary anyway.
- **The accessibility service.** The door the vendors' own "AI assistants" use. An app the user explicitly enables may read other apps' interface trees and perform gestures. Universal, slower, more fragile.
- **A terminal on the phone itself.** Termux runs a Linux userland; the agent can live there, with the Termux API for contacts, SMS, location and notifications, and Shizuku for adb-level power without a computer attached.
- **Cloud sync.** Contacts, calendar and photos already live in an account; the AI edits the cloud copy and the phone follows. Not control of the phone, but it covers a surprising share of the chores.

iOS provides none of the first three. There is no shell, no adb, and no third-party path to inject touches. What remains is the data layer through iCloud, Shortcuts triggered on the device, and — if a Mac is at hand — Apple's own iPhone Mirroring, which does allow control from the desktop but is unavailable in some regions.

## Why it is parked

I have neither an Android phone nor a Mac, and the weeks before the degree ends are spoken for. So this is a note to a future self with the right hardware: the setup is an afternoon, the tools exist, and the reason it has not been done is not that it cannot be.

Two cautions for that future self. adb is a powerful channel; keep wireless debugging off when it is not in use. And whatever the agent posts or sends on my behalf, the final *publish* should remain a human tap. The point is to stop tapping through chores, not to stop deciding.
