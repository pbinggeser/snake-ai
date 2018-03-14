import { IToggleHitWall } from '../actions';
import { ISwitchState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { spliceStateForSwitch } from './rootReducers';

const hitWallReducer = (state: ISwitchState = initialState.hitWallReducer, action: IToggleHitWall): ISwitchState => {
    switch (action.type) {
        case constants.TOGGLE_DIES_WHEN_HIT_WALL:
        return spliceStateForSwitch(state);
    }
    return state;
};

export default hitWallReducer;