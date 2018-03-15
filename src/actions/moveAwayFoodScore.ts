import * as constants from '../constants';

export interface IUpdateMoveAwayFoodScore {
    type: constants.UPDATE_MOVE_AWAY_FOOD_SCORE_FIELD;
    payload: number;
}

export const updateMoveAwayFoodScoreField = (value: number): IUpdateMoveAwayFoodScore => ({
    type: constants.UPDATE_MOVE_AWAY_FOOD_SCORE_FIELD,
    payload: value
});
