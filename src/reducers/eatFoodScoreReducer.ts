import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { IUpdateEatFoodScore } from '../actions';

const updateElitismValue = (state: IFieldState, action: IUpdateEatFoodScore) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const eatFoodScoreReducer = (state: IFieldState = initialState.eatFoodScoreReducer, 
                             action: IUpdateEatFoodScore): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_EAT_FOOD_SCORE_FIELD:
            return updateElitismValue(state, action);
    }
    return state;
};

export default eatFoodScoreReducer;