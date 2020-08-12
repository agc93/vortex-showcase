import { IShowcaseAction } from "../templating";
import { remote } from "electron";

/**
 * Showcase action for copying a showcase to the clipboard.
 * @internal
 */
export class ClipboardAction implements IShowcaseAction {
    runAction(renderer: string, output: string): Promise<void> {
        remote.clipboard.writeText(output);
        return;
    }
}