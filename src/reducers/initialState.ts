import { IStoreState } from '../types';

const initialState: IStoreState = {
    populationSize: 50, // to be removed
    elitismPercent: 10,
    foodScore: 25, // 10
    moveTowardsScore: 2,
    moveAwayScore: -3, // -1.5
    initialSnakeLength: 4,
    displaySize: 100,
    gridResolution: 20,
    running: false,
    paused: false,
    snakes: [],
    hitWallReducer: {
        label: 'Snake dies when it hits a wall.',
        value: true
    },
    eatSelfReducer: {
      label: 'Snake dies when it hits self.',
      value: true
    },
    growWhenEatReducer: {
      label: 'Snake grows when it eats food.',
      value: true
    },
    highSpeedReducer: {
      label: 'Run game with high speed.',
      value: true
    },
    updatePopulationReducer: {
      name: 'populationSize',
      placeholder: 'Population Size',
      type: 'number',
      description: 'How many neural nets per generation?',
      disabled: false,
      required: true,
      min: 2,
      value: 50   
    },
    elitismPercentReducer: {
      name: 'elitismPercent',
      placeholder: 'Elitism Percent',
      type: 'number',
      description: '% of top performers to use for the next generation.',
      disabled: false,
      required: true,
      min: 1,
      max: 100,
      step: 1,
      value: 10
    }
  };

export default initialState;