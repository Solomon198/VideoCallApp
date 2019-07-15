/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  StyleSheet,
  View,
  StatusBar
} from 'react-native';
import {Colors,Typography} from '../../styles/index'
import {ToolBarButtons} from '../Buttons/buttons'

export default class Toolbar extends Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
        backgroundColor={Colors.primary}
        barStyle="light-content" />

        <View style={[Typography.navbar,{backgroundColor:this.props.bgColor?this.props.bgColor:Colors.primary}]}>
            {this.props.canGoBack?
               <ToolBarButtons 
                 iconColor={Colors.toolBarIconColor} 
                 iconFontSize={Typography.iconFontSize}
                 iconName='arrow-back'
                 onPress={()=>this.props.goBack()}
                 />
              :<View></View>}             
        </View>

        <View style={[Typography.navbarBody,{backgroundColor:this.props.bgColor?this.props.bgColor:Colors.primary}]}>
            <Text style={Typography.navbarTitle}>{this.props.title}</Text>
        </View>

        
             {this.props.menu?
               <ToolBarButtons 
                 iconColor={Colors.toolBarIconColor} 
                 iconName='menu'
                 iconFontSize={Typography.iconFontSize}
                 onPress={()=>this.props.toggleDrawer()}
                 />
              :<View style={Typography.navbar}></View>}     
      </View>
    );   
  }
}

const styles = StyleSheet.create({
   emptyView:{
     flex:1
   },
   container:{
    flexDirection:'row',
    backgroundColor:Colors.primary,
    justifyContent:'center',
    paddingRight:10
   }
})

AppRegistry.registerComponent('Toolbar', () => Toolbar);
