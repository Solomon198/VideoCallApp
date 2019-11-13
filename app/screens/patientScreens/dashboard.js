import React,{Component} from 'react'
import {Container,Button,Text} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,View} from 'react-native'
import Toolbar from '../../components/Toolbar/Toolbar';
import SplashScreen from 'react-native-splash-screen'
import {Colors} from '../../styles/index'
import type { Notification } from 'react-native-firebase';
import {ListWithImage} from '../../components/RenderList/ListComponents';
import {Loading} from '../../components/Loader/loader'
import {deleteDirectory} from '../../Utils/functions'
import References from '../../Utils/refs'
import DefaultCustoms from '../../Utils/strings'


const messaging = firebase.messaging();


const storage = AsyncStorage;


export default class PatientDashBoard extends Component {
    constructor(props){
        super(props);
    
    }

    
    state = {
       hospitals:[
          
        ],
        user:false,
        users:''  ,
        channel:'' ,
        showLive:false,
        isUserFree:true,
        calling:false,
        path:'',
        fetched:false
       

    } 

   
    notificationListener(){

      this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
        // Process your notification as required
        console.log('notification shown')
        console.log(notification.data)
        // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    });



    this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
        // Process your notification as required
        //triggered when app is not dead or user is in app can be used to show inapp notication
        console.log('notification came');
        console.log(notification.data);
        
    });



    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      console.log('notification opened')
      console.log(notification.data)
      // Get information about the notification that was opened
      const notification: Notification = notificationOpen.notification;
  });


  firebase.notifications().getInitialNotification()
  .then((notificationOpen: NotificationOpen) => {
    if (notificationOpen) {
      this.props.navigation.navigate('AppointMents')
      // App was opened by a notification
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      // Get information about the notification that was opened
      const notification: Notification = notificationOpen.notification;  
    }
  });

    }
    

    //checks permission for messaging from react native firebase library
    triggerPermission(){
      messaging.hasPermission().then((val)=>{
        if(val){
          //user can recieve notification
        }else{
          messaging.requestPermission().then((val)=>{
            if(val){
              toast('please accept the notification permission')
            }else{
              // user granted persmiison
            }
          }).catch((err)=>{
            toast('Please accept the notification permission')
          })
        } 
      })
    }
   

    

    

    componentWillUnmount() {
      this.notificationDisplayedListener();
      this.notificationListener();
      this.notificationOpenedListener()
  }

  
    
       
    componentDidMount(){
      
      // this.props.navigation.navigate('PatientRatingStack',{id:'kdkdkkk'})


      this.notificationListener()   
     
      SplashScreen.hide();
     

      messaging.subscribeToTopic('General');

           

      var database = firebase.firestore();    
 
      var db = database.collection("Category")
             
           
          
    db.onSnapshot((querySnapshot)=>{                 
        let docarray = [];    
            querySnapshot.forEach(function(doc) {
                
                  docarray.push({
                      name: doc.data().name,
                      avatar:doc.data().avatar,
                      key: doc.id
                  })    
             });                      
        
        this.setState({                  
            hospitals:docarray,
            fetched:true
        })
         
        
    },(err)=>alert('error reading dataBase'),()=>alert('completes'))
            
    }    



    
    //Navigate to doctor stack on an hospital
    nextNavigation(param){
        this.props.navigation.navigate('Doctors',{key:param.key})
    }

  

    




    
    render(){  
        return(          
          <Container style={{backgroundColor:Colors.white}}>    
                      <Toolbar title={DefaultCustoms.HospitalList} />   


                      {
                        this.state.hospitals.length > 0?  
                     
                              <ListWithImage
                                data = {this.state.hospitals}
                                onPress={(item)=>this.nextNavigation(item)}
                                iconLeftName='medical'
                                showRight={true}
                                iconColor={Colors.iconColor}
                                showItem ={['name']}
                              />      
                        
                        :
                         this.state.fetched && this.state.hospitals.length == 0?
                          <View style={{flex:1,justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                                <Text>Content Unavailable</Text>
                          </View>
                          :
                              <Loading show={true}/>
                      }

          </Container>
        )
    }
}                                                