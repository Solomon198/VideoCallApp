import React,{Component} from 'react'
import {View,Container,H2,Icon,H3,Header,Right,Left,Body,Spinner} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,TouchableNativeFeedback,Modal,Image,StyleSheet,StatusBar} from 'react-native'
import { StopSound, PlaySoundRepeat } from 'react-native-play-sound';
import Toolbar from '../../components/Toolbar/Toolbar';
import type { Notification } from 'react-native-firebase';
import {toast} from '../../components/toast'
import SplashScreen from 'react-native-splash-screen'
import {PUSH_NOTIFICATION_URL_FIREBASE,} from 'react-native-dotenv'
import { ListWithImage } from '../../components/RenderList/ListComponents';
import { Loading } from '../../components/Loader/loader';
import { Colors, Typography } from '../../styles';
import {deleteDirectory, permissionCheck} from '../../Utils/functions'
import { Toggle,Text } from 'react-native-ui-kitten';
import References from "../../Utils/refs"
import DefaultCustoms from '../../Utils/strings'
import axios from 'axios';
import { API_PREFIX} from 'react-native-dotenv';





const storage = AsyncStorage;
const dataBase = firebase.database();
const messaging = firebase.messaging();  


export default class DocDashboard extends Component {
    constructor(props){
        super(props);

    }
    
    state = {

      online:false,
      docName :'',
      payload:{},
      status:false,
      connecting:false,


       appointments:[
          
        ],
        user:false,
        channel:'' ,
        users:''  ,
        showAdd:true,
        showLive:false,
        isUserFree:true,
        calling:false,
        addedTime:0,
        uid:'',
        callerName:'',
        docKey:'',
        noAppointMents:false,
        doctorName:'',
        callPhoto:'',
        location:'',
        occupation:'',
    } 



    
   

    componentWillUnmount(){
        

    }

    //sends push notification to users that set appointment with doctor using his id as channel name from set appointment
    sendNotification(){
      fetch(PUSH_NOTIFICATION_URL_FIREBASE, {
          method: 'POST',
          headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({        
              topic:this.state.docKey,
              payload:{
                  docName:this.state.doctorName,
                  docKey:this.state.docKey   
              }
          })
          }).then((val)=>val.json())
          .then((valz)=>{
            toast('Presence sent to client')
          }).catch((err)=>{
              //
          })
  }

    
   
   
    
  async  componentDidMount(){  

        SplashScreen.hide();
        
        let uid = firebase.auth().currentUser.uid
       
       
        deleteDirectory().then(()=>'').catch(()=>"")
        permissionCheck().then(()=>{
          //yea permission is ok
        }).catch((err)=>{
          toast("Please accept all permission to enable effective video call")
        })
        messaging.subscribeToTopic('General');
              
        storage.getItem('record').then(val=>{
          if(val){
            //do noting
          }else{
            storage.setItem('record',JSON.stringify(true))
          }
        })
          

            const $ref = firebase.firestore().collection('status').doc(uid);
            
            //call listener 

              $ref.onSnapshot((snapshot)=>{    
          
                  StopSound();

                  if(!snapshot.exists) return false;

                  
                  const {status,recieverStatus,payload} = snapshot.data();



                  if(status== 'online'){

                    this.setState({online:true});

                  }

                  if(status == 'offline'){

                    this.setState({online:false})

                  }

                  if(recieverStatus == "unitiated"){
                    this.setState({calling:false});
                    StopSound();
                  }

                  if(recieverStatus == 'started'){
                    this.setState({             
                      calling:true,                           
                      isUserFree:false,
                      callerName:payload.patientName, 
                      channel:payload.channel,       
                      uid: payload.patientId,
                      callPhoto:payload.patientPhoto,
                      occupation:payload.patientOccupation,
                      location:payload.patientLocation,
                      payload:payload
                    
                    },()=>PlaySoundRepeat('call_tone'));
                  }

                 
              
               
              });
           
    
                var database = firebase.firestore(); 
                //gets all appointment for doctor   
              
                let appointments = database.collection(References.CategoryThree).where("doctorId","==",uid)
                      
                     
                    
              appointments.onSnapshot((querySnapshot)=>{                 
                let docarray = [];


                querySnapshot.forEach((doc)=>{   
                  let docPhoto = doc.data().userPhoto?doc.data().userPhoto:'';
                docarray.push({
                  name: doc.data().patientName,    
                  key: doc.id,
                  channel:doc.data().channel,
                  date:doc.data().date,
                  paid:doc.data().paid,
                  patId:doc.data().patientId,
                  transactionId:doc.data().transactionId,
                  docId:doc.data().doctorId,
                  hospitalId:doc.data().hospitalId,
                  avatar:doc.data().patientPhoto,
                  doctorName:doc.data().doctorName,
                  patientName:doc.data().patientName,
                  date:doc.data().date,
                  userOccupation:doc.data().userOccupation,
                  location:doc.data().patientLocation
              
                })    
              })       
                  this.setState({                  
                      appointments:docarray,
                      noAppointMents:docarray.length > 0?false:true
  
                  })
                   
                  
              },(err)=>alert('error reading dataBase'),()=>alert('completes'))
                         

       
    }   
    

