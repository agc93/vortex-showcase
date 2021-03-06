import { fs, log, util, selectors, actions } from "vortex-api";
import path = require('path');
import { IExtensionContext, IExtensionApi, IGame, IMod, IDialogResult, ICheckbox, IProfileMod, IDialogAction, IState } from 'vortex-api/lib/types/api';

import { getEnabledMods } from "./util";
import { renderShowcase, IShowcaseRenderer, IShowcaseAction } from "./templating";
import { rendererStore, registerShowcaseRenderer, registerShowcaseAction, updateMRU } from "./store";
import { MarkdownRenderer, BBCodeRenderer, PlainTextRenderer } from "./renderers";
import { ClipboardAction, UploadAction } from "./actions";
import { Settings, settingsReducer, ShowcaseSettings } from "./settings";

/**
 * @internal
 */
export type ModList = { [modId: string]: IMod; };
/**
 * @internal
 */
export type ProfileMods = { [modId: string]: IProfileMod };

type RendererStore = {[key: string]: () => IShowcaseRenderer};

/**
 * @public
 */
export type showcaseAPI = {
    addShowcaseRenderer: (key: string, rendererFunc: () => IShowcaseRenderer) => void;
    addShowcaseAction: (key: string, actionFn: () => IShowcaseAction) => void;
    // getEnabledMods: (gameId: string) => IMod[];
    createShowcase: (mods?: string[], format?: string, action?: string) => Promise<void>;
};

/**
 * @internal
 */
export const EXT_ID = 'vortex-showcase'

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    const registerRenderer = (key: string, rendererFn: () => IShowcaseRenderer) => {
        context.api.store.dispatch(registerShowcaseRenderer(key, rendererFn));
    }
    const registerAction = (key: string, actionFn: () => IShowcaseAction) => {
        context.api.store.dispatch(registerShowcaseAction(key, actionFn));
    }
    context.registerReducer(['settings', 'showcase'], settingsReducer)
    context.registerReducer(['session', 'showcase'], rendererStore);
    context.registerSettings('Interface', ShowcaseSettings, () => {t: context.api.translate}, () => true);
    // ↘ this isn't in 1.2.17, you idiot
    context.registerAPI('addShowcaseRenderer', (key: string, rendererFunc: () => IShowcaseRenderer) => registerRenderer(key, rendererFunc), {minArguments: 2});
    context.registerAPI('addShowcaseAction', (key: string, actionFn: () => IShowcaseAction) => registerAction(key, actionFn), {minArguments: 2});
    // context.registerAPI('getEnabledMods', (gameId: string) => getEnabledMods(context.api.getState(), gameId), {minArguments: 1} )
    context.registerAPI('createShowcase', (mods?: string[], format?: string, action?: string, title?: string) => createShowcase(context.api, mods, format, action), {minArguments: 0});
    context.once(() => {
        util.installIconSet('showcase', path.join(__dirname, 'icons.svg'));
        context.api.store.dispatch(registerShowcaseRenderer('Markdown', () => new MarkdownRenderer()));
        context.api.store.dispatch(registerShowcaseRenderer('BBCode', () => new BBCodeRenderer()));
        context.api.store.dispatch(registerShowcaseRenderer('Plain Text', () => new PlainTextRenderer()));
        context.api.store.dispatch(registerShowcaseAction('Copy', () => new ClipboardAction()));
        context.api.store.dispatch(registerShowcaseAction('Upload', () => new UploadAction(context.api)));
        context.api.events.on('create-showcase', (mods?: string[], format?: string, action?: string) => {
            createShowcase(context.api, mods, format, action);
        });
    });

    context.registerAction('mod-icons', 101, 'showcase', {}, 'Create Showcase', (instanceIds) => {
        createShowcase(context.api, instanceIds);
    }, () => true);
    context.registerAction('mods-multirow-actions', 400, 'showcase', {}, 'Create Showcase', (instanceIds) => {
        createShowcase(context.api, instanceIds);
    }, () => true);
    // addProfileFeatures(context);
    return true
}

