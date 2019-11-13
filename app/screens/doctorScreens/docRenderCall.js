import React,{Component} from 'react'
import VideoView from '../../components/VideoCall/VideoView'
import {AsyncStorage,View,BackHandler,BackAndroid,StatusBar} from 'react-native'
import * as firebase from 'react-native-firebase';
import moment from 'moment'
import { Colors } from '../../styles';
import References from "../../Utils/refs";
import axios from 'axios';
import { API_PREFIX} from 'react-native-dotenv';
import { toast } from '../../components/toast';


const storage = AsyncStorage
const fireStore = firebase.firestore();
const dataBase = firebase.database();

export default class DocRenderCall extends Component{

  state = {

    addedTime:0,
    uid:'',//user id
    channel:'',//doctors key from firestore as his id for id and channel
    showAdd:true,//either to show add button depending on loged in user
    doctorName:'',
    showVideo:false,
    docKey:'',
    userName:''

  }


 componentWillUnmount(){
 
 }


  componentDidMount(){
    
    const $ref = firebase.firestore().collection('status').doc(firebase.auth().currentUser.uid);

    $ref.onSnapshot((snapshot)=>{        
      
      if(!snapshot.exists) return false;
       
        if(snapshot.data().recieverStatus == 'ongoing'){

            return this.setState({showVideo:true},()=>{
               StopSound()
            })
          
          }
     
    });

  }   




  //deletes appointment after call
  async deleteAppointment(){
      try{
         const payload = this.props.navigation.state.params;
         const _deleteRequest = axios.post(API_PREFIX+'Users/deleteAppointments',{appointmentId:payload.key,payload:payload});
         const {message,status} = _deleteRequest.data;
         

      }catch(e){
        toast(e.message)
        console.log(e)
      }
  }



  //returns durations in string format as in minutes and seconds or second only if call does not exceed 60seconds
  callDurationCalculator(duration){
    let  _numberize = parseInt(duration);     
    let minute = 0;
    if(_numberize < 60){
      return duration+' seconds';
    }else{
      while(_numberize > 60){
        minute += 1;
        _numberize -= 60
      }

      let _duration = minute+':'+_numberize + ' seconds';
      return(_duration);
    }
   }


   

   async resetStatus(){
    try{
        
        const setCallHistory = await Axios.post(API_PREFIX+'Users/setDoctorStatus',{uid:firebase.auth().currentUser.uid});
        const {message,status} = setCallHistory.data;
        if(status == "Success"){
          toast('status set')
        }
    }catch(e){
      console.log(e);
    }
}
   
  //End call could be done by either doctor or user
  //remember to handle concurrency in api
  async endCall(duration){
    try{
        const _duration = this.callDurationCalculator(duration)
        const setCallHistory = await Axios.post(API_PREFIX+'Users/callEnded',{payload:this.props.navigation.state.params,duration:_duration});
        const {message,status} = setCallHistory.data;
        if(status == "Success"){
          toast('history sett')
        }
    }catch(e){
      console.log(e);
    }
}




//when call is finished set showRating to true and when rating modal is dismissed set to false
onCallFinished(callDuration){

    if(parseInt(callDuration) > 0 ){
      this.endCall(callDuration)

      this.props.navigation.navigate('Ratings',this.props.navigation.state.params);

    }else{
      this.props.navigation.navigate('DoctorStack');
    }
}


  



   //adds patient time of call on call. note whenever a request to add time is made only 1min is added on both side
  async addPatientTime(){
   // add call time
   try{

    const addTime = await Axios.post(API_PREFIX+'Users/addCallTime',{uid:firebase.auth().currentUser.uid});
    const {message,status} = addTime.data;

    if(status == "Success"){
      toast('time added')
    }else{
      toast("failed to add time")
    }

}catch(e){
  console.log(e);
}
     }

  //handles when call is ended
  handleFinish(duration){
      this.endCall();   
      this.onCallFinished(duration)
      let data = JSON.stringify({uid:this.state.uid,docKey:this.state.docKey});

      
      storage.setItem('donationInfo',data).then(()=>{
        this.props.navigation.navigate('FeedBack')
      })
    
  }  
    
 
//End call could be done by either doctor or user
  //remember to handle concurrency in api
  async endCall(duration){
    try{

        const _duration = this.callDurationCalculator(duration)
        const setCallHistory = await Axios.post(API_PREFIX+'Users/callEnded',{payload:this.props.navigation.state.params.payload,duration:_duration});
        const {message,status} = setCallHistory.data;

        if(status == "Success"){
          toast('history sett')
        }
    }catch(e){
      console.log(e);
    }
}

  render(){
    // if(!this.state.showVideo){
    //   return(
    //     <View style={{flex:1,backgroundColor:Colors.black}}>

    //     </View>
    //   )
    // }
    return(
      <VideoView  
        channel={this.props.navigation.state.params.channel}
        onCallFinished={(duration)=>this.onCallFinished(duration)}
        addedTime={this.state.addedTime}
        patientId={this.props.navigation.state.params.patientId}
        showAdd = {this.state.showAdd}   
        addPatientTime={()=>this.addPatientTime()}  
        removeAppointment={()=>this.deleteAppointment()} 
    />
    )   
  }
}