    //when user answers call
  async  userAnswerCall(){
     this.setState({connecting:true});
     try{
       const answerCall = await axios.post(API_PREFIX+'Users/acceptCall',{payload:this.state.payload});
       const {message,status} = answerCall.data;
       StopSound();
       if(status == 'Success'){
         this.setState({calling:false,connecting:false})
         toast('call started');
         this.props.navigation.navigate('DocRenderCall',this.state.payload)
       }else{
         this.setState({connecting:false,calling:false})
         toast(message);
       }
     }catch(e){
       StopSound();
       this.setState({connecting:false,calling:false})
       toast(e.message);
       console.log(e)
     }
   
    }
    
    

   async offLine(){    
      this.setState({settingStatus:true});

      try{
         const rejectCall = await axios.post(API_PREFIX+'Users/offline',{uid:firebase.auth().currentUser.uid});
         const {message,status} = rejectCall.data;
         this.setState({settingStatus:false});
         if(status == 'Success'){
           toast('status success');
         }else{
           toast(message);
         }
      }catch(e){
        this.setState({settingStatus:false});
        toast(e.message);
        console.log(e);
      }


    }


  async  online(){    

      this.setState({settingStatus:true});

      try{
         const rejectCall = await axios.post(API_PREFIX+'Users/online',{uid:firebase.auth().currentUser.uid});
         const {message,status} = rejectCall.data;
         this.setState({settingStatus:false});
         if(status == 'Success'){
           toast('status success');
         }else{
           toast(message);
         }
      }catch(e){
        this.setState({settingStatus:false});
        toast(e.message);
        console.log(e);
      }


    }

    
 


    //call rejection logic
  async  doctorRejectCall(){    
      
      this.setState({calling:false,isUserFree:true,connecting:false},()=> StopSound());

      try{
         const rejectCall = await axios.post(API_PREFIX+'Users/rejectCall',{uid:this.state.payload.doctorId});
         const {message,status} = rejectCall.data;
         if(status == 'Success'){
           toast('rejection success');
         }else{
           toast(message);
         }
      }catch(e){
        this.setState({calling:false,connecting:false})
        toast(e.message);
        console.log(e);
      }


    }
     
    
    
