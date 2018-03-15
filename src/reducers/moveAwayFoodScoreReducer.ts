import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { IUpdateMoveAwayFoodScore } from '../actions';

const updateMoveAwayFoodScore = (state: IFieldState, action: IUpdateMoveAwayFoodScore) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const updateMoveAwayFoodScoreReducer = (state: IFieldState = initialState.moveAwayFoodScoreReducer, 
                                        action: IUpdateMoveAwayFoodScore): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_MOVE_AWAY_FOOD_SCORE_FIELD:
            return updateMoveAwayFoodScore(state, action);
    }
    return state;
};

export default updateMoveAwayFoodScoreReducer;