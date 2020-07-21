---
title: "Extensions API"
linkTitle: "Extensions"
weight: 99
description: >
  Integrating and extending Showcase from extensions
---

The one advantage to Vortex Showcase's hilariously excessive over-engineering is that it has ended up specifically designed to make adding new formats or actions very simple.

{{% pageinfo %}}
This API (while functional and supported) will be phased out in future releases. See the [notes below on Vortex changes](#upcoming-vortex-changes) for more detail.
{{% /pageinfo %}}

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

Next, once the template model has been built, the extension will call the `createShowcase` function passing in the generated model and the extension API (for convenience). This is where the actual rendering happens, and this function should return the **final** string contents of the showcase, which the user can then copy/save.

The final (and minor) function in a renderer is to return a file name in `createFileName` based on the user-provided title. This is completely optional: if your method a) doesn't implement `createFileName` or b) returns `null`/`undefined`, Vortex will prompt the user for a file name and location. You can, however, use this step to manually specify a name (as the Markdown renderer does), or only return a file extension (i.e. `return '*.csv'`) and Vortex will also prompt the user, but automatically use the right extension.

## Actions

There's the beginnings of an API to take certain actions after a showcase is generated, but this is not finalised so I have not included it here. This API is intended for things like uploading certain showcase formats, or letting users directly share a showcase through other means.

## Upcoming Vortex Changes

Upcoming releases of Vortex (likely in 1.3) will introduce a new API for extensions to expose functions on the `IExtensionApi` object for *other* extensions to use. Ideally this means that you can author your own extensions to add renderers or actions just as easily as Showcase does:

```ts
context.requireExtension('Vortex Showcase');
context.once(() => {
  context.api.addShowcaseRenderer('My Renderer', () => new MyAwesomeRenderer());
  context.api.addShowcaseAction('Do a thing', doTheThingAction);
})
```

However, this isn't there yet. Vortex hasn't fully integrated the changes that we'd need for that, and the extension will need to be updated to match. If you really want to add a renderer/action right now, open a PR with your implementation, but if you're comfortable waiting a bit, I'd recommend waiting for this API to be ready so you can package and manage your own features.