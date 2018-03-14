import * as constants from '../constants';
export interface IToggleHighSpeed {
    type: constants.TOGGLE_HIGH_SPEED;
}

export const toggleHighSpeed = (): IToggleHighSpeed => ({
    type: constants.TOGGLE_HIGH_SPEED
});