---
title: "Alpha 2 Release"
linkTitle: "Release 0.2.0"
date: 2021-02-17
aliases:
  - /updates/v0.2.0
description: >
  The new alpha release of Vortex Showcase
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files).
{{% /pageinfo %}}

This release is a fix update that adds some fixes and updates, mostly for Vortex 1.4. This includes:

- You _shouldn't_ see any differences in functionality/usage after installing this!
- There's been a few changes under the covers though:
  - Re-included `pako` in the build: this makes the bundle waaay bigger, but looks like Vortex 1.4 doesn't load this anymore.
  - Updated to roughly match Vortex's package versions, including Electron 11
  - The extension API typings will update to includes those changes as well.

You shouldn't see many obvious changes in this release, so make sure to check out all the release notes for [previous versions](/updates).

This version *requires* Vortex 1.4+, older Vortex versions can continue to use 0.1.x.

Extension authors might want to check the [developer docs](/docs/developer/extensions) for detail on the extensions API.

Get started with your own mod showcases using the action buttons in your Mods page, and make sure to report any [issues you find](https://github.com/agc93/vortex-showcase) or [give any feedback](https://www.nexusmods.com/site/mods/145?tab=posts).