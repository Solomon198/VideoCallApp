import React,{Component} from 'react';
import PatientRatings from './rate';
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
        storage.getItem('videoData').then((val)=>{
            let unwrap = JSON.parse(val);
            this.setState({...unwrap})
        })
    }


     render(){
         return(
            <PatientRatings
                data = {this.state}
                userId={firebase.auth().currentUser.uid}
                docId={this.state.docId}
                dismissModal={()=>this.setState({finishRating:false},()=>{
                this.props.navigation.navigate("PatientStack")
                deleteDirectory().then((val)=>'').catch((err)=>"")
              })}/>
         )
     }
}