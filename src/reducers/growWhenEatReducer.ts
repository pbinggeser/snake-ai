import { IToggleGrowWhenEat } from '../actions';
import { ISwitchState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { spliceStateForSwitch } from './rootReducers';

const growWhenEatReducer = (state: ISwitchState = initialState.growWhenEatReducer, action: IToggleGrowWhenEat) => {
    switch (action.type) {
        case constants.TOGGLE_GROWS_WHEN_EAT_FOOD:
            return spliceStateForSwitch(state);
    }
    return state;
};

export default growWhenEatReducer;