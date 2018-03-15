import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { IUpdateMoveTowardsFoodScore } from '../actions';

const updateElitismValue = (state: IFieldState, action: IUpdateMoveTowardsFoodScore) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const updateMoveTowardsFoodScoreReducer = (state: IFieldState = initialState.moveTowardsFoodScoreReducer, 
                                           action: IUpdateMoveTowardsFoodScore): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_MOVE_TOWARDS_FOOD_SCORE_FIELD:
            return updateElitismValue(state, action);
    }
    return state;
};

export default updateMoveTowardsFoodScoreReducer;