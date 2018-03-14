import Snake from '../AI/snake';

export interface IStoreState {
    populationSize: number;
    elitismPercent: number;
    initialSnakeLength: number; 
    displaySize: number;
    gridResolution: number;
    running: boolean;
    paused: boolean;
    moveTowardsScore: number;
    moveAwayScore: number;
    foodScore: number;  
    snakes: Snake[];
    hitWallReducer: ISwitchState;
    eatSelfReducer: ISwitchState;
    growWhenEatReducer: ISwitchState;
    highSpeedReducer: ISwitchState;
    updatePopulationReducer: IFieldState;
    elitismPercentReducer: IFieldState;
}

export interface ISwitchState {
    value: boolean;
    label: string;
}

export interface IFieldState {
    name: string;
    value: string | number;
    label?: string;
    placeholder: string;
    type: string;
    description: string;
    disabled?: boolean;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: number;
    onChangeEvent?: () => any;
}
