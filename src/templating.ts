import { fs, util, log } from "vortex-api";
import { IExtensionApi, IMod, INotificationAction, IDialogResult, ICheckbox } from "vortex-api/lib/types/api";
import { ITemplateModel, ModInfoDisplay } from "./modinfo";
import path = require('path');

/**
 * @public
 */
export interface IShowcaseRenderer {
    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string>;
    createFileName?(title: string): string|undefined;
    isEnabled?(gameId: string): boolean;
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

const knownExtensions = {
    'Markdown': '.md',
    'CSV': '.csv'
}

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
    var modInfo = mods.filter(im => im).map(m => {
        var customModel = renderer.createModel(api, m);
        var defaultModel = ModInfoDisplay.create(api, m);
        return api == null
            ? defaultModel
            : {...defaultModel, ...customModel}
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
        if (output && output.length > 0) {
            api.sendNotification({
                type: 'success',
                message: 'Successfully generated report',
                title: 'Showcase Generated!',
                actions: [
                    ...notifActions,
                    {
                        title: 'Save to file',
                        action: (dismiss) => {
                            saveToFile(api, output, showcaseTitle, selectedRenderer, dismiss);
                        }
                    }
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