---
title: "Alpha 1.6 Release"
linkTitle: "Release 0.1.6"
date: 2020-10-28
aliases:
  - /updates/v0.1.6
description: >
  The new alpha release of Vortex Showcase
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files).
{{% /pageinfo %}}

This release is a minor fix update that adds a small tweak and improves the extension API. This includes:

- Showcases should *hopefully* give more descriptive names for mods with multiple files/variants (thanks @ronamit for reporting this)
- The extension API typings have been folded in to the main package. This won't change the API itself, but should make it easier to keep the API and typings in sync.

You shouldn't see many obvious changes in this release, so make sure to check out all the release notes for [previous versions](/updates).

This version *requires* Vortex 1.3+, older Vortex versions can continue to use 0.0.4.

Extension authors might want to check the [developer docs](/docs/developer/extensions) for detail on the new extensions API.

Get started with your own mod showcases using the action buttons in your Mods page, and make sure to report any [issues you find](https://github.com/agc93/vortex-showcase) or [give any feedback](https://www.nexusmods.com/site/mods/145?tab=posts).