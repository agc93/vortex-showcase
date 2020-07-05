import { fs, log, util, selectors } from "vortex-api";
import { IExtensionContext, IExtensionApi, IGame, IMod, IDialogResult, ICheckbox, IProfileMod } from 'vortex-api/lib/types/api';

import { isSupported } from "./util";
import { renderShowcase, IShowcaseRenderer } from "./templating";
import { rendererStore, registerShowcaseRenderer } from "./store";
import { MarkdownRenderer, BBCodeRenderer, CSVRenderer } from "./renderers";

export type ModList = { [modId: string]: IMod; };
export type ProfileMods = { [modId: string]: IProfileMod };


export const EXT_ID = 'vortex-showcase'

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    const registerRenderer = (key: string, rendererFn: () => IShowcaseRenderer) => {
        context.api.store.dispatch(registerShowcaseRenderer(key, rendererFn));
    }
    context.registerReducer(['session', 'showcase'], rendererStore);
    // context.registerAPI('addShowcaseRenderer', (key: string, rendererFunc: () => IShowcaseRenderer) => registerRenderer(key, rendererFunc), {});
    context.once(() => {
        context.api.store.dispatch(registerShowcaseRenderer('Markdown', () => new MarkdownRenderer()));
        context.api.store.dispatch(registerShowcaseRenderer('BBCode', () => new BBCodeRenderer()));
        context.api.store.dispatch(registerShowcaseRenderer('CSV', () => new CSVRenderer()));
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
                { label: 'Cancel' },
                { label: 'Create' }
            ]);
        if (result.action == 'Cancel') {
            return;
        }
        if (result.action == 'Create') {
            var selection = Object.keys(result.input).find(ri => result.input[ri]);
            log('debug', 'activating showcase renderer', { selection });
            var renderer = renderers[selection]()
            renderShowcase(api, currentGame.name, result.input.name, includedMods, renderer)
        }
    }
}


module.exports = {
    default: main,
};