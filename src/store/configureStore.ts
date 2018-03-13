import { createStore } from 'redux';
import { IStoreState } from '../types';
import initialState from '../reducers/initialState';
import rootReducer from '../reducers/rootReducers';

// tslint:disable-next-line:no-string-literal
let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f: any) => f;

export default function configureStore() {
  return createStore<IStoreState>(
    rootReducer,
    initialState,
    devtools
  );
}