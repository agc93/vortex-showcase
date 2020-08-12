---
title: "Extensions API"
linkTitle: "Extensions"
weight: 99
draft: true
description: >
  Integrating and extending Showcase from extensions
---

The one advantage to Vortex Showcase's hilariously excessive over-engineering is that it has ended up specifically designed to make adding new formats or actions very simple.

{{% pageinfo %}}
The new API introduced with 0.1.0 (while functional and supported) is still highly experimental and subject to changes.
{{% /pageinfo %}}

## Showcase Formats

In it's simplest form, a format is a function that takes a model (an `ITemplateModel` to be specific) and returns a string with the text content of the showcase. The complicated integration work of pulling mods and their metadata out of Vortex, as well as filtering out some stuff, is done by Showcase itself before the format renderers are called. For example, the default renderers take this model and use Mustache.js to render templates with that model and return the generated string content.

All showcase formats are loaded directly from Vortex's session state using the extension API, even the default ones. The Markdown and BBCode renderers are not hard-coded anywhere, they're just registered as formats when the extension loads.

### Registering formats/renderers

Registering a new format requires two things: an implementation of `IShowcaseRenderer` and a call to `addShowcaseRenderer(key: string, () => IShowcaseRenderer)`.

The string key (i.e. `Markdown`) is what's shown to users so make sure it's reasonably friendly. The second parameter is a callback to return your renderer. If you need constructor params or any other weird setup, you should be safe-ish to do that here.

> Your renderer will be instantiated every time the showcase process is started, so don't do anything too heavy.

For external extensions, you can register a renderer like so:

```ts
context.requireExtension('Vortex Showcase');
context.once(() => {
    context.api.ext.addShowcaseAction('My Custom Action', () => new CustomAction());
    context.api.ext.addShowcaseRenderer('My Custom Renderer', () => new CustomRenderer());
});
```

### Rendering showcases

When a user creates a showcase, they are prompted with all the currently registered renderers and can choose one. Once they hit Create, the extension will pull the `IShowcaseRenderer` with the matching key from session state and invoke it in two stages: model build and final rendering.

First, to build the model metadata, the `createModel` function for the current renderer is called for each mod. If you don't need to do any customisation or control how mod metadata is created, then just return `null`, and the extension will populate sane defaults. You can also just change the model properties you care about and the model you return will be merged with the default.

Next, once the template model has been built, the extension will call the `createShowcase` function passing in the generated model and the extension API (for convenience). This is where the actual rendering happens, and this function should return the **final** string contents of the showcase, which the user can then copy/save/take action on.

#### Optional functions

There's an extra function in a renderer to return a file name in `createFileName` based on the user-provided title. This is completely optional: if your method a) doesn't implement `createFileName` or b) returns `null`/`undefined`, Vortex will prompt the user for a file name and location. You can, however, use this step to manually specify a name (as the Markdown renderer does), or only return a file extension (i.e. `return '*.csv'`) and Vortex will also prompt the user, but automatically use the right extension.

If your renderer only works with specific games, you can also implement the `isEnabled(gameId: string)` function, and your renderer will only be shown to the user if that function returns `true` for the currently managed game.

## Actions

Actions are (as the name suggests) any arbitrary action that a user might want to *do* with a generated showcase. Out of the box, this includes saving to a file and copying to the clipboard, but the action API is pretty open-ended: you can do basically anything.

### Registering an action

Much like registering a renderer, registering a custom action is just an implementation of `IShowcaseAction` and a call to `addShowcaseAction`.

For external extensions, you can register an action like so:

```ts
context.requireExtension('Vortex Showcase');
context.once(() => {
    context.api.ext.addShowcaseAction('My Custom Action', () => new CustomAction());
});
```

The string key (i.e. `My Custom Action`) is what's shown to users so make sure it's reasonably friendly, and **short**. The second parameter is a callback to return your renderer. If you need constructor params or any other weird setup, you should be safe-ish to do that here.

### Building an action

Much like renderers, custom actions are just an implementation of `IShowcaseAction` that Showcase will pull out of the session state and call after a showcase has been generated. After a showcase has been generated (i.e. the renderer has returned some output), Vortex will offer all the available actions to the user.

The main implementation of an action happens in the `runAction(renderer: string, output: string)` function, which will be called after the user has chosen that action (from the notification or dialog). The action will be passed the *name* of the renderer that generated the showcase (in case you need special handling for certain formats), and the raw output from the renderer (the `output` parameter). You can do pretty much anything in the `runAction` function: the `ClipboardAction` is a simple example of what you can do with actions, but you can do just about anything.

> You can optionally implement `isEnabled` if you only want your action to be available with certain renderers (or not certain renderers)