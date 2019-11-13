global.Symbol = require('core-js/es6/symbol');
require('core-js/fn/symbol/iterator');
require('core-js/fn/map');
require('core-js/fn/set');
require('core-js/fn/array/find');

import { AppRegistry,View } from 'react-native';
import  NavContainer from './app/Navigation/navigation'
import React from 'react'
import * as firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen'
firebase.crashlytics().enableCrashlyticsCollection();

class EntryPage extends React.Component {
    constructor(props){
        super(props)
    }
   
    componentDidMount(){
        SplashScreen.hide();
    }   
    
    render(){
       return<View></View>
    }
}    
      

AppRegistry.registerComponent('videoCall', () => NavContainer);
