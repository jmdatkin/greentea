import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { reducer } from '../../gt-redux/redux-helpers';

import './App.css';
import GTApp from '../GTApp/GTApp';

const store = createStore(reducer);

const dispatch = (payload) => {
  store.dispatch(payload);
};

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <GTApp d={dispatch} />
      </div>
    </Provider>
  );
}

export default App;
