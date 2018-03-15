import { createStore, Store, applyMiddleware } from 'redux';
import { IStoreState } from '../types';
import rootReducer from '../reducers/rootReducers';
import { composeWithDevTools } from 'redux-devtools-extension';

const configureStore = (initialState: IStoreState): Store<IStoreState> => {
  const composeEnhancers = composeWithDevTools({});
  return createStore<IStoreState>(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(    
    )),
  );
};

export default configureStore;