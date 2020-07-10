---
title: "Initial Release (Hotfix 4)"
linkTitle: "Release 0.0.4"
date: 2020-07-09
aliases:
  - /updates/v0.0.4
description: >
  The initial pre-alpha of Vortex Showcase
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files).
{{% /pageinfo %}}

This release is a bugfix update to improve showcase generation:

- The link used for the mod source will now default to the `homePage` attribute
  - This should fix games where their Vortex names and Nexus names don't match
  - Most notably, this was the case for Skyrim SE (`skyrimse`/`skyrimspecialedition`)
- Markdown reports will now include the mod type, and any notes you have added to your mods
- The template model now also supports mod notes

This release is an alpha release of the Vortex Showcase extension! Get started with your own mod showcases using the action buttons in your Mods page, and make sure to report any [issues you find](https://github.com/agc93/vortex-showcase) or [give any feedback](https://www.nexusmods.com/site/mods/145?tab=posts).