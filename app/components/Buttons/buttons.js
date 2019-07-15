import React from 'react';
import {Icon} from 'native-base';
import {TouchableNativeFeedback} from 'react-native'

export const ToolBarButtons  = (Prop) => (
    <TouchableNativeFeedback   onPress={()=>Prop.onPress()} >
         <Icon style={{color:Prop.iconColor,fontSize:Prop.iconFontSize}} name={Prop.iconName}/>
    </TouchableNativeFeedback> 
)