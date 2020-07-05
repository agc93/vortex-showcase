---
title: "Extensions API"
linkTitle: "Extensions"
weight: 99
description: >
  Integrating and extending Showcase from extensions
---

The one advantage to Vortex Showcase's hilariously excessive over-engineering is that it has ended up specifically designed to make adding new formats or actions very simple.

## Showcase Formats

In it's simplest form, a format is a function that takes a model (an `ITemplateModel` to be specific) and returns a string with the text content of the showcase. The complicated integration work of pulling mods and their metadata out of Vortex, as well as filtering out some stuff, is done by Showcase itself before the format renderers are called. For example, the two default renderers take this model and use Mustache.js to render templates with that model and return the generated string content.

All showcase formats are loaded directly from Vortex's session state using the extension API, even the default ones. The Markdown and BBCode renderers are not hard-coded anywhere, they're just registered as formats when the extension loads.

### Registering formats/renderers

Registering a new format requires two things: an implementation of `IShowcaseRenderer` and dispatching a `registerShowcaseRenderer` action. You can find this in the `index.ts` for the default formats, where we register a `MarkdownRenderer` as below:

```ts
context.once(() => {
    context.api.store.dispatch(registerShowcaseRenderer('Markdown', () => new MarkdownRenderer()));
    ...
});
```

The string key (i.e. `Markdown`) is what's shown to users so make sure it's reasonably friendly. The second parameter is a callback to return your renderer. If you need constructor params or any other weird setup, you should be safe-ish to do that here.

### Rendering showcases

When a user creates a showcase, they are prompted with all the currently registered renderers and can choose one. Once they hit Create, the extension will pull the `IShowcaseRenderer` with the matching key from session state and invoke it in two stages: model build and final rendering.

First, to build the model metadata, the `createModel` function for the current renderer is called for each mod. If you don't need to do any customisation or control how mod metadata is created, then just return `null`, and the extension will populate sane defaults (using `ModInfoDisplay.create`).

Next, once the template model has been built, the extension will call the `createShowcase` function passing in the generated model and the extension API (for convenience). This is where the actual rendering happens, and this function should return the **final** string contents of the showcase, which the user can then copy/save

## Actions

There's the beginnings of an API to take certain actions after a showcase is generated, but this is not finalised so I have not included it here. This API is intended for things like uploading certain showcase formats, or letting users directly share a showcase through other means.
