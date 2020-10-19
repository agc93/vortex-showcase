---
title: "Alpha 1.3 Release"
linkTitle: "Release 0.1.3"
date: 2020-10-18
aliases:
  - /updates/v0.1.3
description: >
  The new alpha release of Vortex Showcase
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files).
{{% /pageinfo %}}

This release is a small feature update that adds a new format (and moves a couple of existing ones). If you haven't already, make sure you check out the notes for [0.1.1](/updates/v0.1.1) and [0.1.0](/updates/v0.1.0).

This version adds a new "Plain Text" format that can be used to create a simple barebones text-only list of your mods. This (obviously) won't include any images and might not be as pretty as the other formats, but it's just text so you can share it even more easily!

This version *requires* Vortex 1.3+, older Vortex versions can continue to use 0.0.4. Extension authors might want to check the [developer docs](/docs/developer/extensions) for detail on the new extensions API.

Get started with your own mod showcases using the action buttons in your Mods page, and make sure to report any [issues you find](https://github.com/agc93/vortex-showcase) or [give any feedback](https://www.nexusmods.com/site/mods/145?tab=posts).

#### What happened to CSV and Discord formats?

After this update, you might notice that a couple of formats have disappeared from the extension: CSV and Discord format.

These formats have been **temporarily** removed from the main file and will be reintroduced soon in a separate extension. Since Showcase has its own [extension API](/docs/developer/extensions), this means we can distribute all manner of more exotic formats without cluttering up the wizard for everyone. I'll be publishing a new extension package soon, with CSV and Discord included, for all the less common Showcase formats.