import { IToggleHighSpeed } from '../actions';
import { ISwitchState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { spliceStateForSwitch } from './rootReducers';

const highSpeedReducer = (state: ISwitchState = initialState.highSpeedReducer, action: IToggleHighSpeed) => {
    switch (action.type) {
        case constants.TOGGLE_HIGH_SPEED:
            return spliceStateForSwitch(state);
    }
    return state;
};

export default highSpeedReducer;