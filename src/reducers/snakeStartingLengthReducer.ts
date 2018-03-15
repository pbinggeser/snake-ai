import { IFieldState } from '../types/index';
import * as constants from '../constants/index';
import initialState from './initialState';
import { IUpdateSnakeStartingLength } from '../actions';

const updateSnakeStartingLength = (state: IFieldState, action: IUpdateSnakeStartingLength) => {
    var newState = Object.assign({}, state);
    newState.value = action.payload;
    return newState;
};

const updateSnakeStartingLengthReducer = (state: IFieldState = initialState.snakeStartingLengthReducer, 
                                          action: IUpdateSnakeStartingLength): IFieldState => {
    switch (action.type) {
        case constants.UPDATE_SNAKE_STARTING_LENGTH_FIELD:
            return updateSnakeStartingLength(state, action);
    }
    return state;
};

export default updateSnakeStartingLengthReducer;