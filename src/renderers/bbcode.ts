import { IShowcaseRenderer } from "../templating";
import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { ModInfoDisplay, ITemplateModel } from "../modinfo";
import path = require('path');
import { fs } from "vortex-api";
import Mustache from "mustache";

/**
 * Format renderer for BBCode output
 * @internal
 */
export class BBCodeRenderer implements IShowcaseRenderer {
    createFileName(title: string): string {
        return undefined;
    }
    createModel(api: IExtensionApi, mod: IMod, defaultFn?: () => ModInfoDisplay): ModInfoDisplay {
        var model = defaultFn();
        if (model.source && model.link) {
            model.source = `[url=${model.link}]${model.source == 'nexus' ? 'Nexus Mods' : model.source}[/url]`;
        }
        return model;
    }
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string> {
        var template = fs.readFileSync(path.join(__dirname, 'bbcode.mustache'), { encoding: 'utf8' });
        var output = Mustache.render(template, model);
        return Promise.resolve(output);
    }
    allowSave() { return false;}
}