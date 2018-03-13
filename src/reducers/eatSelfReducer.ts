import { IToggleEatSelf } from '../actions';
import { ISwitchState } from '../types/index';
import { TOGGLE_DIES_WHEN_EAT_SELF } from '../constants/index';
import initialState from './initialState';

function toggleEatSelf(state: ISwitchState) {
    var newState = Object.assign({}, state);
    newState.value = !newState.value;
    return newState;
}

export default function eatSelfReducer(state: ISwitchState = initialState.eatSelfSwitch, 
                                       action: IToggleEatSelf): ISwitchState {
    switch (action.type) {
        case TOGGLE_DIES_WHEN_EAT_SELF:
            return toggleEatSelf(state);
    }
    return state;
}