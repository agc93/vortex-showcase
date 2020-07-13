import { IShowcaseRenderer } from "../templating";
import { IMod, IExtensionApi } from "vortex-api/lib/types/api";
import { ModInfoDisplay, ITemplateModel } from "../modinfo";

export class DiscordRenderer implements IShowcaseRenderer {
    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay {
        var model = ModInfoDisplay.create(api, mod);
        if (model.source == 'nexus') {
            model.source = 'Nexus Mods';
        }
        return model;
    }
    createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string> {
        api.dismissNotification('showcase-d-maxlength');
        var modText = model.mods.map(m => {
            return `${m.name} \`${m.version ? m.version.startsWith('v') ? m.version : ('v' + m.version) : '?'}\` [${m.type && m.type.toLowerCase() != 'default' ? m.type + '/' : ''}${m.source}]`
        });
        var showcaseText = `**${model.title}** (_${model.user}_):`
        var counter = 0;
        do {
            showcaseText += `\n${modText[counter]}`;
            counter++;
        } while (showcaseText.length < 2000 && counter < modText.length && counter < 20);
        if (counter < modText.length -1) {
            //we couldn't fit them all in
            api.sendNotification({
                title: 'Max length exceeded',
                message: 'Discord messages are limited to 2000 characters',
                type: 'warning',
                actions: [
                    {
                        'title': 'More...',
                        action: (dismiss) => {
                            api.showDialog('info', 'Discord message limit reached', {
                                text: 'Discord messages are limited to 2000 characters total. To avoid exceeding that length (or spamming channels), your showcase has been created, but limited to only the first 20 mods or 2000 characters, whichever comes first.'
                            }, [
                                {label: 'Close', action: () => dismiss()}
                            ]);
                        }
                    }
                ],
                id: 'showcase-d-maxlength'
            });
        }
        return Promise.resolve(showcaseText);
    }
}