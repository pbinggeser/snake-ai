import * as constants from '../constants';

export interface IToggleHitWall {
    type: constants.TOGGLE_DIES_WHEN_HIT_WALL;
}

export function toggleHitWall(): IToggleHitWall {
    return {
        type: constants.TOGGLE_DIES_WHEN_HIT_WALL
    };
}

export interface IToggleEatSelf {
    type: constants.TOGGLE_DIES_WHEN_EAT_SELF;
}

export function toggleEatSelf(): IToggleEatSelf {
    return {
        type: constants.TOGGLE_DIES_WHEN_EAT_SELF
    };
}