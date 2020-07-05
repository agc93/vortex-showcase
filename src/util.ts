import path = require('path');
import { IInstruction, IExtensionApi, IGame, IState, IMod } from "vortex-api/lib/types/api";
import { remote } from 'electron';
import { selectors, util } from 'vortex-api';
import { ModInfoDisplay } from './modinfo';

export function toFriendlyName(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').trim()
}

export function getGamePath(api: IExtensionApi, game: IGame, useDataPath?: boolean) {
    const state = api.getState();
    const discovery = state.settings.gameMode.discovered[game.id];
    return useDataPath ? path.join(discovery.path, 'Data') : discovery.path;
}

export function isSupported(instances?: string[]) : boolean {
    return true;
}

export function getCategoryName(category: string, state: IState) : string | undefined {
    if (!category) {
        return undefined;
    }
    var gameId = selectors.activeGameId(state);
    return util.getSafe(state.persistent, ['categories', gameId, category, 'name'], undefined);
}

export function formatInstallTime(installTime: string) : string | undefined {
    if (!installTime) {
        return undefined;
    } else {
        var d = new Date(installTime);
        return d.toLocaleDateString();
    }
}

export function getModLink(mod: IMod, gameFallback?: string): string {
    var source = util.getSafe(mod.attributes, ['source'], undefined);
    if (source && source == 'nexus') {
        try {
            var game = util.getSafe(mod.attributes, ['downloadGame'], gameFallback);
            var id = util.getSafe(mod.attributes, ['modId'], undefined);
            return `https://www.nexusmods.com/${game}/mods/${id}`;
        } catch (error) {
            return 'about:blank';
        }
    }
    return 'about:blank';
}