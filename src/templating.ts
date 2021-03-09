import { fs, util, log, selectors } from "vortex-api";
import { IExtensionApi, IMod, INotificationAction, IDialogResult, ICheckbox } from "vortex-api/lib/types/api";
import { createModInfo, ITemplateModel, ModInfoDisplay } from "./modinfo";
import path = require('path');

/**
 * @public
 * The interface for defining showcase formats. 
 * The renderer is responsible for format-specific data models as well as generating the final report content.
 */
export interface IShowcaseRenderer {
    /**
     * Build a model for a given mod. Can also return undefined, or a partial model, to accept defaults.
     * @param api - Extension API
     * @param mod - The mod to build a info model for.
     * @param defaultModelFn - Function used to create the default template model. Use this if you only want to change some attributes.
     */
    createModel(api: IExtensionApi, mod: IMod, defaultModelFn?: () => ModInfoDisplay): ModInfoDisplay
    /**
     * Builds/renders the final showcase based on a complete template model.
     * 
     * @param api - Extension API
     * @param model - The complete showcase template model.
     */
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string>;
    /**
     * Optional function to build a target file name for a showcase using this format.
     * 
     * @param title - The user-defined showcase title. Will not be escaped!
     */
    createFileName?(title: string): string|undefined;
    /**
     * Optional function to only enable this renderer based on current game. Defaults to true (i.e. enabled).
     * 
     * @param gameId - The current game.
     */
    isEnabled?(gameId: string): boolean;
    /**
     * Optional function to disable the ability to save to file. 
     * @remarks
     * Only use this for renderers where saving to a file is completely nonsense/impossible.
     */
    allowSave?(): boolean;
}

/**
 * @public
 */
export interface IShowcaseAction {
    runAction(renderer: string, output: string): Promise<void>;
    isEnabled?(renderer: string): boolean;
}

type RendererRef = {name: string, renderer: IShowcaseRenderer};
type ActionRef = {name: string, action: IShowcaseAction};
type DeploymentManifest = {deploymentMethod: string, deploymentTime: number, stagingPath: string, targetPath: string};

/**
 * Renders a showcase.
 * 
 * @param api The extension API.
 * @param gameTitle The readable game name.
 * @param showcaseTitle The showcase title.
 * @param mods The selected/included mods.
 * @param selectedRenderer Reference for the selected format renderer.
 * @internal
 */
export async function renderShowcase(api: IExtensionApi, gameTitle: string, showcaseTitle: string, mods: IMod[], selectedRenderer: RendererRef, forceAction?: string) {
    api.dismissNotification('n-showcase-created');
    var renderer = selectedRenderer.renderer;
    var user = util.getSafe(api.getState().persistent, ['nexus', 'userInfo', 'name'], undefined) ?? 'an unknown user';
    var manifests = getManifestSet(api, mods);
    var modInfo = mods.filter(im => im).map(m => {
        var defaultModel = createModInfo(api, m);
        var customModel = renderer.createModel(api, m, () => defaultModel);
        // var defaultModel = createModInfo(api, m);
        var merged = {...defaultModel, ...customModel};
        /* var merged = api == null
            ? defaultModel
            : {...defaultModel, ...customModel}; */
        var manifest: DeploymentManifest = manifests[m.type];
        if (manifest && manifest.deploymentTime) {
            merged.deployment.time = new Date(manifest.deploymentTime * 1000);
        }
        return merged;
    }).filter(mod => mod);
    log('debug', `generated ${modInfo.length} models from ${mods.length} included mods`);
    var model: ITemplateModel = {
        game: gameTitle,
        title: showcaseTitle,
        user: user,
        mods: modInfo
    }
    var output = await renderer.createShowcase(api, model);
    if (forceAction == null) {
        var notifActions = getNotificationActions(api, selectedRenderer.name, output);
        if (!renderer.allowSave || (renderer.allowSave && renderer.allowSave())) {
            notifActions.push({
                title: 'Save to file',
                action: (dismiss) => {
                    saveToFile(api, output, showcaseTitle, selectedRenderer, dismiss);
                }
            });
        }
        if (output && output.length > 0) {
            api.sendNotification({
                type: 'success',
                message: 'Successfully generated report',
                title: 'Showcase Generated!',
                actions: [
                    ...notifActions
                ],
                id: 'n-showcase-created'
            })
        }
    } else {
        var allActions = getActions(api, selectedRenderer.name);
        var override = allActions.find(a => a.name.toLowerCase() == forceAction.toLowerCase());
        if (override) {
            override.action.runAction(selectedRenderer.name, output);
        }
    }
}

