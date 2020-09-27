---
title: "Alpha 1.2 Release"
linkTitle: "Release 0.1.2"
date: 2020-09-27
aliases:
  - /updates/v0.1.2
description: >
  The new alpha release of Vortex Showcase
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/145?tab=files).
{{% /pageinfo %}}

This release is a minor fix update that just covers off some possible error states and improves internal logging.

You shouldn't see any obvious changes in this release, so make sure to check the release notes for [0.1.1](/updates/v0.1.1) and [0.1.0](/updates/v0.1.0).

This version *requires* Vortex 1.3+, older Vortex versions can continue to use 0.0.4.

Extension authors might want to check the [developer docs](/docs/developer/extensions) for detail on the new extensions API.

Get started with your own mod showcases using the action buttons in your Mods page, and make sure to report any [issues you find](https://github.com/agc93/vortex-showcase) or [give any feedback](https://www.nexusmods.com/site/mods/145?tab=posts).

### Upload Action

If you create a new showcase in Markdown format, you'll see a new *Upload* button in the notification when your showcase is generated. This will upload your showcase to a hosted service and give your showcase a unique URL you can share. Please note that (at this time) uploaded showcases will expire after 3 months!

For those more curious, your showcases are uploaded to `showcase.report` which is just a hosted [PrivateBin](https://privatebin.info/) server specifically configured for hosting Markdown showcases. During the upload, the contents of your showcase is encrypted on your PC, a random password is generated and the encrypted content is uploaded directly to the PrivateBin server where it will have a unique URL with a key to decrypt the Markdown content. You can read a ton more about how PrivateBin works [here](https://privatebin.info), but it's actually the same tech used by Vortex's built-in mod reporting feature!