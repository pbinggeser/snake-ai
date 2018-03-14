import * as constants from '../constants';

export interface IUpdateElitismPercent {
    type: constants.UPDATE_ELITISM_PERCENT_FIELD;
    payload: number;
}

export const updateElitismPercent = (value: number): IUpdateElitismPercent => ({
    type: constants.UPDATE_ELITISM_PERCENT_FIELD,
    payload: value
});
