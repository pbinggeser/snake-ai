import * as constants from '../constants';

export interface IUpdateDisplaySizeField {
    type: constants.UPDATE_DISPLAY_SIZE_FIELD;
    payload: number;
}

export const updateDisplaySizeField = (value: number): IUpdateDisplaySizeField => ({
    type: constants.UPDATE_DISPLAY_SIZE_FIELD,
    payload: value
});
