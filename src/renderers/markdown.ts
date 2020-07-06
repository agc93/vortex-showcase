import { IShowcaseRenderer } from "../templating";
import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { ModInfoDisplay, ITemplateModel } from "../modinfo";
import path = require('path');
import { fs, util } from "vortex-api";
import Mustache from "mustache";

export class MarkdownRenderer implements IShowcaseRenderer {
    createFileName(title: string): string {
        return util.deriveInstallName(title, undefined) + '.md';
    }
    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay {
        var model = ModInfoDisplay.create(api, mod);
        if (model.source && model.source == 'nexus' && model.link) {
            model.source = `[Nexus Mods](${model.link})`;
        }
        return model;
    }
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string> {
        var template = fs.readFileSync(path.join(__dirname, 'markdown.mustache'), { encoding: 'utf8' });
        var output = Mustache.render(template, model);
        return Promise.resolve(output);
    }
}