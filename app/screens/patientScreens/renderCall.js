import React,{Component} from 'react'
import VideoView from '../../components/VideoCall/VideoView'
import {AsyncStorage,View} from 'react-native'
import * as firebase from 'react-native-firebase';
import { StopSound,  } from 'react-native-play-sound';
import References from '../../Utils/refs'
import Axios from 'axios';
import { API_PREFIX} from 'react-native-dotenv'


const storage = AsyncStorage
const dataBase = firebase.database();
const firestore = firebase.firestore();
export default class RenderCall extends Component{

  state = {
    addedTime:0,
    uid:firebase.auth().currentUser.uid,//user id
    channel:'',//doctors key from firestore as his id for id and channel
    showAdd:false,//either to show add button depending on loged in user
    doctorName:'',
    userName:'',
    showVideo:false,
    hospitalId:'',
    callStarted:false
  }


  


 componentWillUnmount(){

 }

  
 async resetStatus(){
  try{
      
      const setCallHistory = await Axios.post(API_PREFIX+'Users/setDoctorStatus',{uid:this.props.navigation.state.params.payload.doctorId});
      const {message,status} = setCallHistory.data;
      if(status == "Success"){
        toast('status set')
      }
  }catch(e){
    console.log(e);
  }
}
   
  componentDidMount(){

            // let waitForResponse = setTimeout(()=>{
            //      if(this.state.callStarted){
            //         clearTimeout(waitForResponse)
            //      }else{
            //        StopSound();
            //        this.onCallFinished(0);
            //        this.resetStatus();
            //        clearTimeout(waitForResponse)
            //      }
            // },60000)

            const $ref = firestore.collection('status').doc(this.props.navigation.state.params.payload.doctorId);

              $ref.onSnapshot((snapshot)=>{        
                
                if(!snapshot.exists) return false;
                   
                  //call listener
                  if(snapshot.data().callerStatus == 'rejected'){
                    return this.setState({showVideo:false},()=>{
                      this.onCallFinished(0);
                      StopSound()
                    })
                    
                  }

                  if(snapshot.data().callerStatus == 'ongoing'){
                    return this.setState({showVideo:true,callStarted:true},()=>{
                      StopSound()
                    })
                    
                  }

                  if(snapshot.data().addedTime > 0) this.setState({addedTime:1000*60},()=>{
                    
                  })  
                      
               
              });
         
   

  }




  //deletes appointment as soon as call is finished
  async deleteAppointment(duration){
   //delete appointment
     try{
       const {appointmentId,payload} = this.props.navigation.state.params;
       const _delete = await Axios.post(`${API_PREFIX}Users/deleteAppointment`,{appointmentId:appointmentId,payload:payload});
       const {message,status} = _delete.data;
       if(status == 'Success'){
         toast('appointment deleted')
       }else{
         toast('unable to delete appointment')
       }
     }catch(e){
       toast(e.message);
     }
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




  //when call is finished set showRating to true and when rating modal is dismissed set to false
  onCallFinished(callDuration){
      if(parseInt(callDuration) > 0 ){
        this.endCall(callDuration)

        this.props.navigation.navigate('PatientRatingStack',this.props.navigation.state.params.payload);

      }else{
        this.props.navigation.navigate('PatientStack');
      }
  }

  //This analysis call duration which comes in seconds to minutes or seconds or minutes and seconds
  callDurationCalculator(duration){
    let  totalSeconds = parseInt(duration);       
    let minute = 0;
    if(totalSeconds < 60){
      return duration+' seconds';
    }else{
      while(totalSeconds > 60){
        minute += 1;      
        totalSeconds -= 60
      }

      let _duration = minute+':'+totalSeconds+ ' seconds';
      return(_duration);
    }
   }



  render(){

    return(
      <VideoView  
        channel={this.props.navigation.state.params.payload.channel}
        onCallFinished={(duration)=> this.onCallFinished(duration)}
        addedTime={this.state.addedTime}
        showAdd = {this.state.showAdd}    
        patientId={firebase.auth().currentUser.uid}
        showVideo={()=>this.setState({showVideo:true})}
        removeAppointment ={(duration)=>this.deleteAppointment(duration)}  
    />  
    )
  }
}