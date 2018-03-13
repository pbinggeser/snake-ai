import { IStoreState } from '../types';

const initialState: IStoreState = {
    populationSize: 50,
    elitismPercent: 10,
    foodScore: 25, // 10
    moveTowardsScore: 2,
    moveAwayScore: -3, // -1.5
    initialSnakeLength: 4,
    growWhenEating: true,
    gameSpeedUp: false,
    displaySize: 100,
    gridResolution: 20,
    running: false,
    paused: false,
    snakes: [],
    borderWallSwitch: {
        label: 'Snake dies when it hits a wall.',
        value: true
    },
    eatSelfSwitch: {
      label: 'Snake dies when it hits self.',
      value: true
    }
  };

export default initialState;