import React,{Component} from 'react'
import VideoView from '../../components/VideoCall/VideoView'
import {AsyncStorage,View,BackHandler,BackAndroid,StatusBar} from 'react-native'
import * as firebase from 'react-native-firebase';
import moment from 'moment'
import { Colors } from '../../styles';
import References from "../../Utils/refs"


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
      storage.getItem('videoData').then((info)=>{
        let unwrap = JSON.parse(info);
        const {uid,doctorName,showAdd,channel,userName} = unwrap;
          this.setState({
            uid:uid, channel:channel, doctorName:doctorName,showAdd:showAdd,doctorName:doctorName,showVideo:true,docKey:channel,userName:userName
          },()=>{
          
          })
      })

  }   




  //deletes appointment after call
  deleteAppointment(){
   
  }


 


  //when call is finished
  onCallFinished(callDuration){
    
    const $ref = dataBase.ref(`${References.CategorySixteen}/${this.state.channel}/`);
    $ref.set({callerName:false,busy:false,added:345,channel:'eee',endCall:false,uid:false});
    let location = firebase.firestore().collection(References.CategorySeven).doc(this.state.channel).collection('history');
    let historyTime = moment(Date.now()).format('LLLL')
    location.add({callerName:this.state.userName,duration:this.callDurationCalculator(callDuration),date:historyTime})
    this.deleteAppointment();
    firebase.database().ref(`${References.CateogryEleven}/`+this.state.channel)
           .set({name:this.state.doctorName,status:'online'}).then(()=>{
     })
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

      let _duration = minute+':'+_numberize+ ' seconds';
      return(_duration);
    }
   }


  



   //adds patient time of call on call. note whenever a request to add time is made only 1min is added on both side
   addPatientTime(){
    const randomNumber = Math.round(Math.random() * 1000000);
    dataBase.ref(`${References.CategorySixteen}/${this.state.uid}/`).set({addTime:true,added:randomNumber,callRejected:false}).then((val)=>{

    }).catch((err)=>this.setState({modal:false}))
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
    
 

  //when call is ended
  endCall(){   
    let uid = this.state.uid;
    const randomNumber = Math.round(Math.random() * 1000000);
    dataBase.ref(`${References.CategorySixteen}/${uid}/`).set({callerName:this.state.doctorName,added:randomNumber,online:true,addTime:false,endCall:true,uid:false}).then((val)=>{
      this.setState({channel:uid});
    }).catch((err)=>this.setState({modal:false}))
  }
      
  render(){
    if(!this.state.showVideo){
      return(
        <View style={{flex:1,backgroundColor:Colors.black}}>

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
        patientId={this.state.uid}
        showAdd = {this.state.showAdd}   
        addPatientTime={()=>this.addPatientTime()}  
        removeAppointment={()=>this.deleteAppointment()} 
    />
    )   
  }
}