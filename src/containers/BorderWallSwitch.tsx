import Switch from '../components/Switch';
import * as actions from '../actions/';
import { connect } from 'react-redux';
import { IStoreState } from '../types';

const mapStateToProps = (state: IStoreState) => {
    return {
        label: state.hitWallReducer.label,
        value: state.hitWallReducer.value
    };
};

const mapDispatchToProps = {
    onToggle: actions.toggleHitWall
};

export default connect(mapStateToProps, mapDispatchToProps)(Switch);