import { createAction } from 'redux-act';
import { util, actions } from "vortex-api";
import { IReducerSpec, IState } from 'vortex-api/lib/types/api';

export const setShowcaseSort =
    createAction('VSC_SORT_MODE', (sortMode: string) => sortMode);

export const settingsReducer: IReducerSpec = {
    reducers: {
        [setShowcaseSort as any]: (state, payload: string) => {
            return util.setSafe(state, ['sortMode'], payload);
        }
    },
    defaults: {
        sortMode: 'alphabetical'
    }
};

export const Settings = {
    getSortOrder: (state: IState): string|undefined => {
        return util.getSafe(state.settings, ['showcase', 'sortMode'], undefined);
    }
}