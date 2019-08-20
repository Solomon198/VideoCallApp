


import React,{Component} from 'react'
import {View,Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,Modal} from 'react-native'
import Toolbar from '../../components/Toolbar/Toolbar';
import {toast} from '../../components/toast'
import {ListWithImage} from '../../components/RenderList/ListComponents'
import { Colors } from '../../styles';
import {Loading} from '../../components/Loader/loader'
import { deleteDirectory, permissionCheck, startRecorder, AppStatus } from '../../Utils/functions';


     


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
    getStatus(){
      const ref = firebase.database().ref('/status/');
      ref.once('value',(onSnapshot)=>{
        if(!onSnapshot.exists())return false;
        let arrayOfSnapshot = [];
        onSnapshot.forEach((val)=>{
          arrayOfSnapshot.push({
            docKey:val.key,
            status:val.val().status,
            name:val.val().name
          }) 
        })
        let appointments = this.state.appointments;
        appointments.forEach((value,index)=>{
           arrayOfSnapshot.forEach((val)=>{
             let $docKey = value.key.split('-')[0];
             if($docKey == val.docKey){
               value['status'] = val.status;

             }
           })
        })

        this.setState({
          appointments:appointments
        },()=>{
          ref.off();
          ref.on('child_changed',(onsnapshot2)=>{
            appointments.forEach((_val)=>{
              let $docKey = _val.key.split('-')[0];
              if($docKey == onsnapshot2.key){
                _val["status"] = onsnapshot2.val().status;
                this.setState({appointments:appointments})

              }
            })
          })
        })
        
      })
    }


  
    //This methode takes a parameter which is the doctor to be called informations and send signal to the doctor if the doctor is online for a call and send info about the user to the doctor.
  
    triggerCall(item){
      const user = firebase.auth().currentUser;
      let videoData = {   
        photo:user.photoURL,
        uid:user.uid,
        channel:item.channel,//doctors key from firestore as his id for id and channel
        showAdd:false,//either to show add button depending on loged in user
        doctorName:item.name,
        userName:this.state.user.name,
        ...item
      }
      let wrapData = JSON.stringify(videoData);
      const statusRef =  dataBase.ref(`status/${item.channel}/`);
    
     statusRef.once("value",(onSnapshot)=>{
        if(!onSnapshot.exists()) return  storage.setItem('videoData',wrapData).then((val)=>{
          return           toast('Doctor is offline') ;
         
        }).catch((err)=>{
          //
        })
        let isBusy = onSnapshot.val().status;
        if(isBusy == 'busy'){
          toast('Doctor is busy on another call') 
        }
        else if(isBusy == 'offline'){
          toast('Doctor is offline ') 
        }
        else{
          storage.setItem('videoData',wrapData).then((val)=>{
          }).catch((err)=>{
            //
          })
 
          
          this.startCall(item)    
        }
      })
    }   
    

    //This send the signals to the doctor with some info about the user it is invoked by the triggercall methode
    startCall(item){
        const user = firebase.auth().currentUser;
        const userName = this.state.firstName + ' ' + this.state.lastName;
        const randomNumber = Math.round(Math.random() * 1000000);   
        dataBase.ref(`listeners/${item.channel}/`).set({callerName:userName,added:randomNumber,online:true,addTime:false,endCall:false,uid:user.uid,photo:user.photoURL,occupation:this.state.occupation,location:this.state.location}).then((val)=>{    
          this.setState({showLive:true,channel:item.channel,item:item,callerName:userName,docKey:item.channel});
          this.props.navigation.navigate('CallStack');
          storage.setItem("docId",item.channel);
        }).catch((err)=>this.setState({modal:false}))
    }

       
    componentDidMount(){
        var database = firebase.firestore();   

        storage.getItem('user').then((val)=>{
            let data = JSON.parse(val);
            this.setState({user:data},()=>{
               
              
                //getting user name
                let $ref = database.collection('users').doc(firebase.auth().currentUser.uid).collection('personalInfo').doc('info');

                $ref.onSnapshot((onSnapshot)=>{
                   if(!onSnapshot.exists)return false;

                   let data;
                   data =   onSnapshot.data();
                   this.setState({
                     firstName:data.firstName,
                     lastName:data.lastName,
                     location:data.location,
                     occupation:data.occupation, 
                   })   
                })

                //getting appointments from firebase and listnening for changes
                let uid = firebase.auth().currentUser.uid;
                       
                let appointments = database.collection('Appointments').where("patId","==",uid)

              appointments.onSnapshot((querySnapshot)=>{                    
                  let docarray = [];    
                      querySnapshot.forEach((doc)=>{   
                           let docPhoto = doc.data().docPhoto?doc.data().docPhoto:'';
                            docarray.push({
                                name: doc.data().doctorName,    
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
                                docPhoto:doc.data().docPhoto,
                                userPhoto:doc.data().userPhoto,
                                patName:doc.data().patName,
                                docName:doc.data().docName,
                                date:doc.data().date


                            })    
                       });     

                  this.setState({                  
                      appointments:docarray,
                      noAppointMents:docarray.length > 0?false:true,
                      uid:data.uid,
                      userName:data.name,

                  },()=>{
                    this.getStatus();
                  })
                   
                     
              },(err)=>alert('error reading dataBase'),()=>alert('completes'))
  
            });   


        
       
        })       

       
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
                     <Toolbar title='Appointments'/>             

                          
                      {  //tenary operator that checks for empty list of appointments
                        this.state.appointments.length > 0?
                        <ListWithImage 
                           state={this.state}
                           data = {this.state.appointments}
                           onPress={(item)=> this.checkPermission(item)}
                           status = {true}
                           dateRight
                          //  this.getColorForPresence(item)
                           location
                           getBgColor={(item)=> this.getColorForPresence(item)}
                           leftItem
                           degree = '270deg'
                           iconColor={Colors.forestgreen}
                           showItem={["name"]}
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


 