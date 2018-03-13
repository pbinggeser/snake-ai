import Snake from '../AI/snake';

export interface IStoreState {
    populationSize: number;
    elitismPercent: number;
    initialSnakeLength: number; 
    displaySize: number;
    gridResolution: number;    
    growWhenEating: boolean; 
    gameSpeedUp: boolean;
    running: boolean;
    paused: boolean;
    moveTowardsScore: number;
    moveAwayScore: number;
    foodScore: number;  
    snakes: Snake[];
    borderWallSwitch: ISwitchState;
    eatSelfSwitch: ISwitchState;
}

export interface ISwitchState {
    value: boolean;
    label: string;
}