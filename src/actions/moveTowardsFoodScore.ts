import * as constants from '../constants';

export interface IUpdateMoveTowardsFoodScore {
    type: constants.UPDATE_MOVE_TOWARDS_FOOD_SCORE_FIELD;
    payload: number;
}

export const updateMoveTowardsFoodScoreField = (value: number): IUpdateMoveTowardsFoodScore => ({
    type: constants.UPDATE_MOVE_TOWARDS_FOOD_SCORE_FIELD,
    payload: value
});
