import { combineReducers } from 'redux';
import { IStoreState, ISwitchState } from '../types';
import eatSelfReducer from './eatSelfReducer';
import hitWallReducer from './borderWallReducer';
import growWhenEatReducer from './growWhenEatReducer';
import highSpeedReducer from './highSpeedReducer';
import updatePopulationReducer from './updatePopulationReducer';
import elitismPercentReducer from './elitismPercentReducer';

const rootReducer = combineReducers<IStoreState>({
  hitWallReducer,
  eatSelfReducer,
  growWhenEatReducer,
  highSpeedReducer,
  updatePopulationReducer,
  elitismPercentReducer,
  populationSize: (state = {}) => state,
  elitismPercent: (state = {}) => state,
  foodScore: (state = {}) => state,
  moveTowardsScore: (state = {}) => state,
  moveAwayScore: (state = {}) => state,
  initialSnakeLength: (state = {}) => state,
  displaySize: (state = {}) => state,
  gridResolution: (state = {}) => state,
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
