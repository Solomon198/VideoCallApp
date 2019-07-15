import React,{Component} from 'react'
import {Text,H1,Icon,Button,H3} from 'native-base'
import * as firebase from 'react-native-firebase';
import {ScrollView,StyleSheet,View,DatePickerAndroid,TimePickerAndroid,Modal,Image,Dimensions} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import { YouTubeStandaloneAndroid } from 'react-native-youtube';
import {YOUTUBE_DEVELOPER_API_KEY} from 'react-native-dotenv'
import { Thumbnail } from 'react-native-thumbnail-video';
import {Loading} from '../../components/Loader/loader'
import {Colors} from '../../styles/index'
import { AppStatus } from '../../Utils/functions';


const firestore = firebase.firestore();
const {width} = Dimensions.get('window');

    
export default class SetAppointMent extends Component {
    constructor(props){
        super(props);

    }
    
    state = {   
           data :this.props.navigation.state.params,
           visible:false    ,
           youtubeIds:[]
 
    }       


    //Saving appointment to firebase after collecting neccessary information from user like date and credentials that will be neccessary during call and saving of history
    sendAppointMent(date,time){
        const {data,doctor} = this.state.data;
        const {name,key} = data.hospital
        const userName    = data.user.name;
        let FB = firebase.firestore();

        let appointmentId = doctor.key+"-"+firebase.auth().currentUser.uid;
        let appointments = FB.collection('Appointments').doc(appointmentId);
        let hospitalRef = FB.collection("Hospitals").doc(key);
        let doctorRef = FB.collection("doctors").doc(key).collection("credentials").doc(doctor.key);

        
        let appointmentData = {
            patName:userName,    
            time:time,
            date:date,
            hospital:name,
            doctorName:doctor.name,
            channel:doctor.key,
            userPhoto:firebase.auth().currentUser.photoURL,
            docId:doctor.key,
            patId:firebase.auth().currentUser.uid,
            docPhoto:doctor.photo,
            hospitalId:key,
            paid:parseInt(this.state.data.doctor.price)
        }   


        let ref = firestore.collection('users').doc(firebase.auth().currentUser.uid).collection('personalInfo').doc('info');




                        ref.get().then((snapshot)=>{
                            if(!snapshot.data())return this.setState({visible:false},()=>{
                                toast('You dont have enought coins to set appointment')
                            });

                            let value = snapshot.data().amount?snapshot.data().amount:0
                            if(parseInt(value) >= parseInt(this.state.data.doctor.price)){
                                                    
                                hospitalRef.get().then((val)=>{
                                    let queue = val.data().queue;
                                    let total = queue + 1;
                                    hospitalRef.update({queue:total})
                                    
                                })

                                doctorRef.get().then((val)=>{
                                    let queue = val.data().queue?val.data().queue:0;
                                    let total = queue + 1;
                                    doctorRef.update({queue:total})
                                    
                                })

                               
                               
                               
                                let newCoins = parseInt(value) - parseInt(this.state.data.doctor.price);
                                    ref.update({amount:newCoins}).then((val)=>{
                                        appointments.set(appointmentData).then(()=>{
                                            firebase.messaging().subscribeToTopic(doctor.key)
                                            this.props.navigation.goBack()
                                            this.setState({visible:false},()=>{
                                           });
                                        })
                                })
                                 
                            
                            }else{
                                this.setState({visible:false},()=>{
                                    toast('Get more coins to set this appointment')
                                });
                            }
                        })


    }



    componentDidMount(){
        //get youtubs urls of doctor passed from data gotten from a specific doctor in an hospital
        this.setState({youtubeIds:this.state.data.doctor.youtube}); 
    } 
    
    
    //This methode get the urls of youtube the user can either paste urls from phone or from browser but what we are interested is the id of the video and the youtube libary will play the video provided it is a youtube video and the id is correct. the two url format has / an = before the id which is a good target to get the id for either
    getYoutubeVidzId(url){
        let checkUrl = url.indexOf('=');
        let lastSlashPos = checkUrl == -1?url.lastIndexOf('/'):url.lastIndexOf('=');
        let videoId = url.substring(lastSlashPos+1);

        return videoId
     }
 
     //loader component to show for busy
    loader(){
        return(
            <Modal 
                transparent 
                visible={this.state.visible}
            >
             <Loading show={true}/>

            </Modal>
        )
    }

    //Date picker
    _setAppointMent(){       
        DatePickerAndroid.open({
            // Use `new Date()` for current date.   
            // May 25 2020. Month 0 is January.
            
            date: new Date()
          }).then((date)=>{
              if(date.action == "dismissedAction")return false;
             TimePickerAndroid.open({        
                hour: 14,
                minute: 0,
                is24Hour: true, // Will display '2 PM'
              }).then((time)=>{   
                  if(time.action == 'dismissedAction')return false;
                  let _date = {y:date.year,m:date.month,d:date.day}
                  let _time = {h:time.hour,m:time.minute}
                  this.setState({visible:true},()=>{
                    this.sendAppointMent(_date,_time)
                  })
              }).catch(()=>{
                  //do nothing
              })
          }).catch((val)=>{
              //do nothing         
          })
    }


