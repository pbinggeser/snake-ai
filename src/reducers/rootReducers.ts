import { combineReducers } from 'redux';
import { IStoreState, ISwitchState } from '../types';
import eatSelfReducer from './eatSelfReducer';
import hitWallReducer from './borderWallReducer';
import growWhenEatReducer from './growWhenEatReducer';
import highSpeedReducer from './highSpeedReducer';
import populationReducer from './populationReducer';
import elitismPercentReducer from './elitismPercentReducer';
import eatFoodScoreReducer from './eatFoodScoreReducer';
import moveTowardsFoodScoreReducer from './moveTowardsFoodScoreReducer';
import moveAwayFoodScoreReducer from './moveAwayFoodScoreReducer';
import displaySizeReducer from './displaySizeReducer';
import gridResolutionReducer from './gridResolutionReducer';
import snakeStartingLengthReducer from './snakeStartingLengthReducer';

const rootReducer = combineReducers<IStoreState>({
  hitWallReducer,
  eatSelfReducer,
  growWhenEatReducer,
  highSpeedReducer,
  populationReducer,
  elitismPercentReducer,
  eatFoodScoreReducer,
  moveTowardsFoodScoreReducer,
  moveAwayFoodScoreReducer,
  displaySizeReducer,
  gridResolutionReducer,
  snakeStartingLengthReducer,
  running: (state = {}) => state,
  paused: (state = {}) => state,
  snakes: (state = {}) => state,
});

export const spliceStateForSwitch = (state: ISwitchState) => {
  var newState = Object.assign({}, state);
  newState.value = !newState.value;
  return newState;
};

export default rootReducer;
