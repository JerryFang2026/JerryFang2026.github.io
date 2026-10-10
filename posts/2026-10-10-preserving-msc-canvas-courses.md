---
title: Preserving My MSc Canvas Courses Before University Access Ends
date: 2026-10-10
category: Essays
summary: How I preserved files and reading lists from eleven MSc course areas, rebuilt their familiar Canvas navigation, and made a private archive available for later study.
draft: false
---

As I approach the end of my MSc, I have been thinking about what happens to the material behind my university login. I want to return to it after graduation: a useful explanation, an exercise, a reference I only half remember. Keeping access to the original learning platform indefinitely is something I cannot assume.

I also wanted to preserve a small part of the experience of studying. I remember material through its course, its week, and the page where I first found it. A folder of presentation files would keep the documents, but much of that context would be harder to recover.

Over the past few days, I worked with Codex to preserve selected material from eleven MSc Canvas course areas and rebuild a familiar dashboard around it. The result is a private static archive with 831 saved teaching files. It keeps the course pages, weekly structure and useful navigation for later study.

## Saving files with their context

I set a clear scope before collecting anything. I wanted course Home pages, Pages and Modules: module introductions, weekly outlines, handouts, exercises, reference lists and links to useful external resources. I left lecture recordings out because of their size. My submitted work and grades stayed outside the project.

Downloading the files took some manual work. Automated browser downloads were not consistently reliable in my setup, so I downloaded material course by course while Codex helped build the inventory, match the files to their source pages and check what was still missing. I treated this as a practical limitation of the workflow, without assuming that every failed click was an anti-bot rule on Canvas.

The downloaded files were copied into a dedicated archive organised by course. Before clearing the corresponding downloads, we checked that the saved copies were independent files and matched their originals. Files with uncertain provenance or unavailable sources stayed clearly marked. The archive records what I preserved; it does not silently turn an unresolved item into a successful download.

Reading lists needed their own treatment. A resource list can appear inside Canvas while being supplied by another system. Leaving a link to that embedded view would not preserve the list itself. We saved bibliographic entries as local pages and retained useful external links where available. For later study, the title, author and reading recommendation matter much more than a button showing whether the university library has a copy available today.

Some references could also be connected to entries in my [Library](library.html). That catalogue helps me find the relevant book and chapter. An electronic copy was not available for every reference, so those entries remain useful bibliographic records rather than promises of downloadable full text.

## Rebuilding the course navigation

The archive starts with recognisable course cards. Each course opens into Home, Pages and Modules, with the teaching material arranged much as I remember it. Previous and Next buttons follow the preserved module sequence, so I can move between weekly pages without repeatedly returning to a list. The dashboard also lets me change the course order and keep that arrangement in the current browser.

The rebuilt site contains 215 static HTML pages, including course navigation and reference pages. It is a snapshot of the material I chose to keep. It has no connection to the university's assessment or grading systems, and it will not automatically receive later changes from Canvas.

I wanted the saved links to remain useful as well as familiar. Links to preserved attachments now lead to the saved files. Reading lists open as archive pages. External resources that still make sense outside the university login retain their original destinations.

We checked the rebuilt local links, opened the site in an authenticated browser, moved between weekly pages and tested the course-order controls. A real teaching-file download also matched the local original using a complete SHA-256 comparison. Testing the finished interaction mattered: a page that looks right is only part of a usable archive.

## Hosting the archive privately

I kept the public blog and the teaching archive separate. The blog provides a Private Archive navigation link, while the pages and attachments are protected by Cloudflare Access with an explicit email allowlist. I tested anonymous requests to the home page and several direct attachment addresses; those requests were redirected to login. [Cloudflare documents protection for a Worker's production and preview traffic](https://developers.cloudflare.com/workers/configuration/cloudflare-access/).

File size determined where the attachments could be stored. Cloudflare's current Static Assets limit is **25 MiB per file**. Most of the archive fits that limit: 798 teaching files are hosted with the protected pages. The remaining 33 larger files, about 2.84 GB in total, are in my private Google Drive. The archive links to their real stored copies. [Cloudflare's published limits](https://developers.cloudflare.com/workers/platform/limits/) explain the size constraint.

The website and Drive have separate access controls. Allowing someone to open the course pages does not automatically give them access to the larger Drive files. At present, both parts are restricted to me. Any later sharing will need an individual review and the appropriate permissions in both places.

This was completed without adding a new paid subscription. Cloudflare currently lists static asset requests as free and unlimited, with no additional charge for storing those assets; the larger files use space already available in my personal Drive. Those are the arrangements used for this project, rather than a guarantee that every archive will fit the same services or that their terms will never change. [Cloudflare's billing documentation](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) sets out that distinction.

The local archive remains the master copy. Having the site online makes it easier to use, while retaining the local files keeps the work independent of any one hosting service.

## Requesting access

If you would like to request access to selected course resources, or discuss how the archive was made, leave a brief note in the [Guestbook](about.html#comments). Use **Comment with just a name and email** and put your contact address in the dedicated **Email** field. Use the message itself to explain which material interests you and your intended use.

Your nickname and message should be treated as public. Please keep your email address, student number and other private details out of the message body. The dedicated email field is for private follow-up and is not shown in the public comment list; it is processed by the comment service and the site administrator.

I review requests individually and may follow up privately. Access is not granted automatically, and any sharing depends on which material is appropriate to make available to that person. I am happy to discuss the preservation method even when the teaching material itself cannot be shared.

I now have a way to return to the course material through the structure in which I learned it. The files, references and weekly pages remain together, alongside a recognisable record of this part of my MSc.
