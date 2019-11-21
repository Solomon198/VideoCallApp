import React,{Component} from 'react';
import Ratings from '../../components/Rating/doctorRating'
import {AsyncStorage} from 'react-native'
import { deleteDirectory } from '../../Utils/functions';
import firebase from 'react-native-firebase'
import References from '../../Utils/refs'
import DefaultCustoms from '../../Utils/strings'

const storage = AsyncStorage;

export default class PatientRatingStack extends React.Component{
    state={
       docId:''
    }

    componentDidMount(){
       //this.props.navigation.navigate('PatientStack')
    }


     render(){
         return(
            <Ratings
                data = {this.props.navigation.state.params}
               />
         )
     }
}