---
title: "Alpha 2.1 Release"
linkTitle: "Release 0.2.1"
date: 2021-03-09
aliases:
  - /updates/v0.2.1
description: >
  The new alpha release of Vortex Showcase
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files).
{{% /pageinfo %}}

This release is a fix update that adds some fixes and optimisations, mostly for Vortex 1.4. This includes:

- Showcase generation should be dramatically faster now!
  - There's been a pesky slowdown appearing with larger mod lists that's been hard to nail down
  - Turns out it was caused from looking up Vortex's manifest too often, which it no longer does
  - Looks like this was also leading to out of memory crashes in newer versions

You shouldn't see many obvious changes in this release, so make sure to check out all the release notes for [previous versions](/updates).

This version *requires* Vortex 1.4+, older Vortex versions can continue to use 0.1.x.

Extension authors might want to check the [developer docs](/docs/developer/extensions) for detail on the extensions API.

Get started with your own mod showcases using the action buttons in your Mods page, and make sure to report any [issues you find](https://github.com/agc93/vortex-showcase) or [give any feedback](https://www.nexusmods.com/site/mods/145?tab=posts).