import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { IUpdateGridResolution } from '../actions';

const updateGridResolution = (state: IFieldState, action: IUpdateGridResolution) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const updateGridResolutionReducer = (state: IFieldState = initialState.gridResolutionReducer, 
                                     action: IUpdateGridResolution): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_GRID_RESOLUTION_FIELD:
            return updateGridResolution(state, action);
    }
    return state;
};

export default updateGridResolutionReducer;