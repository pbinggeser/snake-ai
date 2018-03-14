import * as constants from '../constants';

export interface IToggleGrowWhenEat {
    type: constants.TOGGLE_GROWS_WHEN_EAT_FOOD;
}

export const toggleGrowWhenEat = (): IToggleGrowWhenEat => ({
    type: constants.TOGGLE_GROWS_WHEN_EAT_FOOD
});
