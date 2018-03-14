import Switch from '../components/Switch';
import * as actions from '../actions/';
import { connect } from 'react-redux';
import { IStoreState } from '../types';

const mapStateToProps = (state: IStoreState) => {
    return {
        label: state.highSpeedReducer.label,
        value: state.highSpeedReducer.value
    };
};

const mapDispatchToProps = {
    onToggle: actions.toggleHighSpeed
};

export default connect(mapStateToProps, mapDispatchToProps)(Switch);