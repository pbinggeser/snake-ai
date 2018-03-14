// Snake dies when hit wall (or not)

export const TOGGLE_DIES_WHEN_HIT_WALL = '@@switch/TOGGLE_DIES_WHEN_HIT_WALL';
export type TOGGLE_DIES_WHEN_HIT_WALL = typeof TOGGLE_DIES_WHEN_HIT_WALL;

// Snake dies when hit itself (or not)

export const TOGGLE_DIES_WHEN_EAT_SELF = '@@switch/TOGGLE_DIES_WHEN_EAT_SELF';
export type TOGGLE_DIES_WHEN_EAT_SELF = typeof TOGGLE_DIES_WHEN_EAT_SELF;

// Snake grows when eat (or not)

export const TOGGLE_GROWS_WHEN_EAT_FOOD = '@@switch/TOGGLE_GROWS_WHEN_EAT_FOOD';
export type TOGGLE_GROWS_WHEN_EAT_FOOD = typeof TOGGLE_GROWS_WHEN_EAT_FOOD;

// high speed game play (or not)

export const TOGGLE_HIGH_SPEED = '@@switch/TOGGLE_HIGH_SPEED';
export type TOGGLE_HIGH_SPEED = typeof TOGGLE_HIGH_SPEED;

// update population field

export const UPDATE_POPULATION_FIELD = '@@switch/UPDATE_POPULATION_FIELD';
export type UPDATE_POPULATION_FIELD = typeof UPDATE_POPULATION_FIELD;

// update population field is running..

export const UPDATE_POPULATION_FIELD_IS_RUNNING = '@@switch/UPDATE_POPULATION_FIELD_IS_RUNNING';
export type UPDATE_POPULATION_FIELD_IS_RUNNING = typeof UPDATE_POPULATION_FIELD_IS_RUNNING;

// update elitism percent field 

export const UPDATE_ELITISM_PERCENT_FIELD = '@@switch/UPDATE_ELITISM_PERCENT_FIELD';
export type UPDATE_ELITISM_PERCENT_FIELD = typeof UPDATE_ELITISM_PERCENT_FIELD;