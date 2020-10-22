---
title: "Installation"
linkTitle: "Installation"
weight: 10
description: >
  Installing the Showcase extension into Vortex
---

## Installing the Extension

To create showcases, you'll need to install the extension into Vortex first. There's a couple of different ways to do that, but unless you've got a pretty specific use case, you'll probably want one of the two automatic methods, but manual installation is available as well.

### Automatic Installation

> This is the easiest way to install!

1. Open up Vortex, and open the Extensions panel from the left sidebar.
1. Click **Find more** to open the list of Extensions
1. Find **Vortex Showcase** and click *Install*
1. Wait for the extension to install and **restart Vortex** when prompted.

Once Vortex has restarted, switch back to your Mods screen and you should be ready to [create a showcase](/docs/usage/showcase)!

### Semi-Automatic Installation

If you can't install directly from the Extensions screen, you can instead install from the archive.

1. Download the archive from [Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files) or [GitHub](https://https://github.com/agc93/vortex-showcase/releases)
1. Open the Extensions panel in Vortex
1. Click on the *Drop File(s)* box in the corner and locate the archive you downloaded.
1. Wait for the extension to install and **restart Vortex** when prompted.

Once Vortex has restarted, switch back to your Mods screen and you should be ready to [create a showcase](/docs/usage/showcase)!

### Manual Installation

> Only attempt this if you *absolutely* have to. It becomes much harder to debug and much harder to upgrade.

If you want to install the extension yourself, you will have to install the actual extension files manually. Make sure you close Vortex before proceeding.

First, download the archive from [Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files) or [GitHub](https://https://github.com/agc93/vortex-showcase/actions).

Next, unpack the archive to somewhere convenient. You should have a directory named `vortex-showcase` with a handful of files inside, including *at least* the following:

- info.json
- index.js

Now, copy the whole directory to your Vortex folder. You can easily open your Vortex folder by opening a new File Explorer window and entering the following in to the location bar: `%APPDATA%/Vortex` and then opening the `plugins` directory (create it if it doesn’t exist).

Once you’re done, you should have files at the following location:

```text
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\vortex-showcase\info.json
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\vortex-showcase\index.js
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\vortex-showcase\<some-other-files>...
```

With those files in place, you're clear to start Vortex and you should see the actions in your Mods screen.