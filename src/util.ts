import { IState, IMod, IExtensionApi, IProfileMod } from "vortex-api/lib/types/api";
import { selectors, util } from 'vortex-api';

/**
 * Formats the given installation timestamp.
 * 
 * @param installTime The timestamp string to format.
 * @internal
 */
export function formatInstallTime(installTime: string) : string | undefined {
    if (!installTime) {
        return undefined;
    } else {
        var d = new Date(installTime);
        return d.toLocaleDateString();
    }
}

/**
 * Returns a link for the given mod from mod attributes, with special handling for Nexus links.
 * 
 * @param mod The mod object.
 * @param gameFallback Fallback/default value for the game, if not found in mod attributes.
 * @internal
 */
export function getModLink(mod: IMod, gameFallback?: string): string {
    var homepage = util.getSafe(mod.attributes, ['homepage'], undefined);
    if (homepage) {
        return homepage;
    }
    var source = util.getSafe(mod.attributes, ['source'], undefined);
    if (source && source == 'nexus') {
        try {
            var game = util.getSafe(mod.attributes, ['downloadGame'], util.getSafe(mod.attributes, ['game'], gameFallback));
            var id = util.getSafe(mod.attributes, ['modId'], undefined);
            return `https://www.nexusmods.com/${game}/mods/${id}`;
        } catch (error) {
            return 'about:blank';
        }
    }
    return '';
}

/**
 * Returns the mod type for the given mod (name if available, otherwise id)
 * 
 * @param mod The mod
 * @internal
 */
export function getModType(mod: IMod): string {
    var modType = util.getModType(mod.type);
    return toTitleCase(modType?.options?.name ?? modType?.typeId ?? 'default');
}

/**
 * Title cases the given string
 * 
 * @param str The input string
 * @internal
 */
export function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        function(txt: string) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

/**
 * Gets the enabled mods for the given game.
 * 
 * @param state The app state
 * @param gameId Game ID to get mods for
 * @internal
 */
export function getEnabledMods(state: IState, gameId: string) {
    var mods = util.getSafe<{ [modId: string]: IMod; }>(state.persistent, ['mods', gameId], {});
    var profile = selectors.activeProfile(state);
    var profileMods: { [modId: string]: IProfileMod } = util.getSafe(profile, ['modState'], {});
    var enabledMods = Object.keys(profileMods).filter(pm => profileMods[pm].enabled).map(epm => mods[epm]);
    return enabledMods;
}