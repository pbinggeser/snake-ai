import * as constants from '../constants';

export interface IToggleEatSelf {
    type: constants.TOGGLE_DIES_WHEN_EAT_SELF;
}

export const toggleEatSelf = (): IToggleEatSelf => ({
    type: constants.TOGGLE_DIES_WHEN_EAT_SELF
});
