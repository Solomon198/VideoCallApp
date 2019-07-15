

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
