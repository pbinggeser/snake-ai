import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { IUpdateElitismPercent } from '../actions/elitismPercent';

const updateElitismValue = (state: IFieldState, action: IUpdateElitismPercent) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const updateElitismReducer = (state: IFieldState = initialState.elitismPercentReducer, 
                              action: IUpdateElitismPercent): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_ELITISM_PERCENT_FIELD:
            return updateElitismValue(state, action);
    }
    return state;
};

export default updateElitismReducer;