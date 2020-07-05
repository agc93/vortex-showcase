---
title: "Developer Guide"
linkTitle: "Development"
weight: 90
description: >
  An introduction to Vortex Showcase's design and how to contribute.
---

Showcase is fully **open-source**! You can see the full code for the extension (including these docs) [on GitHub](https://github.com/agc93/vortex-showcase). Community contributions, fixes and PRs are all welcome! That being said, please read the info below to make all of our lives a bit easier.

## Licensing

Vortex Showcase is made available under an [MIT License](https://opensource.org/licenses/MIT). That means all contributions will also be licensed under the MIT License and all the conditions and limitations that involves.

## Development Environment

To work with the Showcase code, you'll only need Node.js (including a recent version of `npm`) and TypeScript installed. Development so far has been done in Visual Studio Code, but any IDE that supports TypeScript should work just fine.

> There's currently very little tsdoc included, this will hopefully change in a future release

### Getting set up

Whether you are developing on the same machine that Vortex is installed on or not, the easiest way I have found to work with this has been to [install the extension manually](/docs/usage/installation/#manual-installation), then whenever I make a change simply drop my rebuilt `index.js` into the `vortex-showcase` folder and restart Vortex. Also remember to update the template files in your target environment if you make any changes.

You can find Diagnostics Logs in the overflow menu at the top right of the Vortex window. There is also a Vortex extension that lets you open the DevTools window.

### Continuous Integration

Note that all commits to, and pull requests against, the `master` branch are automatically built as part of a GitHub Action. Please don't add unnecessary changes to the Actions workflow without prior discussion.

## Feature Requests

Showcase is a community project, currently built and maintained by a single non-developer. As such, feature requests will be accepted, but I can't provide any level of assurance that any requests will certainly be included. Also remember that we are limited to features that Vortex can reasonably support. Open [an issue on GitHub](https://github.com/agc93/vortex-showcase/issues/new) to discuss viability of any requests.

I'd also like to maintain Showcase as game-independent as possible, so please don't open issues/PRs for very game-specific functionality. Ideally, I'll be extending the API that Showcase provides in future to allow for enhancing game-specific capabilities but this is a long way off.

## A note on confusing code

For anyone who decides to wade into the Showcase code, there's a few things worth remembering:

1. **I'm not a developer**: This is just something I'm doing in my spare time, so don't expect super-high-quality code. I'll happily take fixes, though!
1. **Working with Vortex is weird**: There's quite a few quirks of the codebase that exist because of unfathomably mystifying behaviour in Vortex's extension API.
1. **The over-engineering is deliberate**: This was as much of an exercise in my own JS/TS skills as anything else, so I've deliberately over-engineered the extension.
