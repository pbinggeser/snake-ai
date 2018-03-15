import Switch from '../components/Switch';
import * as actions from '../actions/';
import { connect } from 'react-redux';
import { IStoreState } from '../types';

const mapStateToProps = (state: IStoreState) => {
    return {
        label: state.growWhenEatReducer.label,
        value: state.growWhenEatReducer.value
    };
};

const mapDispatchToProps = {
    onToggle: actions.toggleGrowWhenEat
};

export default connect(mapStateToProps, mapDispatchToProps)(Switch);