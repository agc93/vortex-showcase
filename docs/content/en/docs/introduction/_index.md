---
title: "Introduction"
linkTitle: "Introduction"
weight: 1
description: >
  A basic introduction to Vortex Showcase
---

Vortex Showcase is an **unofficial** extension for the [Vortex mod manager](https://www.nexusmods.com/about/vortex/) that adds support for creating "showcases" based on your installed mods. Think of a showcase as a shareable report of your installed and enabled mods, perfect for either showing off your whole mod list or sharing a great set of related mods with others. To clarify, this project is not affiliated in any way with Nexus Mods or anyone else, and is an open-source community resource.

## Status and Limitations

Vortex Showcase is still beta-quality software! While I can test locally, I won't be able to cover every case and there is a high potential for bugs that haven't been found yet. Equally, this project is still in its infancy so there will likely be quite a few changes to how we do things. The following is definitely supported at this point:

- **Sharing your mod list**: You can create a showcase based on your current mod list that will use all of your installed and enabled mods
- **Game-agnostic**: Currently, showcases don't have *any* game-specific logic so you should be able to create a showcase based on mods for any of your Vortex-managed games*
- **Specific mod selections**: You can also create a showcase based on only some selected mods if you just want to share a few mods that work well together.

> \* This does come with the caveat that (at this time) showcases also won't include any game-specific mod information, such as Gamebryo plugins, or load order information.

If you're really missing specific features you can open an issue and we can discuss the viability, or find me on the Nexus Mods Discord.

### Purpose

To be clear about this: this extension is *not* intended as a backup solution, modwat.ch replacement, or anything else like that. We cover this [in the FAQ](/docs/introduction/faq), but this is simply a way of creating decent-looking shareable mod lists from within Vortex.