import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { util, selectors } from "vortex-api";
import { getCategoryName, formatInstallTime, getModLink } from "./util";

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

    static create(api: IExtensionApi, mod: IMod): ModInfoDisplay {
        var game = util.getSafe(mod.attributes, ['downloadGame'], selectors.activeGameId(api.getState()))
        return {
            description: util.getSafe(mod.attributes, ['shortDescription'], util.getSafe(mod.attributes, ['description'], '')),
            gameId: game,
            name: util.getSafe(mod.attributes, ['modName'], util.getSafe(mod.attributes, ['logicalFileName'], '')),
            image: util.getSafe(mod.attributes, ['pictureUrl'], undefined),
            category: getCategoryName(util.getSafe(mod.attributes, ['category'], undefined), api.getState()) ?? 'Unknown',
            author: util.getSafe(mod.attributes, ['author'], 'Unknown Author'),
            version: util.getSafe(mod.attributes, ['version'], undefined),
            installed: formatInstallTime(util.getSafe(mod.attributes, ['installTime'], undefined)),
            source: util.getSafe(mod.attributes, ['source'], 'unknown source'),
            link: getModLink(mod, game)
        }
    }
}

export class NexusInfo {
    id: number;
    link: string;
}

export interface ITemplateModel {
    title: string;
    user: string;
    mods: ModInfoDisplay[];
    game: string;
}