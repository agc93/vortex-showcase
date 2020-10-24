import * as React from 'react';
import { connect } from 'react-redux';
import * as Redux from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { withTranslation } from 'react-i18next';
import { ComponentEx, More, log } from 'vortex-api';
import { setShowcaseSort } from '.';
import { IState } from 'vortex-api/lib/types/api';
import { HelpBlock, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import { Settings } from './actions';

interface IBaseProps {
    t: any
}

interface IConnectedProps {
    sortOrder: string;
}

interface IActionProps {
    onSetSortOrder: (order: string) => void;
}

type IProps = IConnectedProps & IActionProps & IBaseProps;

class GeneralSettings extends ComponentEx<IProps, {}> {
    public modes = {
        'alphabetical': 'Alphabetical',
        'deploy-order': 'Deploy Order',
        'install-time': 'Install Time'
    };

    public render = (): JSX.Element => {
        const { t, sortOrder } = this.props;
        var modes = Object.keys(this.modes).map(m => {
            return <option value={m}>{t(this.modes[m])}</option>
        });
        return (
            <form>
                <FormGroup>
                    <ControlLabel>
                        {t('Default Showcase sort order')}
                        <More id="showcase-sort-order" name={t('Showcase Sort Order')}>
                            {t(this.getHelpText())}
                        </More>
                    </ControlLabel>
                    <FormControl
                        componentClass='select'
                        onChange={this.setSortOrder}
                        value={sortOrder}
                    >
                        {modes}
                    </FormControl>
                    <HelpBlock>
                        This setting will just control the order that mods will appear in your generated showcases.
                    </HelpBlock>
                </FormGroup>
            </form>
        );
    }
    
    private setSortOrder = (evt) => {
        const target: HTMLSelectElement = evt.target as HTMLSelectElement;
        var ms = Object.keys(this.modes);
        if (ms.indexOf(target.value) !== -1) {
            var newMode = ms.find(m => m.toLowerCase() == target.value.toLowerCase());
            log('debug', 'changing default sort order', {newMode});
            this.props.onSetSortOrder(newMode);
        } else {
            log('error', 'invalid sort order mode', target.value);
        }
    }

    private getHelpText = (): string => {
        return "When you generate a new showcase, regardless of the format, mods will appear in alphabetical order by default. You can use this setting to instead control the order in which the mods will be passed to your chosen format, but not every format will preserve the ordering exactly.";
    }
}


function mapStateToProps(state: IState): IConnectedProps {
    return {
        sortOrder: Settings.getSortOrder(state)
    };
}

function mapDispatchToProps(dispatch: ThunkDispatch<any, null, Redux.Action>): IActionProps {
    return {
        onSetSortOrder: (sortMode: string) => dispatch(setShowcaseSort(sortMode))
    }
}

export default
    withTranslation(['vortex-showcase', 'common'])(connect(mapStateToProps, mapDispatchToProps)(GeneralSettings));
