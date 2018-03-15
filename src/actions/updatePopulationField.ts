import * as constants from '../constants';

export interface IUpdatePopulationField {
    type: constants.UPDATE_POPULATION_FIELD;
    payload: number;
}

export interface IisRunning {
    type: constants.UPDATE_POPULATION_FIELD_IS_RUNNING;
}

export const updatePopulationField = (value: number): IUpdatePopulationField => ({
    type: constants.UPDATE_POPULATION_FIELD,
    payload: value
});

export const isRunning = (): IisRunning => ({
    type: constants.UPDATE_POPULATION_FIELD_IS_RUNNING
});

type updatePopulation = IisRunning;
type isRunning = IUpdatePopulationField;

export type populationActions = updatePopulation | isRunning;