import * as constants from '../constants';

export interface IUpdateSnakeStartingLength {
    type: constants.UPDATE_SNAKE_STARTING_LENGTH_FIELD;
    payload: number;
}

export const updateSnakeStartLengthField = (value: number): IUpdateSnakeStartingLength => ({
    type: constants.UPDATE_SNAKE_STARTING_LENGTH_FIELD,
    payload: value
});
