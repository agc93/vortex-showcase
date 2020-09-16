import { util } from 'vortex-api';
import { IShowcaseAction } from "../templating";
import { IExtensionApi } from 'vortex-api/lib/types/api';
import { remote } from 'electron';
import { PrivateBinClient, getPasteUrl } from "@agc93/privatebin";

const PRIVATEBIN_HOST = 'showcase.report';

export class UploadAction implements IShowcaseAction {
    private _api: IExtensionApi;
    /**
     *
     */
    constructor(api: IExtensionApi) {
        this._api = api;
    }
    runAction = async (renderer: string, output: string): Promise<void> => {
        var progress = this._api.sendNotification({
            'type': 'activity',
            message: 'Uploading your showcase...'
        });
        try {
            var client = new PrivateBinClient(PRIVATEBIN_HOST);
            var result = await client.uploadContent(output, {uploadFormat: renderer == "Markdown" ? 'markdown' : 'plaintext', expiry: '1month'});
            this._api.dismissNotification(progress);
            if (!result || !result.success) {
                this._api.showErrorNotification('Failed to upload showcase!', null, {allowReport: false});
            } else {
                this._api.sendNotification({
                    type: 'success',
                    title: 'Showcase Uploaded!',
                    message: "You can now share your showcase with this private link",
                    actions: [
                        {title: 'View...', 
                        action: dismiss => {
                            util.opn(getPasteUrl(result));
                            dismiss();
                        }},
                        {title: 'Copy Link', 
                            action: dismiss => {
                                remote.clipboard.writeText(getPasteUrl(result));
                                dismiss();
                        }}
                    ]
                })
            }
        } catch (err) {
            this._api.dismissNotification(progress);
            this._api.showErrorNotification("Error while uploading showcase!", err, {allowReport: false});
        }
        
    }
    isEnabled?(renderer: string): boolean {
        return renderer == "Markdown";
    }
}
