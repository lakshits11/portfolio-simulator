import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider as StyletronProvider } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { BaseProvider, LightTheme } from 'baseui';
import 'normalize.css';

const engine = new Styletron();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StyletronProvider value={engine}>
    <BaseProvider theme={LightTheme}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BaseProvider>
  </StyletronProvider>
);