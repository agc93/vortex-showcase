import { fs, util, log, selectors } from "vortex-api";
import { IExtensionApi, IMod, INotificationAction, IDialogResult, ICheckbox } from "vortex-api/lib/types/api";
import { ITemplateModel, ModInfoDisplay } from "./modinfo";
import Mustache from "mustache";
import { remote } from "electron";
import path = require('path');
import { rendererStore } from "./store";

export interface IShowcaseRenderer {
    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string>;
    createFileName(title: string): string|undefined;
}

export interface IShowcaseAction {
    (renderer: string, output: string): Promise<void>
}

type RendererRef = {name: string, renderer: IShowcaseRenderer};

export function writeToClipboard(renderer: string, output: string): Promise<void> {
    remote.clipboard.writeText(output);
    return;
}

const knownExtensions = {
    'Markdown': '.md',
    'CSV': '.csv'
}

export async function renderShowcase(api: IExtensionApi, gameTitle: string, showcaseTitle: string, mods: IMod[], selectedRenderer: RendererRef) {
    var renderer = selectedRenderer.renderer;
    var user = util.getSafe(api.getState().persistent, ['nexus', 'userInfo', 'name'], undefined) ?? 'an unknown user';
    var modInfo = mods.map(m => renderer.createModel(api, m));
    log('debug', `generated ${modInfo.length} models from ${mods.length} included mods`);
    var model: ITemplateModel = {
        game: gameTitle,
        title: showcaseTitle,
        user: user,
        mods: modInfo
    }
    var output = await renderer.createShowcase(api, model);
    var actions = getNotificationActions(api, selectedRenderer.name, output);
    if (output && output.length > 0) {
        api.sendNotification({
            type: 'success',
            message: 'Successfully generated report',
            title: 'Showcase Generated!',
            actions: [
                ...actions,
                {
                    title: 'Save to file',
                    action: (dismiss) => {
                        saveToFile(output, showcaseTitle, selectedRenderer, dismiss);
                    }
                }
            ]
        })
    }
}

function getActions(api: IExtensionApi): {[key: string]: IShowcaseAction} {
    var actions = util.getSafe(api.getState().session, ['showcase', 'actions'], {});
    return actions;
}

function getNotificationActions(api: IExtensionApi, rendererName: string, output: string): INotificationAction[] {
    var allSessionActions = getActions(api);
    if (Object.keys(allSessionActions).length < 3) {
        var sessionActions = Object.keys(allSessionActions).map(a => {
            return {
                title: a,
                action: (dismiss) => {
                    allSessionActions[a](rendererName, output);
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
                                Object.keys(allSessionActions).map(a => {
                                    return {
                                        id: a,
                                        text: a,
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
                            var enabledActions = Object.keys(allSessionActions).filter(a => result.input[a]);
                            for (const action of enabledActions) {
                                allSessionActions[action](rendererName, output);
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

async function saveToFile(content: string, title: string, renderer: RendererRef, callback?: () => void) {
    const showcasePath = path.join(util.getVortexPath('temp'), 'Showcase');
    await fs.ensureDirWritableAsync(showcasePath, () => Promise.resolve());
    var fileName = renderer.renderer.createFileName(title);
    if (fileName == undefined) {
        fileName = util.deriveInstallName(title, undefined) + '.txt';
    }
    const tmpPath = path.join(showcasePath, fileName);
    await fs.writeFileAsync(tmpPath, content);
    util.opn(showcasePath).catch(() => null);
    callback?.();
}