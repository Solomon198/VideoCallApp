import React from 'react'
import {Spinner} from 'native-base'
import {View,StyleSheet,Text} from 'react-native'
import { Typography } from '../../styles';

export const Loading = (Prop)=>(
    <View style={styles.container}>
       {
          Prop.show?
          <Spinner color='forestgreen' />
          :
          <Text style={styles.position}>{Prop.text}</Text>
       }
    </View>
)

const styles = StyleSheet.create({
    position:{
        textAlign:'center',
        fontSize:Typography.largeFontSize
    },
    container:{
        flex:1,
        justifyContent:'center',
        alignContent:'center'
    }
})