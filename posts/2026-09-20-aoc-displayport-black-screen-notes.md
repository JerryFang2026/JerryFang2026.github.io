---
title: AOC DisplayPort black screens at startup and after idle: an unresolved case
date: 2026-09-20
category: Toolkit
summary: A night of testing an AOC monitor that would go black at startup or fail to recover after the screen turned off. The cause is still unknown; a different startup sequence and manual sleep currently let me use the computer.
---

I spent most of a night trying to understand why my main monitor would not reliably show a picture. I have not found the cause. This is a record of the observations, the unsuccessful attempts, and the routines that currently let me use the computer. I am leaving the remaining investigation for another day.

## The setup

- Main display: AOC AG276QZD2, connected by DisplayPort. Windows reported 2560 × 1440 at 280 Hz during the checks.
- Second display: Dell P2419H, 1920 × 1080 at 60 Hz. It originally used DisplayPort and now uses HDMI.
- Graphics card: MSI GeForce RTX 5070 Ti, running Windows 11. The NVIDIA driver checked and reinstalled during this investigation was 616.92.

Both displays connect to the graphics card. I later disabled the AMD integrated graphics in Device Manager and have kept it disabled for the current working setup.

## What the black screen looked like

Sometimes the MSI startup logo appeared on the Dell, followed by a black screen. Disconnecting the AOC's DP cable could make the Windows login screen appear on the Dell immediately. Reconnecting the AOC sometimes restored its picture; the monitor would display its DP input label and then the desktop.

That sequence made me suspect an issue with establishing the display connection. But it was inconsistent. Moving to another port appeared to help for several starts, then failed again. Earlier in the investigation, the AOC also failed when it was the only display connected. There had been similar symptoms when I previously used the motherboard's DP output, although I have not established that those incidents had the same cause.

I initially suspected a Windows update, too. I never established that it caused the fault.

## What did not establish a fix

I tried another DP cable, different ports, changing the input selection, disabling Adaptive-Sync, testing HDR on and off, and reinstalling the NVIDIA driver. Changing the Dell from DP to HDMI did not permanently resolve the problem either.

Several changes were followed by a successful start. Some even survived more than one restart. The black screen then returned. That was the most frustrating part: a successful attempt repeatedly looked like a solution before it had earned that description.

The driver reinstallation was the same 616.92 version, so it was not a comparison between different driver releases. Disabling integrated graphics was also not tested in isolation under otherwise identical conditions. I cannot claim that either operation identified the cause.

## What the computer could still see

During one confirmed AOC black screen, Windows still reported the monitor as an active display at 2560 × 1440, 280 Hz, with HDR and 10-bit output. NVIDIA also reported a current DP link. After the picture returned, the compared software-reported display fields were unchanged.

Those readings showed what the computer believed it was outputting. They did not prove that the monitor had successfully received and displayed the picture. They also did not identify which end of the connection was responsible.

The logs needed the same care. I had forced the computer off during some failures, so unexpected-shutdown events were not independent evidence of a bad power supply. I had also used the graphics-reset keyboard shortcut during troubleshooting; diagnostic reports generated around those attempts were not automatically evidence of a spontaneous graphics-card crash. The detailed machine logs remain in my local records.

## The startup sequence that currently works

With integrated graphics still disabled, the clearest recent comparison was this: starting with both displays switched on left the AOC black, whether HDR was on or off. Delaying the Dell's power-on worked repeatedly.

The sequence is:

1. Leave the signal cables connected, but switch off the Dell using its power button.
2. Start the computer with the AOC switched on.
3. Wait until the AOC shows the Windows desktop.
4. Switch on the Dell.

Both displays then work. This is a repeatable workaround in my current setup, not proof that the Dell is taking another display's signal or that disabling integrated graphics fixed the underlying problem.

## Automatic screen-off and manual sleep behaved differently

A second problem appeared after a period of inactivity: the AOC went dark and would not return when I tried to resume using it. The Dell was switched off at the time. I eventually forced the computer off and started it again.

However, deliberately choosing **Sleep** from the Windows Start menu behaved differently. The screens went dark, the case fans stopped, and a short press of the case power button brought the picture back normally. That has worked in the tests I have made so far.

I am therefore using manual sleep when I step away. The earlier automatic screen-off failure and a deliberate whole-computer sleep are separate observations; describing both simply as a sleep problem would lose a useful distinction. I have not captured enough evidence to identify exactly what failed during the automatic screen-off incident.

## Where I am leaving it

My working suspicion is a problem establishing or restoring the AOC's display output, involving the graphics driver, the monitor's DP input or firmware, or their interaction. It is still a hypothesis. I have neither proved a hardware defect nor ruled one out.

Other people have reported parts of the same pattern. One [RTX 5080 user with three Dell monitors](https://www.reddit.com/r/pcmasterrace/comments/1iq9r9z/triple_monitor_only_2_wakes_up_from_sleep/) described a screen that would not recover after display-only idle while Windows still recognised it. Another [dual-monitor RTX 5080 report](https://linustechtips.com/topic/1611835-rtx5080-dual-monitor-does-not-work-upon-boot-up/#findComment-16729697) ended with the author reporting that a driver update fixed startup failures. Neither is a diagnosis of my machine or a reason to copy a particular old driver version.

For now, I have a startup routine and a way to leave the computer without relying on the troublesome automatic screen-off behaviour. The next investigation can start from these observations, with a controlled driver comparison or support for the monitor's exact hardware revision. I am tired of testing and want to use the computer again.

I will update this post if I find a confirmed cause or a lasting fix. As of 20 September 2026, the cause remains unresolved.
