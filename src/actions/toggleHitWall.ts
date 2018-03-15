import * as constants from '../constants';

export interface IToggleHitWall {
    type: constants.TOGGLE_DIES_WHEN_HIT_WALL;
}

export const toggleHitWall = (): IToggleHitWall => ({
    type: constants.TOGGLE_DIES_WHEN_HIT_WALL
});
