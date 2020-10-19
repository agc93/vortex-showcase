import { IShowcaseRenderer } from "../templating";
import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { ModInfoDisplay, ITemplateModel } from "../modinfo";
import path = require('path');
import { fs, util } from "vortex-api";
import Mustache from "mustache";

/**
 * Format renderer for BBCode output
 * @internal
 */
export class PlainTextRenderer implements IShowcaseRenderer {
    createFileName(title: string): string {
        return `${util.deriveInstallName(title, undefined).substr(0, 64)}.txt`;
    }
    createModel(api: IExtensionApi, mod: IMod, defaultFn?: () => ModInfoDisplay): ModInfoDisplay {
        var model = defaultFn();
        if (model.source) {
            model.source = model.source == 'nexus' ? 'Nexus Mods' : model.source;
        }
        if (model.type && model.type === 'Default') {
            model.type = '';
        }
        return model;
    }
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string> {
        var template = fs.readFileSync(path.join(__dirname, 'plaintext.mustache'), { encoding: 'utf8' });
        var output = Mustache.render(template, model);
        return Promise.resolve(output);
    }
}