import * as constants from '../constants';

export interface IUpdateEatFoodScore {
    type: constants.UPDATE_EAT_FOOD_SCORE_FIELD;
    payload: number;
}

export const updateEatFoodScoreField = (value: number): IUpdateEatFoodScore => ({
    type: constants.UPDATE_EAT_FOOD_SCORE_FIELD,
    payload: value
});
