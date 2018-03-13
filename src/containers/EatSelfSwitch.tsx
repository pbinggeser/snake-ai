import Switch from '../components/Switch';
import * as actions from '../actions/';
import { connect, Dispatch } from 'react-redux';
import { IStoreState } from '../types';

const mapStateToProps = (state: IStoreState) => {
    return {
        label: state.eatSelfSwitch.label,
        value: state.eatSelfSwitch.value
    };
};

const mapDispatchToProps = (dispatch: Dispatch<actions.IToggleEatSelf>) => ({
    onToggle: () => dispatch(actions.toggleEatSelf())
});

export default connect(mapStateToProps, mapDispatchToProps)(Switch);