import Switch from '../components/Switch';
import * as actions from '../actions/';
import { connect, Dispatch } from 'react-redux';
import { IStoreState } from '../types';

const mapStateToProps = (state: IStoreState) => {
    return {
        label: state.borderWallSwitch.label,
        value: state.borderWallSwitch.value
    };
};

const mapDispatchToProps = (dispatch: Dispatch<actions.IToggleHitWall>) => ({
    onToggle: () => dispatch(actions.toggleHitWall())
});

const BorderWallSwitch = connect(mapStateToProps, mapDispatchToProps)(Switch);
export default BorderWallSwitch;