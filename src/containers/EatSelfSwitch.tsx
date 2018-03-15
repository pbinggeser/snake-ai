import Switch from '../components/Switch';
import * as actions from '../actions/';
import { connect } from 'react-redux';
import { IStoreState } from '../types';

const mapStateToProps = (state: IStoreState) => {
    return {
        label: state.eatSelfReducer.label,
        value: state.eatSelfReducer.value
    };
};

const mapDispatchToProps = {
    onToggle: actions.toggleEatSelf
};

export default connect(mapStateToProps, mapDispatchToProps)(Switch);