---
title: "Alpha 1 Release"
linkTitle: "Release 0.1.0"
date: 2020-08-13
aliases:
  - /updates/v0.1.0
description: >
  The initial alpha release of Vortex Showcase
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files).
{{% /pageinfo %}}

This release is a major upgrade for Showcase behind-the-scenes, but you shouldn't notice any major changes!

- Finalised the extensions API: we now expose a handful of function on the `IExtensionApi` for other extensions to use
- Made it possible for formats and actions to only be shown when supported, to trim down on the clutter
- Format selection will now remember your most recently used format and pre-select it
- New Discord format for sharing smaller mod lists in a Discord message

Extension authors might want to check the [developer docs](/docs/developer/extensions) for detail on the new extensions API.

This release marks the first full alpha of the Vortex Showcase extension, so we've bumped the version up to 0.1.0! Get started with your own mod showcases using the action buttons in your Mods page, and make sure to report any [issues you find](https://github.com/agc93/vortex-showcase) or [give any feedback](https://www.nexusmods.com/site/mods/145?tab=posts).