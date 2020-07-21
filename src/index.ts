import { fs, log, util, selectors, actions } from "vortex-api";
import path = require('path');
import { IExtensionContext, IExtensionApi, IGame, IMod, IDialogResult, ICheckbox, IProfileMod, IDialogAction } from 'vortex-api/lib/types/api';

import { isSupported } from "./util";
import { renderShowcase, IShowcaseRenderer, writeToClipboard, IShowcaseAction } from "./templating";
import { rendererStore, registerShowcaseRenderer, registerShowcaseAction } from "./store";
import { MarkdownRenderer, BBCodeRenderer, CSVRenderer, DiscordRenderer } from "./renderers";

export type ModList = { [modId: string]: IMod; };
export type ProfileMods = { [modId: string]: IProfileMod };


export const EXT_ID = 'vortex-showcase'

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    const registerRenderer = (key: string, rendererFn: () => IShowcaseRenderer) => {
        context.api.store.dispatch(registerShowcaseRenderer(key, rendererFn));
    }
    const registerAction = (key: string, action: IShowcaseAction) => {
        context.api.store.dispatch(registerShowcaseAction(key, action));
    }
    context.registerReducer(['session', 'showcase'], rendererStore);
    // ↘ this isn't in 1.2.17, you idiot
    // context.registerAPI('addShowcaseRenderer', (key: string, rendererFunc: () => IShowcaseRenderer) => registerRenderer(key, rendererFunc), {minArguments: 2});
    // context.registerAPI('addShowcaseAction', (key: string, action: IShowcaseAction) => registerAction(key, action), {minArguments: 2});
    context.once(() => {
        util.installIconSet('showcase', path.join(__dirname, 'icons.svg'));
        context.api.store.dispatch(registerShowcaseRenderer('Markdown', () => new MarkdownRenderer()));
        context.api.store.dispatch(registerShowcaseRenderer('BBCode', () => new BBCodeRenderer()));
        context.api.store.dispatch(registerShowcaseRenderer('CSV', () => new CSVRenderer()));
        context.api.store.dispatch(registerShowcaseRenderer('Discord', () => new DiscordRenderer()));
        context.api.store.dispatch(registerShowcaseAction('Copy', writeToClipboard));
    });

    context.registerAction('mod-icons', 101, 'showcase', {}, 'Create Showcase', (instanceIds) => {
        createShowcase(context.api, instanceIds);
    }, isSupported);
    context.registerAction('mods-multirow-actions', 400, 'showcase', {}, 'Create Showcase', (instanceIds) => {
        createShowcase(context.api, instanceIds);
    }, isSupported);

    // addProfileFeatures(context);
    return true
}

async function createShowcase(api: IExtensionApi, modIds: string[]) {
    var includedMods: IMod[] = [];
    var currentGame = selectors.currentGame(api.getState()) as IGame;
    var currentGameId = currentGame?.id;
    if (currentGame && currentGameId) {
        var mods = util.getSafe(api.getState().persistent, ['mods', currentGameId], {} as ModList);
        if (!modIds || modIds.length == 0) {
            // I'm not sure when this happens tbh
            // huh. turns out the top menu bar action does this. TIL.
            var profile = selectors.activeProfile(api.getState());
            var profileMods: ProfileMods = util.getSafe(profile, ['modState'], {});
            var enabledMods = Object.keys(profileMods).filter(pm => profileMods[pm].enabled).map(epm => mods[epm]);
            includedMods = enabledMods;
        } else {
            log('debug', 'starting showcase generation', { mods: modIds });
            includedMods = modIds.filter(i => Object.keys(mods).indexOf(i) != -1).map(id => mods[id]);
        }
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
        var renderers = util.getSafe(api.getState().session, ['showcase', 'renderers'], {});
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
                            value: Object.keys(renderers).indexOf(r) == 0
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
            var renderer = renderers[selection]()
            renderShowcase(api, currentGame.name, userTitle, includedMods, {name: selection, renderer})
        }
    }
}


module.exports = {
    default: main,
};