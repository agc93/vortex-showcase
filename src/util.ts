import { IState, IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { selectors, util } from 'vortex-api';

export function toFriendlyName(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').trim()
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

export function getModName(mod: IMod, nameFallback?: string): string {
    return util.getSafe(mod.attributes, ['customFileName'], util.getSafe(mod.attributes, ['modName'], util.getSafe(mod.attributes, ['logicalFileName'], util.getSafe(mod.attributes, ['name'], undefined)))) ?? nameFallback;
}

export function getModLink(mod: IMod, gameFallback?: string): string {
    var homepage = util.getSafe(mod.attributes, ['homepage'], undefined);
    if (homepage) {
        return homepage;
    }
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
    return '';
}

export function getModType(mod: IMod): string {
    var modType = util.getModType(mod.type);
    return toTitleCase(modType?.options?.name ?? modType?.typeId ?? 'default');
}

export function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        function(txt: string) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}