    //playing video from youtube embedder libary
    playYoutTubeVidz(url){
        YouTubeStandaloneAndroid.playVideo({
            apiKey: YOUTUBE_DEVELOPER_API_KEY,     // Your YouTube Developer API Key
            videoId: this.getYoutubeVidzId(url),     // YouTube video ID
            autoplay: true,             // Autoplay the video
            startTime: 0,             // Starting point of video (in seconds)
          })
            .then(() => toast('Player exited'))
            .catch(errorMessage => toast(errorMessage+''))
    }


    appStatus(){
        AppStatus().then((val)=>{
            if(val){
                this._setAppointMent();
            }else{
               toast('App under maintainance please try again later')
            }
        })
    }


   
    
    render(){
             console.log(this.state.youtubeIds)
        return(  
          <ScrollView style={styles.mainContainer}>
              <Toolbar  canGoBack goBack={()=>this.props.navigation.goBack()}/>
              {this.loader()} 
              <Image style={styles.img} source={{uri:this.state.data.doctor.photo}}/>  
              <View style={styles.topContainer}>
                 <H1 style={styles.headerText}>
                     {this.state.data.data.hospital.name}   
                 </H1>
                 <H3 style={styles.textStyle}>
                    {this.state.data.doctor.name}
                 </H3>
                 {this.state.data.doctor.bio?
                 <View>
                   <Text style={styles.label}>Bio :</Text>
                   <Text>{this.state.data.doctor.bio}</Text>
                  </View>
               
                 :
                 <Text></Text>
                 }
              </View>
              <View>
              <View style={styles.youtubeContainer}>
              {
                  this.state.youtubeIds[0]?
                  <View style={styles.youtube}>
                   <Thumbnail onPress={()=> this.playYoutTubeVidz(this.state.youtubeIds[0])} imageWidth={width} imageHeight={200}  url={this.state.youtubeIds[0]} />
                   </View>
                :<Text></Text>
              }

{
                  this.state.youtubeIds[1]?
                  <View style={styles.youtube}>
                   <Thumbnail onPress={()=> this.playYoutTubeVidz(this.state.youtubeIds[1])}  imageWidth={width}  imageHeight={200}   url={this.state.youtubeIds[1]} />
                   </View>
                :<Text></Text>
              }

{
                  this.state.youtubeIds[2]?
                  <View style={styles.youtube}>
                   <Thumbnail onPress={()=> this.playYoutTubeVidz(this.state.youtubeIds[2])} imageWidth={width}  imageHeight={200}    url={this.state.youtubeIds[2]} />
                   </View>
                :<Text></Text>
              }
              
              </View>

                 
              </View>
              <View style={styles.bottomContainer}>
                      <View style={styles.priceContainer}>
                        <Icon style={styles.textStyle} name='logo-usd'/>
                        <Text style={styles.amount}>
                        {this.state.data.doctor.price+'.00'}
                        </Text>
                      </View>
                    <Button style={styles.btn} onPress={()=>this.appStatus()} light block rounded>
                         <Text style={styles.textStyle}> Set Appointment</Text>
                    </Button>    
              </View>
          </ScrollView>        

        )
    }
}        

const styles = StyleSheet.create({
    btn:{
        backgroundColor:Colors.overLay
    },
    amount:{
        fontWeight:'bold',
        fontSize:25,
        marginLeft:10,
        color:Colors.baseText},
    priceContainer:{
        marginBottom:10,
        flexDirection:'row',
        alignContent:'center',
        alignItems:'center',
        justifyContent:'center'},
    youtubeContainer:{
        flex:1,
        backgroundColor:Colors.containers,
        marginRight:2.5
    },
    label:{
        fontWeight:'bold'
    },
    headerText:{
      fontWeight:'bold',
      marginBottom:10,
      color:Colors.baseText
    },
    mainContainer:{
        flex:1,
        backgroundColor:Colors.containers},
    img:{
        width:100,
        height:100,
        borderRadius:100,
        marginTop:10,
        marginLeft:10
    },
    textStyle:{
        color:Colors.baseText
    },
    youtube:{
        width:width,
        height:200,
        marginBottom:5
    },
   container:{
       backgroundColor:Colors.containers,margin:2.5
   },
   topContainer:{
       justifyContent:'center',
       backgroundColor:Colors.containers,
       padding:20,
   },
   bottomContainer:{    
       flex:1,
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center',
       margin:20
   }
})