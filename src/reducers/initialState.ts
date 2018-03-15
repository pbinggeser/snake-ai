import { IStoreState } from '../types';

const initialState: IStoreState = {
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
    populationReducer: {
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
      required: true,
      min: 1,
      max: 100,
      step: 1,
      value: 10
    },
    eatFoodScoreReducer: {
      name: 'foodScore',
      placeholder: 'Eat Food Score',
      type: 'number',
      description: 'Awarded for eating food.',
      required: true,
      step: 1,
      value: 25
    },
    moveTowardsFoodScoreReducer: {
      name: 'moveTowardsScore',
      placeholder: 'Move Towards Food Score',
      type: 'number',
      description: 'Awarded for each step towards food.',
      required: true,
      step: 0.5,
      value: 2
    },
    moveAwayFoodScoreReducer: {
      name: 'moveAwayScore',
      placeholder: 'Move Away Food Score',
      type: 'number',
      description: 'Awarded for each step away from food.',
      required: true,
      step: 0.5,
      value: -3
    },
    displaySizeReducer: {
      name: 'displaySize',
      type: 'number',
      placeholder: 'Display Size',
      required: true,
      value: 100,
      description: 'Does not affect game play',
      min: 10,
      step: 1
    },
    gridResolutionReducer: {
      name: 'gridResolution',
      type: 'number',
      value: 20,
      placeholder: 'Grid Resolution',
      required: true,
      description: 'Resolution of each Snake\'s grid environment',
      min: 5,
      step: 1
    },
    snakeStartingLengthReducer: {
      name: 'initialSnakeLength',
      type: 'number',
      value: 4,
      placeholder: 'Snake Starting Length',
      required: true,
      description: 'Measured in grid cells',
      min: 1,
      step: 1,
      max: 20
    },
  };

export default initialState;