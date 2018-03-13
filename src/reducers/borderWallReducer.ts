import { IToggleHitWall } from '../actions';
import { ISwitchState } from '../types/index';
import { TOGGLE_DIES_WHEN_HIT_WALL } from '../constants/index';
import initialState from './initialState';

function toggleBorderWalls (state: ISwitchState) {
    var newState = Object.assign({}, state);
    newState.value = !newState.value;
    return newState;
}

export default function hitWallReducer(state: ISwitchState = initialState.borderWallSwitch,
                                       action: IToggleHitWall): ISwitchState {
    switch (action.type) {
        case TOGGLE_DIES_WHEN_HIT_WALL:
            return toggleBorderWalls(state);
    }
    return state;
}