function getManifestSet(api: IExtensionApi, mods: IMod[]): {[modType: string]: DeploymentManifest} {
    var types = mods.filter(m => !!m).map(m => m.type);
    types = [...new Set(types)];
    var manifestSet = {};
    for (const modType of types) {
        var manifest: DeploymentManifest = util.getManifest(api, modType)
        if (manifest && !manifestSet[modType]) {
            manifestSet[modType] = manifest;
        }
    }
    return manifestSet;
}

function getActions(api: IExtensionApi, renderer: string): ActionRef[] {
    var actions = util.getSafe<{[key: string]: (() => IShowcaseAction)}>(api.getState().session, ['showcase', 'actions'], undefined);
    var availableActions = actions == undefined
        ? []
        : Object.keys(actions)
            .map(a => ({name: a, action: actions[a]()}))
            .filter(a => a.action.isEnabled ? a.action.isEnabled(renderer) : true);
    log('debug', 'loaded available actions from session state', {actions: availableActions.length});
    return availableActions;
}

function getNotificationActions(api: IExtensionApi, rendererName: string, output: string): INotificationAction[] {
    var allSessionActions = getActions(api, rendererName);
    if ((Object.keys(allSessionActions).length < 3) && (allSessionActions.every(a => a.name.length < 8))) {
        var sessionActions = allSessionActions.map(a => {
            return {
                title: a.name,
                action: (dismiss) => {
                    a.action.runAction(rendererName, output);
                    dismiss();
                }
            } as INotificationAction
        });
        return sessionActions
    } else {
        var dialogActions: INotificationAction[] = [
            {
                title: 'More...',
                action: (dismiss) => {
                    api.showDialog(
                        'question',
                        'Showcase successfully created!',
                        {
                            text: 'Your showcase has successfully been generated! As well as saving it to a file for later, you can also use any of the extra actions below to share your showcase more easily',
                            checkboxes: 
                                allSessionActions.map(a => {
                                    return {
                                        id: a.name,
                                        text: a.name,
                                    } as ICheckbox
                                })
                        }, [
                            { label: 'Cancel' },
                            { label: 'Continue' }
                        ]
                    )
                    .then((result: IDialogResult) => {
                        if (result.action == 'Cancel') {
                            return;
                        } else {
                            var enabledActions = allSessionActions.filter(a => result.input[a.name]);
                            for (const action of enabledActions) {
                                action.action.runAction(rendererName, output);
                            }
                        };
                        dismiss();
                    });
                }
            }
        ];
        return dialogActions;
    }
}

async function saveToFile(api: IExtensionApi, content: string, title: string, renderer: RendererRef, callback?: () => void) {
    var fileName: string;
    const showcasePath = path.join(util.getVortexPath('temp'), 'Showcase');
    await fs.ensureDirWritableAsync(showcasePath, () => Promise.resolve());
    if (renderer.renderer.createFileName) {
        fileName = renderer.renderer.createFileName(title);
    }
    if (fileName && path.basename(fileName, path.extname(fileName)) == '*') {
        var filePath = await api.selectFile(
            {
                create: true, 
                defaultPath: showcasePath, 
                filters: [
                    {name: renderer.name, extensions: [path.extname(fileName).replace(/^\./, '')]}
                ]
            });
        if (filePath) {
            fileName = path.relative(showcasePath, filePath);
        } else {
            fileName = util.deriveInstallName(title, undefined) + path.extname(fileName);
        }
    }
    else if (!fileName) {
        var filePath = await api.selectFile({create: true, defaultPath: showcasePath, title: 'Choose an output path'});
        if (filePath) {
            fileName = path.relative(showcasePath, filePath);
        } else {
            fileName = util.deriveInstallName(title, undefined) + '.txt';
        }
    }
    const tmpPath = path.join(showcasePath, fileName);
    await fs.writeFileAsync(tmpPath, content);
    util.opn(showcasePath).catch(() => null);
    callback?.();
}