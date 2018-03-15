import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { populationActions, IUpdatePopulationField } from '../actions/updatePopulationField';

const updatePopulationValue = (state: IFieldState, action: IUpdatePopulationField) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const updatePopulationStateIsRunning = (state: IFieldState) => {
    var newState = Object.assign({}, state);
    newState.disabled = state.disabled;
    return newState;
};

const populationReducer = (state: IFieldState = initialState.populationReducer, 
                           action: populationActions): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_POPULATION_FIELD:
            return updatePopulationValue(state, action);
        case constants.UPDATE_POPULATION_FIELD_IS_RUNNING:
            return updatePopulationStateIsRunning(state);
    }
    return state;
};

export default populationReducer;