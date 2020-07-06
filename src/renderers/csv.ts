import { IShowcaseRenderer } from "../templating";
import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { ModInfoDisplay, ITemplateModel } from "../modinfo";
import path = require('path');
import { fs, util } from "vortex-api";
import Mustache from "mustache";

export class CSVRenderer implements IShowcaseRenderer {
    createFileName(title: string): string {
        return util.deriveInstallName(title, undefined) + '.csv';
    }
    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay {
        var model = ModInfoDisplay.create(api, mod);
        model.description = model.description.replace(/"/g, "'");
        if (model.name == '') {
            model.name = mod.id;
        }
        return model;
    }
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string> {
        var template = fs.readFileSync(path.join(__dirname, 'csv.mustache'), { encoding: 'utf8' });
        var output = Mustache.render(template, model);
        return Promise.resolve(output);
    }
}