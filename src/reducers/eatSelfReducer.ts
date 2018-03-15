import { IToggleEatSelf } from '../actions';
import { ISwitchState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { spliceStateForSwitch } from './rootReducers';

const eatSelfReducer = (state: ISwitchState = initialState.eatSelfReducer, action: IToggleEatSelf) => {
    switch (action.type) {
        case constants.TOGGLE_DIES_WHEN_EAT_SELF:
            return spliceStateForSwitch(state);
    }
    return state;
};

export default eatSelfReducer;