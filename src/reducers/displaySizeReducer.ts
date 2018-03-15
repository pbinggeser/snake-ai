import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { IUpdateDisplaySizeField } from '../actions';

const updateElitismValue = (state: IFieldState, action: IUpdateDisplaySizeField) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const displaySizeReducer = (state: IFieldState = initialState.displaySizeReducer, 
                            action: IUpdateDisplaySizeField): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_DISPLAY_SIZE_FIELD:
            return updateElitismValue(state, action);
    }
    return state;
};

export default displaySizeReducer;