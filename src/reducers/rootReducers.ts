import { combineReducers } from 'redux';
import { IStoreState } from '../types';
import eatSelfReducer from './eatSelfReducer';
import hitWallReducer from './borderWallReducer';

const rootReducer = combineReducers<IStoreState>({
  hitWallReducer,
  eatSelfReducer,
  populationSize: (state = {}) => state,
  elitismPercent: (state = {}) => state,
  foodScore: (state = {}) => state,
  moveTowardsScore: (state = {}) => state,
  moveAwayScore: (state = {}) => state,
  initialSnakeLength: (state = {}) => state,
  growWhenEating: (state = {}) => state,
  gameSpeedUp: (state = {}) => state,
  displaySize: (state = {}) => state,
  gridResolution: (state = {}) => state,
  running: (state = {}) => state,
  paused: (state = {}) => state,
  snakes: (state = {}) => state,
  borderWallSwitch: (state = {}) => state,
  eatSelfSwitch: (state = {}) => state
});

export default rootReducer;
