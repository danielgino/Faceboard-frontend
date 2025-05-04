import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'animate.css'
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from "@material-tailwind/react";
import {UserProvider} from "./context/UserProvider";
import Modal from 'react-modal';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
Modal.setAppElement('#root');
root.render(
   //  <React.StrictMode>
      <ThemeProvider>
          <UserProvider>
          <App />
          </UserProvider>
      </ThemeProvider>
 // </React.StrictMode>  ///@@@@@@@@BACK IN PRODUCTION@@@@@@@@@@@@@@@@@@@//
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
