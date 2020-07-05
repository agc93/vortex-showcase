import { fs, util, log } from "vortex-api";
import { IExtensionApi, IMod } from "vortex-api/lib/types/api";
import { ITemplateModel, ModInfoDisplay } from "./modinfo";
import Mustache from "mustache";
import { remote } from "electron";
import path = require('path');

export interface IShowcaseRenderer {
    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay
    createShowcase(api: IExtensionApi, model: ITemplateModel, mods: ModInfoDisplay[]): Promise<string>;
}

export class MarkdownRenderer implements IShowcaseRenderer {
    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay {
        var model = ModInfoDisplay.create(api, mod);
        if (model.source && model.source == 'nexus' && model.link) {
            model.source = `[Nexus Mods](${model.link})`;
        }
        return model;
    }
    createShowcase(api: IExtensionApi, model: ITemplateModel, mods: ModInfoDisplay[]): Promise<string> {
        var template = fs.readFileSync(path.join(__dirname, 'markdown.mustache'), { encoding: 'utf8' });
        var output = Mustache.render(template, model);
        return Promise.resolve(output);
    }

}

export async function renderShowcase(api: IExtensionApi, gameTitle: string, showcaseTitle: string, mods: IMod[], renderer: IShowcaseRenderer) {
    var user = util.getSafe(api.getState().persistent, ['nexus', 'userInfo', 'name'], undefined) ?? 'an unknown user';
    var modInfo = mods.map(m => renderer.createModel(api, m));
    log('debug', `generated ${modInfo.length} models from ${mods.length} included mods`);
    var model: ITemplateModel = {
        game: gameTitle,
        title: showcaseTitle,
        user: user,
        mods: modInfo
    }
    var output = await renderer.createShowcase(api, model, modInfo);
    if (output && output.length > 0) {
        api.sendNotification({
            type: 'success',
            message: 'Successfully generated report',
            title: 'Showcase Generated!',
            actions: [
                {
                    title: 'Copy',
                    action: (dismiss) => {
                        remote.clipboard.writeText(output);
                        dismiss();
                    }
                },
                {
                    title: 'Save to file',
                    action: (dismiss) => {
                        saveToFile(output, showcaseTitle, dismiss);
                    }
                }
            ]
        })
    }
}

export function createMarkdownShowcase(api: IExtensionApi, gameTitle: string, showcaseTitle: string, mods: IMod[]) {
    var template = fs.readFileSync(path.join(__dirname, 'markdown.mustache'), { encoding: 'utf8' });
    var user = util.getSafe(api.getState().persistent, ['nexus', 'userInfo', 'name'], undefined) ?? 'an unknown user';
    var model: ITemplateModel = {
        game: gameTitle,
        title: showcaseTitle,
        user: user,
        mods: mods.map(m => createMarkdownModel(api, m))
    }
    var output = Mustache.render(template, model,);
    if (output && output.length > 0) {
        api.sendNotification({
            type: 'success',
            message: 'Successfully generated markdown report',
            title: 'Showcase Generated!',
            actions: [
                {
                    title: 'Copy',
                    action: (dismiss) => {
                        remote.clipboard.writeText(output);
                        dismiss();
                    }
                },
                {
                    title: 'Save to file',
                    action: (dismiss) => {
                        saveToFile(output, showcaseTitle, dismiss);
                    }
                }
            ]
        })
    }
}

function createMarkdownModel(api: IExtensionApi, mod: IMod): ModInfoDisplay {
    var model = ModInfoDisplay.create(api, mod);
    if (model.source && model.source == 'nexus' && model.link) {
        model.source = `[Nexus Mods](${model.link})`;
    }
    return model;
}

async function saveToFile(content: string, title: string, callback?: () => void) {
    const showcasePath = path.join(util.getVortexPath('temp'), 'Showcase');
    await fs.ensureDirWritableAsync(showcasePath, () => Promise.resolve());
    const tmpPath = path.join(showcasePath, util.deriveInstallName(title, undefined) + ".md");
    await fs.writeFileAsync(tmpPath, content);
    util.opn(showcasePath).catch(() => null);
}