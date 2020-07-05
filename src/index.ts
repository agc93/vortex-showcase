import path = require('path');
import { fs, log, util, selectors } from "vortex-api";
import { IExtensionContext, IDiscoveryResult, IState, ISupportedResult, ProgressDelegate, IInstallResult, IExtensionApi, IGameStoreEntry, IGame, IMod, IDialogResult, ICheckbox } from 'vortex-api/lib/types/api';

import { getGamePath, isSupported} from "./util";
import { createMarkdownShowcase, renderShowcase, MarkdownRenderer } from "./templating";
import { rendererStore, registerShowcaseRenderer } from "./store";

export type ModList = { [modId: string]: IMod; };


export const EXT_ID = 'vortex-showcase'

//This is the main function Vortex will run when detecting the game extension. 
function main(context : IExtensionContext) {
    context.registerReducer(['session', 'showcase'], rendererStore);
    context.once(() => {
        context.api.store.dispatch(registerShowcaseRenderer('Markdown', () => new MarkdownRenderer()))
    });

    context.registerAction('mod-icons', 101, 'layout-list', {}, 'Create Showcase', (instanceIds) => {
        createShowcase(context.api, instanceIds);
    }, isSupported);
    context.registerAction('mods-multirow-actions', 400, 'layout-list', {}, 'Create Showcase', (instanceIds) => {
        createShowcase(context.api, instanceIds);
    }, isSupported);
    
    // addProfileFeatures(context);
    return true
}

async function createShowcase(api: IExtensionApi, modIds: string[]) {
    var currentGame = selectors.currentGame(api.getState()) as IGame;
    var currentGameId = currentGame?.id;
    if (currentGame && currentGameId) {
        var mods = util.getSafe(api.getState().persistent, ['mods', currentGameId], {} as ModList);
        if (!modIds || modIds.length == 0) {
            // I'm not sure when this happens tbh
            // huh. turns out the top menu bar action does this. TIL.
            return;
        } else {
            log('debug', 'starting showcase generation', {mods: modIds});
            var includedMods = modIds.filter(i => Object.keys(mods).indexOf(i) != -1).map(id => mods[id]);
            if (includedMods.length == 0) {
                api.sendNotification({
                    title: 'No mods included!',
                    message: "We couldn't generate a showcase as there were no enabled mods included!",
                    type: 'error'
                });
                return;
            }
            var renderers = util.getSafe(api.getState().session, ['showcase', 'renderers'], {});
            var result: IDialogResult = await api.showDialog(
                'question',
                'Create Mod Showcase',
                {
                    text: `You are about to create a showcase based on ${includedMods.length} mods. Enter a name for your new showcase, and choose a format`,
                    input: [
                        {
                            id: 'name',
                            value: '',
                            label: 'Name'
                        }
                    ],
                    choices: 
                        Object.keys(renderers).map(r => {
                            return {
                                id: r,
                                text: r,
                                value: Object.keys(renderers).indexOf(r) == 0
                            } as ICheckbox
                        })
                },
                [
                    {label: 'Cancel'},
                    {label: 'Create'}
                ]);
            if (result.action == 'Cancel') {
                return;
            }
            if (result.action == 'Create') {
                var selection = Object.keys(result.input).find(ri => result.input[ri]);
                log('debug', 'activating showcase renderer', {selection});
                var renderer = renderers[selection]()
                renderShowcase(api, currentGame.name, result.input.name, includedMods, renderer)
            }
        }
    }
}


module.exports = {
    default: main,
};