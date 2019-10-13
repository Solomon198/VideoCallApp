import React,{Component} from 'react'
import {View,Container,H2,Icon,H3,Header,Right,Left,Body,Title} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,TouchableNativeFeedback,Modal,Image,StyleSheet,StatusBar} from 'react-native'
import { StopSound, PlaySoundRepeat } from 'react-native-play-sound';
import Toolbar from '../../components/Toolbar/Toolbar';
import type { Notification } from 'react-native-firebase';
import {toast} from '../../components/toast'
import SplashScreen from 'react-native-splash-screen'
import {PUSH_NOTIFICATION_URL_FIREBASE} from 'react-native-dotenv'
import { ListWithImage } from '../../components/RenderList/ListComponents';
import { Loading } from '../../components/Loader/loader';
import { Colors, Typography } from '../../styles';
import {deleteDirectory, permissionCheck} from '../../Utils/functions'
import { Toggle,Text } from 'react-native-ui-kitten';
import References from "../../Utils/refs"
import DefaultCustoms from '../../Utils/strings'





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
      status:false,


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

    
    //when doctor is set online it sends notifications to all patient with appointment with doctor
    broadcastPresence(){
      storage.getItem('status').then((val)=>{
        if(val == 'offline')return false;
        firebase.firestore().collection(References.CateogryEleven).doc(this.state.docKey)
        .set({name:this.state.doctorName,status:'online'}).then(()=>{
        })
        this.sendNotification()
    })  
    }



   
    
    componentDidMount(){     
        SplashScreen.hide();
        storage.getItem('user').then((val)=>{
              let data = JSON.parse(val);
              this.setState({docKey:data.key,docName:data.name,online:false},()=>{
    
              })  
           
        })
       
        deleteDirectory().then(()=>'').catch(()=>"")
        permissionCheck().then(()=>{
          //yea permission is ok
        }).catch((err)=>{
          toast("Please accept all permission to enable effective video call")
        })
        messaging.subscribeToTopic('General');
        this.broadcastPresence();  
      
        storage.getItem('record').then(val=>{
          if(val){
            //do noting
          }else{
            storage.setItem('record',JSON.stringify(true))
          }
        })
        storage.getItem('user').then((val)=>{
          storage.getItem('appIntro').then((kk)=>{
            let data = JSON.parse(val);         
            this.setState({docKey:data.key,doctorName:data.name,data:data},()=>{
           
            });

            const $ref = dataBase.ref(`${References.CategorySixteen}/${data.key}/`);
            
            //call listener 
            $ref.set({callerName:false,busy:false,added:345,channel:'eee',endCall:false,uid:false}).then((val)=>{
              $ref.on('value',(snapshot)=>{        
                if(this.state.initializeApp == false){       
                  this.setState({initializeApp:true})     
              }else{
                  if(snapshot.val().endCall)return this.setState({calling:false,uid:false},()=>StopSound());
                  if(snapshot.val().callerName == 'false' || snapshot.val().callerName == false)return false;
                  if(snapshot.val().busy)return false;
                  this.setState({             
                    calling:true,                           
                    isUserFree:false,
                    callerName:snapshot.val().callerName, 
                    channel:snapshot.key,       
                    uid: snapshot.val().uid,
                    callPhoto:snapshot.val().photo,
                    occupation:snapshot.val().occupation,
                    location:snapshot.val().location
                  
                  },()=>PlaySoundRepeat('call_tone'));
              }
               
              });
            })         
           
    
            this.setState({user:data},()=>{
                var database = firebase.firestore(); 
                //gets all appointment for doctor   
              
              
                let appointments = database.collection(References.CategoryThree).where("docId","==",data.key)
                      
                     
                    
              appointments.onSnapshot((querySnapshot)=>{                 
                let docarray = [];


                querySnapshot.forEach((doc)=>{   
                  let docPhoto = doc.data().userPhoto?doc.data().userPhoto:'';
                docarray.push({
                    name: doc.data().patName,    
                    key: doc.id,
                    channel:doc.data().channel,
                    date:doc.data().date,
                    time:doc.data().time,
                    hospital:doc.data().hospital,
                    photo:docPhoto,
                    paid:doc.data().paid,
                    patId:doc.data().patId,
                    docId:doc.data().docId,
                    hospitalId:doc.data().hospitalId,
                    docPhoto:doc.data().userPhoto,
                    userPhoto:doc.data().userPhoto,
                    patName:doc.data().patName,
                    docName:doc.data().docName,
                    userLocation:doc.data().userLocation,
                    userOccupation:doc.data().userOccupation
                })    
              })       
                  this.setState({                  
                      appointments:docarray,
                      noAppointMents:docarray.length > 0?false:true
  
                  })
                   
                  
              },(err)=>alert('error reading dataBase'),()=>alert('completes'))
                         
            });
          })
        })

       
    }   
    

    //when user answers call
    userAnswerCall(){
      let data = {
        uid:this.state.uid,//user id
        channel:this.state.channel,//doctors key from firestore as his id for id and channel
        showAdd:this.state.showAdd,//either to show add button depending on loged in user
        doctorName:this.state.doctorName,
        userName:this.state.callerName,

      }

      
      let wrapData = JSON.stringify(data);

      storage.setItem('videoData',wrapData).then((val)=>{ 
        this.setState({isUserFree:false,calling:false,showLive:true},()=>
        {this.props.navigation.navigate('DocCallStack');
        const $ref = dataBase.ref(`${References.CategorySixteen}/${this.state.docKey}/`);
        $ref.set({callerName:false,online:true,added:345,channel:'eee',endCall:false,uid:false,busy:true});
        StopSound()
      }    
      )
      }).catch((err)=>{
         //
      })
     
      firebase.database().ref('/'+ References.CateogryEleven+'/'+this.state.docKey)
      .set({name:this.state.docName,status:'busy'});
      storage.setItem("status",'busy');
          
      
      //set paramaters for page and move to the page.
    }    

 

    //when doctor ends call or reject a call
    endCall(){     
      this.setState({calling:false,isUserFree:true},()=> StopSound())
      this.doctorRejectCall();  
     
    }    


    //call rejection logic
    //method sends signal to the node that patient is listening to with properties telling it call is rejected
    doctorRejectCall(){    
      const randomNumber = Math.round(Math.random() * 1000000);
      dataBase.ref(`${References.CategorySixteen}/${this.state.uid}/`).set({addTime:true,added:randomNumber,callRejected:true}).then((val)=>{
  
      }).catch((err)=>this.setState({modal:false}))
      firebase.database().ref('/'+References.CateogryEleven+'/'+this.state.docKey)
      .set({name:this.state.docName,status:'online'});
      storage.setItem("status",'online');
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
          </View>
          <View style={styles.imgContainer}>
          <Image source={{uri:this.state.callPhoto}} style={styles.img}/>
          </View>
          <View style={styles.callActions}>
            
             <View style={styles.callInfo}>
              <TouchableNativeFeedback onPress={()=>this.userAnswerCall()}>
                <View style={styles.actionContainer}>
                    <Icon name='call' style={styles.answerCallStyle}/>
                  </View>
              </TouchableNativeFeedback>     
             </View>
              
             <View style={styles.answerCallContainer}>
             <TouchableNativeFeedback onPress={()=>this.endCall()}>
              <View style={styles.actionContainer}>
                <Icon name='call' style={styles.endCallStyle}/>
              </View>    
             </TouchableNativeFeedback>
                   
             </View>
                       
          </View>
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
        this.setState({online:!this.state.online},()=>{
            if(this.state.online){
                    storage.getItem('lastCalled').then((lastCalled)=>{
                      let nowDate = new Date().getTime();
                      if(lastCalled){
                        let lastCalledVal = parseInt(lastCalled)/1000;
                        let min = ((nowDate/1000) - lastCalledVal)/60;
                        if(min >= 30){
                          let ref = firebase.database().ref(`${References.CateogryEleven}/`+this.state.docKey);
                          let setNewDate = new Date().getTime();
                          let setNewDateformat = setNewDate + '';
                          storage.setItem("lastCalled",setNewDateformat);
                          ref.set({name:this.state.docName,status:'online'}).then(()=>{
                          })
                          ref.onDisconnect().set({name:this.state.docName,status:'offline'});
                         
                          this.sendNotification()
                        }else{
                          let ref = firebase.database().ref(`${References.CateogryEleven}/`+this.state.docKey);
                          
                         ref.set({name:this.state.docName,status:'online'}).then(()=>{
                         })
                         ref.onDisconnect().set({name:this.state.docName,status:'offline'});
                           }
                          }else{
                          let ref = firebase.database().ref(`${References.CateogryEleven}/`+this.state.docKey);
                          let setNewDate = new Date().getTime();
                          let setNewDateformat = setNewDate + '';
                          storage.setItem("lastCalled",setNewDateformat);
                          ref.set({name:this.state.docName,status:'online'}).then(()=>{
                          })
                          ref.onDisconnect().set({name:this.state.docName,status:'offline'});
                         
                          this.sendNotification()
                          }      
                    })
            }else{
                storage.setItem('status','offline').then(()=>{
                 firebase.database().ref(`${References.CateogryEleven}/`+this.state.docKey)
                .set({name:this.state.docName,status:'offline'})
                })
                
            }
        })

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
                            <Toggle
                                  checked={this.state.online}
                                  status="success"
                                  onChange={()=>this.togglePresence()}

                                />
                          </Right>
                    </Header>
                    {this.renderCalling()}
                      {this.state.appointments.length > 0?
                       <ListWithImage 
                          dateRight
                          data = {this.state.appointments}
                          onPress={()=> ''}
                          dateRight
                          location
                          locationProp="userLocation"
                          showItem={["name","userOccupation"]}
                     />
                 
                      :
                       !this.state.noAppointMents?     
                        <Loading show={true}/>
                      :
                      <Loading show={false} text='No appointments'/>
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