    renderCalling(){
      return( <Modal visible={this.state.calling} onRequestClose={()=>''} >
           <StatusBar backgroundColor="#00aff0"/>
          <View style={styles.callingContainer}>
          <View style={styles.callInfo}>
             <H2 style={styles.header1}>Incoming call</H2>
             <H3 style={styles.header2}>{this.state.callerName + ' '}</H3>
             <Text>{this.state.location + ' '}</Text>
             <Text style={styles.header2}>{this.state.occupation + ' '}</Text>
             {this.state.connecting?<Text style={{fontWeight:'bold',color:'#fff',marginTop:10}}>Connecting please wait....</Text>:null}
          </View>
          <View style={styles.imgContainer}>
          <Image source={{uri:this.state.callPhoto}} style={styles.img}/>
          </View>
          {this.state.connecting?null:
              <View style={styles.callActions}>
            
              <View style={styles.callInfo}>
               <TouchableNativeFeedback onPress={()=>this.userAnswerCall()}>
                 <View style={styles.actionContainer}>
                     <Icon name='call' style={styles.answerCallStyle}/>
                   </View>
               </TouchableNativeFeedback>     
              </View>
               
              <View style={styles.answerCallContainer}>
              <TouchableNativeFeedback onPress={()=>this.doctorRejectCall()}>
               <View style={styles.actionContainer}>
                 <Icon name='call' style={styles.endCallStyle}/>
               </View>    
              </TouchableNativeFeedback>
                    
              </View>
                        
           </View>
          }
        </View>
      </Modal>)
    }  

      //whenever status is online a notiication is sent to all patient who have an appointment with doctor
      sendNotification(){
        fetch(PUSH_NOTIFICATION_URL_FIREBASE, {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({        
                topic:this.state.docKey,
                payload:{
                    docName:this.state.docName,
                    docKey:this.state.docKey   
                }
            })
            }).then((val)=>val.json())
            .then((valz)=>{
              toast('Presence sent to client')
            }).catch((err)=>{
                //
            })
    }
      
    //toggle presence of doctor on or off
    togglePresence(){
           if(this.state.online){
              this.offLine();
           }else{
             this.online();
           }
    }
    
    
    render(){
        return(          
          <Container>    
                    <View style={styles.container}>
                    
                    {/* <Toolbar title='Appointments'/> */}
                    <Header style={{backgroundColor:Colors.primary}} androidStatusBarColor="#00aff0">
                          <Left style={{width:100}}> 
                              
                          </Left>
                          <Body style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                            <Text  style={{textAlign:'center',alignSelf:'center',color:"#fff",marginLeft:30}}>{DefaultCustoms.AppointmentPage}</Text>
                          </Body>
                          <Right style={{width:100}}>
                             {this.state.settingStatus?<Spinner color='white'/>: <Toggle
                                  checked={this.state.online}
                                  status="success"
                                  onChange={()=>this.togglePresence()}

                                />}
                          </Right>
                    </Header>
                    {this.renderCalling()}
                      {this.state.appointments.length > 0?
                       <ListWithImage 
                          state={this.state}
                          data = {this.state.appointments}
                          dateRight
                          location
                          onPress={()=> {}}
                          locationProp="location"
                          leftItem
                          degree = '0deg'
                          iconColor={Colors.forestgreen}
                          showItem={["name",]}
                     />
                 
                      :
                       this.state.noAppointMents == false?     
                        <Loading show={true}/>
                      :
                      <Loading show={false} text={DefaultCustoms.NoAppointments}/>
                      }
                    </View>
          </Container>        
        )
    }
}   

const styles = StyleSheet.create({
  answerCallContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    justifyContent:'center'
  },
  endCallStyle:{
    color:Colors.red,
    fontSize:Typography.extraLargeFontSize,
    alignSelf:'center',
    transform:[{rotate:'270deg'}]
  },
  answerCallStyle:{
    color:Colors.forestgreen,
    fontSize:Typography.extraLargeFontSize,
    alignSelf:'center'
  },
  actionContainer:{
    height:60,
    width:60,
    borderRadius:100,
    backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center'
  },
  callActions:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row'
  },
  img:{
    width:150,
    height:150,
    borderRadius:100,
    alignSelf:'center'
  },
  imgContainer:{
    flex:1
  },
  header2:{
    fontWeight:'600',
    fontSize:Typography.buttonFontSize,
    padding:5,
    color:Colors.white},
  headerText:{
    fontSize:Typography.buttonFontSize,
    color:Colors.white,
    fontWeight:'400'
  },
  callInfo:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    justifyContent:'center'
  },
  callingContainer:{
    flex:1,
    backgroundColor:"#00aff0"
  },
  container:{
    flex:1,
    backgroundColor:Colors.containers
  }
})