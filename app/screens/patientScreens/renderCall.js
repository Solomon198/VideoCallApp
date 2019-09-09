import React,{Component} from 'react'
import VideoView from '../../components/VideoCall/VideoView'
import {AsyncStorage,View} from 'react-native'
import * as firebase from 'react-native-firebase';
import { StopSound,  } from 'react-native-play-sound';
import References from '../../Utils/refs'

const storage = AsyncStorage
const dataBase = firebase.database();

export default class RenderCall extends Component{

  state = {
    addedTime:0,
    uid:firebase.auth().currentUser.uid,//user id
    channel:'',//doctors key from firestore as his id for id and channel
    showAdd:true,//either to show add button depending on loged in user
    doctorName:'',
    userName:'',
    showVideo:false,
    hospitalId:''
  }


  


 componentWillUnmount(){
  //when a call is going on the patient listens to this node for any action made by the doctor such as adding of time, ending call or rejecting but when call is over the connection is turned off because it is no longer needed
  const $ref = dataBase.ref(`listeners/${this.state.uid}/`);
  $ref.off();
 }



  componentDidMount(){
      storage.getItem('videoData').then((info)=>{
        let unwrap = JSON.parse(info);
        const {uid,userName,showAdd,channel,doctorName,hospitalId} = unwrap;
          this.setState({
           channel:channel, userName:userName,showAdd:showAdd,doctorName:doctorName,showVideo:true,hospitalId:hospitalId
          },()=>{
            //creates a connection to the database via which the patient can listens to doctor actions such as stopping of calls, adding of time and so on. note this connection only exist from when a call is initiated and when is ended
            const $ref = dataBase.ref(`${References.CategorySixteen}/${this.state.uid}/`);
            $ref.set({addTime:false}).then((val)=>{
              $ref.on('value',(snapshot)=>{        
                //This logic here is to handle redundant trigger. The first time an on value envent listener is attatched it returns a value which we do not want so we initialize but subsequent trigger shows there is useful information this logic is subject to change because there are easier way to do this without doing going on like carousel
                if(this.state.initializeApp == false){       
                  this.setState({initializeApp:true})     
              }else{
        
                  if(snapshot.val().addTime == true) this.setState({addedTime:1000*60},()=>{
                    this.setState({addedTime:0})
                  })  
                   
                  if(snapshot.val().callRejected){
                    this.setState({showLive:false},()=>{
                      this.handleFinish(0);
                      StopSound()
                    })
                  }
                  
        
              }
               
              });
            })
          })
      })
   

  }




  //deletes appointment as soon as call is finished
  deleteAppointment(duration){
    let appointmentId = this.state.channel+"-"+ this.state.uid
    let appointments = firebase.firestore().collection(References.CategoryThree).doc(appointmentId);
    let hospitalRef = firebase.firestore().collection(References.CategoryOne).doc(this.state.hospitalId);
    let doctorRef = firebase.firestore().collection(References.CategoryTWo).doc(this.state.hospitalId).collection(References.CategoryTwentyOne).doc(this.state.channel);

    hospitalRef.get().then((val)=>{
        let queue = val.data().queue;
        let total = queue - 1;
        hospitalRef.update({queue:total})
        
    })

    doctorRef.get().then((val)=>{
      let queue = val.data().queue;
      let total = queue - 1;
      doctorRef.update({queue:total})
      
  })
    if(this.state.channel){
       if(duration > 0){
        appointments.delete();
       }
    }
  }





  //when call is finished set showRating to true and when rating modal is dismissed set to false
  onCallFinished(callDuration){
      if(parseInt(callDuration) > 0 ){
        this.props.navigation.navigate('FeedBackPatient');
      }else{
        this.props.navigation.navigate('PatientStack');
      }
    let location = firebase.firestore().collection(References.CategorySeven).doc(this.state.uid).collection(References.CategoryTwenty)
    firebase.messaging().unsubscribeFromTopic(this.state.channel)
    location.add({callerName:this.state.doctorName,duration:this.callDurationCalculator(callDuration),date:new Date().getTime()})
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


   //when call is finished this function is called from video component to end call and resets connection and call properties
  handleFinish(duration){
      this.endCall();
      this.resetPatientNode();
      this.onCallFinished(duration)
    
  }  

  //reset node that the patient listens to doctor actions on call after call
  resetPatientNode(){
    const randomNumber = Math.round(Math.random() * 1000000);
    dataBase.ref(`${References.CategorySixteen}/${this.state.uid}/`).set({callRejected:false,added:randomNumber,addTime:false}).then((val)=>{
    })
  }

   
  endCall(){
    let channel = this.state.channel;
    const randomNumber = Math.round(Math.random() * 1000000);
    //when a doctor is online once the patient detects that the doctor is not offline or busy the current patient changes this node to busy and the doctor rings and after call the patient reset this node so that other users can call the doctor.some datas are redundant like the random number is just there to make the data base sees that a change occurs in case of trigger failures and the the same data was sent again the random number will be different all time.
    dataBase.ref(`${References.CategorySixteen}/${channel}/`).set({callerName:false,added:randomNumber,online:true,addTime:false,endCall:true,uid:false}).then((val)=>{
      this.setState({channel:channel});
    }).catch((err)=>this.setState({modal:false}))
  }

  render(){
    if(!this.state.showVideo){
      return(
        <View style={{flex:1,backgroundColor:'#000'}}>

        </View>
      )
    }
    return(
      <VideoView  
        channel={this.state.channel}
        onCallFinished={(duration)=>this.onCallFinished(duration)}
        onCancel={(duration)=>this.handleFinish(duration)}
        onFinish= {(duration)=>this.handleFinish(duration)}
        addedTime={this.state.addedTime}
        showAdd = {this.state.showAdd}    
        patientId={firebase.auth().currentUser.uid}
        removeAppointment ={(duration)=>this.deleteAppointment(duration)}  
    />
    )
  }
}