---
title: "Frequently Asked Questions"
linkTitle: "FAQ"
weight: 20
---

Below is a collection of frequent questions and the best answers I can give.

### Why do I need Vortex for this?

You don't! This extension is specifically for people already using Vortex to manage your mods who want an easy way to share all or part of their mod setups. If you're currently using NMM/MO2/any other modding tool, this isn't for you!

### Doesn't Vortex already let you create mod reports?

Yes, and they're amazing! But they're a troubleshooting measure, first and foremost. Every mod creates its own report, and they're very technical: listing individual files, plugins and deployment details. Showcases don't have any of that detail, but are much more human-readable. Different tools for different purposes!

### Can I use this to backup/restore my mods?

No. Backup and restore of complex mod installations is a surprisingly hard problem, and it's not the problem that Showcase is trying to solve. As well as just being a very complicated thing to effectively backup, getting the level of detail required for reliable backup/restore requires a lot of game-specific logic that we just don't have here.

You can, however, create a showcase and use that to rebuild your mods from scratch if you want. You might also be interested in [this other community extension](https://www.nexusmods.com/site/mods/67).

### Why doesn't the showcase include plugins?

The main reason is that the concept of plugins is very game-specific! What most people refer to as Plugins is the result of another (bundled) Vortex [extension](https://github.com/Nexus-Mods/extension-plugin-management) that handles plugins for Gamebryo games. Showcase deliberately tries to avoid game-specific features as much as possible.

The second reason is that Gamebryo plugins are *complicated*. Take a look at the extension above and you'll find about 6000 lines of code dedicated to reading and managing plugins for Gamebryo games. I just don't have the capacity to add that level of complexity to this extension.

### What about mods that aren't on the Nexus?

They will still be included in your showcase, but they might not have quite as much information. A lot of the information that Vortex knows about a mod comes from Nexus Mods (or another metaserver for some games), and this extension just pulls mod metadata from what Vortex already knows about your mods. 