import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { util, selectors } from "vortex-api";
import { formatInstallTime, getModLink, getModType, getModVersionText, getUploadedDate } from "./util";
import { getModName, getCategoryName } from "vortex-ext-common";

/**
 * @public
 */
export type ModDeploymentMeta = {order?: number, time?: Date};

/**
 * @public
 */
export class ModInfoDisplay {
    name: string;
    gameId: string;
    gameName: string;
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
    deployment: ModDeploymentMeta;
}

/**
 * @internal
 * Creates the default mod info model for a given mod.
 * 
 * @param api The extension API
 * @param mod The mod to create info model for.
 */
export function createModInfo(api: IExtensionApi, mod: IMod): ModInfoDisplay {
    const getGameName = (gameId: string) => {
        var knownGames = util.getSafe<{name: string; id: string}[]>(api.getState().session, ['gameMode', 'known'], []);
        var knownGame = knownGames.find(g => g.id == gameId);
        return knownGame ? knownGame.name : gameId;
    }
    var game = util.getSafe(mod.attributes, ['downloadGame'], selectors.activeGameId(api.getState()))
    var gameName = getGameName(game);
    return {
        description: util.getSafe(mod.attributes, ['shortDescription'], util.getSafe(mod.attributes, ['description'], '')),
        gameId: game,
        gameName: gameName,
        name: getModName(mod, ''),
        image: util.getSafe(mod.attributes, ['pictureUrl'], undefined),
        category: getCategoryName(util.getSafe(mod.attributes, ['category'], undefined), api.getState()) ?? 'Unknown',
        author: util.getSafe(mod.attributes, ['author'], 'Unknown Author'),
        version: getModVersionText(mod),
        installed: formatInstallTime(util.getSafe(mod.attributes, ['installTime'], undefined)),
        source: util.getSafe(mod.attributes, ['source'], 'unknown source'),
        link: getModLink(mod, game),
        type: getModType(mod),
        notes: util.getSafe(mod.attributes, ['notes'], undefined),
        nexus: {
            id: util.getSafe(mod.attributes, ['modId'], undefined), 
            fileId: util.getSafe(mod.attributes, ['fileId'], undefined),
            endorsed: util.getSafe<string>(mod.attributes, ['endorsed'], "") === "Endorsed",
            uploaded: getUploadedDate(mod)
        },
        meta: {},
        deployment: {}
    }
}

/**
 * @public
 */
export interface NexusInfo {
    id: number;
    fileId: number;
    endorsed: boolean;
    uploaded: Date;
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