import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

//External Bootstrap Theme
import './bootstrap.css'

import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
import {BrowserRouter} from 'react-router-dom';

// Theon
// var config = {
//     apiKey: "AIzaSyBrY3SiOpLlt42Wnta1PkyNV_t3ecpxKKk",
//     authDomain: "weekninermit.firebaseapp.com",
//     databaseURL: "https://weekninermit.firebaseio.com",
//     projectId: "weekninermit",
//     storageBucket: "weekninermit.appspot.com",
//     messagingSenderId: "529293666294"
// };
// firebase.initializeApp(config);

// Minyoung
var config = {
    apiKey: "AIzaSyBiinb6Rs4VMuDGSvtUWCeg9fmy_w1mJNQ",
    authDomain: "wda-assignment-2.firebaseapp.com",
    databaseURL: "https://wda-assignment-2.firebaseio.com",
    projectId: "wda-assignment-2",
    storageBucket: "wda-assignment-2.appspot.com",
    messagingSenderId: "930736709909"
};
firebase.initializeApp(config);


ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
