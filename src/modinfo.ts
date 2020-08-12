import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { util, selectors } from "vortex-api";
import { formatInstallTime, getModLink, getModType } from "./util";
import { getModName, getCategoryName } from "vortex-ext-common";

/**
 * @public
 */
export class ModInfoDisplay {
    name: string;
    gameId: string;
    description: string;
    image?: string;
    nexus?: NexusInfo;
    link?: string;
    version: string;
    category?: string;
    author: string;
    installed?: string;
    source: string;
    type: string;
    notes: string;
    meta: any;

    static create(api: IExtensionApi, mod: IMod): ModInfoDisplay {
        var game = util.getSafe(mod.attributes, ['downloadGame'], selectors.activeGameId(api.getState()))
        return {
            description: util.getSafe(mod.attributes, ['shortDescription'], util.getSafe(mod.attributes, ['description'], '')),
            gameId: game,
            name: getModName(mod, ''),
            image: util.getSafe(mod.attributes, ['pictureUrl'], undefined),
            category: getCategoryName(util.getSafe(mod.attributes, ['category'], undefined), api.getState()) ?? 'Unknown',
            author: util.getSafe(mod.attributes, ['author'], 'Unknown Author'),
            version: util.getSafe(mod.attributes, ['version'], undefined),
            installed: formatInstallTime(util.getSafe(mod.attributes, ['installTime'], undefined)),
            source: util.getSafe(mod.attributes, ['source'], 'unknown source'),
            link: getModLink(mod, game),
            type: getModType(mod),
            notes: util.getSafe(mod.attributes, ['notes'], undefined),
            meta: {}
        }
    }
}

/**
 * 
 * @param api 
 * @param mod 
 * 
 * @public
 */
export function getDefaultModInfo(api: IExtensionApi, mod: IMod): ModInfoDisplay {
    return ModInfoDisplay.create(api, mod);
}

/**
 * @public
 */
export class NexusInfo {
    id: number;
    link: string;
}

/**
 * @public
 */
export interface ITemplateModel {
    title: string;
    user: string;
    mods: ModInfoDisplay[];
    game: string;
}