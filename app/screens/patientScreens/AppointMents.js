


import React,{Component} from 'react'
import {View,Container,List,ListItem} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,Modal} from 'react-native'
import Toolbar from '../../components/Toolbar/Toolbar';
import {toast} from '../../components/toast'
import {ListWithImage} from '../../components/RenderList/ListComponents'
import { Colors } from '../../styles';
import {Loading} from '../../components/Loader/loader'
import { deleteDirectory, permissionCheck, startRecorder, AppStatus } from '../../Utils/functions';
import References from '../../Utils/refs'
import DefaultCustoms from '../../Utils/strings'
import axios from 'axios'
import { API_PREFIX} from 'react-native-dotenv'


     


const storage = AsyncStorage;

const dataBase = firebase.database();

export default class AppointMents extends Component {  
  
  
    constructor(props){
        super(props);

    }         

   
    
    state = {
    callInfo:{},
    appointments:[],
    showLive:false, 
    addedTime:0,
    item:{},
    user:{},
    callerName:'',
    connecting:'',
    docKey:'',
    noAppointMents:false,
    showAdd:false,
    uid:firebase.auth().currentUser.uid,
    finishRating:false,
    firstName:'',
    LastName:'',
    location:'',
    occupation:''

    } 
    
    

    //This methode is called every time the app is started i.e waked after killed
    //The methode get the status of doctors and listened for any changes afterwards and update the appointment list with the status.
    async getStatus(){
      const ref = firebase.firestore().collection(`status`);
      let appointments = Object.assign([],this.state.appointments);

      for(let appointment of appointments){
        const getStatus = await ref.doc(appointment.doctorId).get();

        appointment.status = getStatus.data().status;
      }

      this.setState({appointments:appointments})

        
    }


  
    //This methode takes a parameter which is the doctor to be called informations and send signal to the doctor if the doctor is online for a call and send info about the user to the doctor.
  
  async  triggerCall(item){
       try{
        this.setState({connecting:item.channel});
        const startCall = await axios.post( `${API_PREFIX}Users/call`,{payload:item});
        const {message,status} = startCall.data;
        if(status == 'Success'){
          this.props.navigation.navigate("RenderCall",{payload:item,appointmentId:item.key})
          toast("we can make call now")
        }else{
          this.setState({connecting:''})
          toast(message);
        }
       }catch(e){
          toast(e.message);
          this.setState({connecting:''})
       }
    }   
    

   

       
    componentDidMount(){
        var database = firebase.firestore();   
              
                const ref = firebase.firestore().collection(`status`);
                ref.onSnapshot((snapshot)=>{
                     this.getStatus()
                })



                //getting appointments from firebase and listnening for changes
                let uid = firebase.auth().currentUser.uid;

                let appointments = database.collection(References.CategoryThree).where("patientId","==",uid)
              appointments.onSnapshot((querySnapshot)=>{            
        
                  let docarray = [];    
                      querySnapshot.forEach((doc)=>{   
                           let docPhoto = doc.data().docPhoto?doc.data().docPhoto:'';
                            docarray.push({
                                name: doc.data().doctorName,    
                                key: doc.id,
                                channel:doc.data().channel,
                                date:doc.data().date,
                                worth:doc.data().worth,
                                hospitalId:doc.data().hospitalId,
                                avatar:doc.data().doctorPhoto,
                                doctorName:doc.data().doctorName,
                                patientId:doc.data().patientId,
                                doctorId:doc.data().doctorId,
                                patientName:doc.data().patientName,
                                doctorOccupation:doc.data().doctorOccupation,
                                patientOccupation:doc.data().patientOccupation,
                                location:doc.data().doctorLocation,
                                doctorPhoto:doc.data().doctorPhoto,
                                patientPhoto:doc.data().patientPhoto,
                                patientLocation:doc.data().patientLocation,
                                doctorLocation:doc.data().doctorLocation,
                                status:'offline'
                            



                            })    
                       });     

                  this.setState({                  
                      appointments:docarray,
                      noAppointMents:docarray.length > 0?false:true,
                     

                  },()=>{
                    this.getStatus();
                  })
                   
                        
              },(err)=>alert('error reading dataBase'),()=>alert('completes'))
  


        
       

       
    }    



    //checks the status of doctor and return appropriate color name for status
    getColorForPresence(item){
       if(!item.status){
         return 'gray'
       }

       if(item.status == 'offline'){
         return 'gray'
       }

       if(item.status == 'online'){
         return 'green'
       }

       if(item.status == 'busy'){
         return 'orange'
       }
    }


    checkPermission(item){
      permissionCheck().then((val)=>{
        AppStatus().then((val)=>{
          if(val){
                this.triggerCall(item)
          }else{
             toast('App under maintainance please try again later')
          }
      })
      })
    }

    
    

    
    render(){
         return(             
          <Container style={{backgroundColor:Colors.containers}}>    
                  <View style={{flex:1,backgroundColor:Colors.containers}}>
                     <Toolbar title={DefaultCustoms.AppointmentPage}/>             

                          
                      {  //tenary operator that checks for empty list of appointments
                        this.state.appointments.length > 0?

                        <ListWithImage 
                           state={this.state}
                           data = {this.state.appointments}
                           onPress={(item)=> this.triggerCall(item)}
                           status = {true}
                           dateRight
                           connecting={this.state.connecting}
                          //  this.getColorForPresence(item)
                           location
                           locationProp="location"
                           iconRightName='logo-whatsapp'
                           getBgColor={(item)=> this.getColorForPresence(item)}
                           leftItem
                           degree = '0deg'
                           iconColor={Colors.forestgreen}
                           showItem={["name",]}
                         />
                       


                       : 
                       
                       !this.state.noAppointMents?     
                        <Loading show={true}/>
                      :
                       <Loading text='No appointment' show={false}/>
                      }
                     
                  </View>
             
          </Container>
        )
    }
}   


 