async function createShowcase(api: IExtensionApi, modIds: string[], format?:string, action?:string) {
    var includedMods: IMod[] = [];
    modIds = modIds ?? [];
    var currentGame = selectors.currentGame(api.getState()) as IGame;
    var currentGameId = currentGame?.id;
    var mods = util.getSafe(api.getState().persistent, ['mods', currentGameId], {} as ModList);
    if (currentGame && currentGameId) {
        var availableMods = modIds.length > 0
            ? modIds.filter(i => Object.keys(mods).indexOf(i) != -1).map(id => mods[id])
            : getEnabledMods(api.getState(), currentGameId);
        var includedMods = availableMods.filter(m => m);
        if (availableMods.length != includedMods.length) {
            log('warn', 'Showcase mod loading found undefined mod entries', {undefineds: availableMods.filter(x => !includedMods.includes(x)).length});
        }
        log('debug', 'showcase creation started', {mods: (includedMods || []).length, available: availableMods.length});
        if (includedMods.length == 0) {
            api.sendNotification({
                title: 'No mods included!',
                message: "We couldn't generate a showcase as there were no enabled mods included!",
                type: 'error'
            });
            return;
        }
        var titleResult: IDialogResult = await api.showDialog(
            'question',
            'Create Mod Showcase',
            {
                text: `You are about to create a showcase based on ${includedMods.length} mods. First, enter a name for your new showcase below`,
                input: [
                    {
                        id: 'name',
                        value: '',
                        label: 'Name'
                    }
                ]
            },
            [
                { label: 'Cancel' },
                { label: 'Continue', default: true }
            ]);
        if (titleResult.action == 'Cancel') {
            return;
        }
        var userTitle = titleResult.input.name;
        var allRenderers = util.getSafe<RendererStore>(api.getState().session, ['showcase', 'renderers'], {});
        var rendererNames = Object.keys(allRenderers);
        var renderers: {[key: string]: IShowcaseRenderer} = rendererNames.map(rk =>  ({name: rk, renderer: allRenderers[rk]()})).filter(r => r.renderer.isEnabled ? r.renderer.isEnabled(currentGameId) : true).reduce((prev, curr) => {
            prev[curr.name] = curr.renderer;
            return prev;
        }, {});
        log('debug', 'loaded available renderers from session state', {renderers: Object.keys(renderers).length});
        var renderer: {name: string, renderer: IShowcaseRenderer};
        if (format == null) {
            var mru = util.getSafe(api.getState().session, ['showcase', 'mru'], undefined);
            var result: IDialogResult = await api.showDialog(
                'question',
                'Create Mod Showcase',
                {
                    text: 'You can create your showcase in a number of different formats, depending on how or where you want to share your mod list. Choose a format below and click Create to start generating your showcase.',
                    choices:
                        Object.keys(renderers).map(r => {
                            return {
                                id: r,
                                text: r,
                                value:  mru ? r == mru : Object.keys(renderers).indexOf(r) == 0
                            } as ICheckbox
                        })
                },
                [
                    { label: 'Cancel' },
                    { label: 'Create', default: true }
                ]);
            if (result.action == 'Cancel') {
                return;
            }
            if (result.action == 'Create') {
                var selection = Object.keys(result.input).find(ri => result.input[ri]);
                log('debug', 'activating showcase renderer', { selection });
                try {
                    api.store.dispatch(updateMRU(selection));
                } catch {}
                renderer = {name: selection, renderer: renderers[selection]};
                
            }
        } else if (typeof format == "string" && format != null) {
            log('debug', 'Output format specified at creation', {requestedFormat: format});
            var rendererKey = Object.keys(renderers).find(rk => rk.toLowerCase() == format.toLowerCase());
            renderer = {name: rendererKey, renderer: renderers[rendererKey]};
        }
        log('debug', 'starting showcase renderer', {
            game: currentGame.name, 
            title: userTitle, 
            mods: includedMods.length, 
            renderer: renderer?.name, 
            action: action || 'none'
        });
        try {
            var sort = Settings.getSortOrder(api.getState());
            switch (sort) {
                case 'deploy-order':
                    includedMods = await deploySort(api, includedMods);
                    break;
                case 'install-time':
                    includedMods = await timeSort(api, includedMods);
                case 'alphabetical':
                default:
                    break;
            }
        } catch (err) {
            log('error', 'Error encountered during showcase mod sort', {err});
            api.sendNotification({'type': 'warning', title: 'Showcase sorting failed!', message: 'Your showcase will still work, but might be out of order!'});
        }
        renderShowcase(api, currentGame.name, userTitle, includedMods, renderer, action)
    }
}

async function timeSort(api: IExtensionApi, mods: IMod[]): Promise<IMod[]> {
    var sorted = mods.sort((a, b) => {
        var aInstall = util.getSafe<string>(a.attributes, ['installTime'], undefined);
        var bInstall = util.getSafe<string>(b.attributes, ['installTime'], undefined);
        return aInstall == undefined || bInstall == undefined
            ? 0
            : aInstall.localeCompare(bInstall);
    })
    return sorted;
}

async function deploySort(api: IExtensionApi, mods: IMod[]): Promise<IMod[]> {
    var order: IMod[] = await util.sortMods(selectors.activeGameId(api.getState()), mods, api);
    var sorted = mods.sort((a, b) => {
        return order.indexOf(a) - order.indexOf(b);
    });
    return sorted;
}

module.exports = {
    default: main,
};