import { IState, IMod, IExtensionApi, IProfileMod } from "vortex-api/lib/types/api";
import { log, selectors, util } from 'vortex-api';

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
 * Returns a string representing the mod version from mod attributes.
 * 
 * @param mod The mod object
 * @param fallbackVersion Fallback/default value for the version, if not found in mod attributes
 */
export function getModVersionText(mod: IMod, fallbackVersion?: string): string {
    try {
        fallbackVersion = fallbackVersion ?? '';
        var rawVersion = util.getSafe<string>(mod.attributes, ['version'], undefined);
        rawVersion ? String(rawVersion).match(/^[A-Za-z]+/) ? rawVersion : `v${rawVersion}` : fallbackVersion;
        return rawVersion;
    } catch (error) {
        log('error', 'Error parsing version value from mod!', {rawVersion, mod: mod.installationPath});
        return '';
    }
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
 * Returns the uploaded date for a given mod (if available, otherwise undefined)
 * 
 * @param mod The mod
 */
export function getUploadedDate(mod: IMod): Date|undefined {
    var uploaded = util.getSafe<number>(mod.attributes, ['uploadedTimestamp'], undefined);
    if (uploaded) {
        var d = new Date(uploaded * 1000);
        return d;
    }
    return undefined;
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