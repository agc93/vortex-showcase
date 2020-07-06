import { createAction } from 'redux-act';
import { util, actions } from "vortex-api";
import { IReducerSpec } from 'vortex-api/lib/types/api';
import { IShowcaseRenderer, IShowcaseAction } from "./templating";

/*
 * add a showcase format
 */
export const registerShowcaseRenderer =
    createAction('SC_ADD_RENDERER', (name: string, renderer: (() => IShowcaseRenderer)) => ({name, renderer}));

export const registerShowcaseAction =
    createAction('SC_ADD_ACTION', (name: string, action: IShowcaseAction) => ({name, action}));

/**
 * reducer for extension settings
 */
export const rendererStore: IReducerSpec = {
    reducers: {
        [registerShowcaseRenderer as any]: (state, payload: ({name: string, renderer: (() => IShowcaseRenderer)})) => {
            return util.setSafe(state, ['renderers', payload.name], payload.renderer)
        },
        [registerShowcaseAction as any]: (state, payload: ({name: string, action: IShowcaseAction})) => {
            return util.setSafe(state, ['actions', payload.name], payload.action);
        }
    },
    defaults: {
        renderers: {},
        actions: {}
    }
};