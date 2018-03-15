import * as constants from '../constants';

export interface IUpdateGridResolution {
    type: constants.UPDATE_GRID_RESOLUTION_FIELD;
    payload: number;
}

export const updateGridResolutionField = (value: number): IUpdateGridResolution => ({
    type: constants.UPDATE_GRID_RESOLUTION_FIELD,
    payload: value
});
