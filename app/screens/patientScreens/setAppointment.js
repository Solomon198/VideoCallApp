import React,{Component} from 'react'
import {H1,Icon,H3,Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {ScrollView,StyleSheet,View,DatePickerAndroid,TimePickerAndroid,Modal,Image,Dimensions,Alert} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import { YouTubeStandaloneAndroid } from 'react-native-youtube';
import {YOUTUBE_DEVELOPER_API_KEY} from 'react-native-dotenv'
import { Thumbnail } from 'react-native-thumbnail-video';
import {Loading} from '../../components/Loader/loader'
import {Colors, Typography} from '../../styles/index'
import { AppStatus } from '../../Utils/functions';
import { Text, Layout ,Button,Radio} from 'react-native-ui-kitten';
import { ButtonComponent } from 'react-native-ui-kitten/ui/button/button.component';
import References from '../../Utils/refs'


const firestore = firebase.firestore();
const {width} = Dimensions.get('window');

    
export default class SetAppointMent extends Component {
    constructor(props){
        super(props);

    }
    
    state = {   
           data :this.props.navigation.state.params,
           visible:false,
           youtubeIds:this.props.navigation.state.params.youtubeIds,
           patName:'',
           userLocation:'',
           userOccupation:''
 
    }   
    
    showLoader(){
        this.setState({visible:true})
    }

    hideLoader(){
        this.setState({visible:false})
    }
    confirmBooking(){
        let ref = firestore.collection(References.CategorySeven).doc(firebase.auth().currentUser.uid).collection(References.CategoryEighteen).doc(References.CategoryNineteen);
        const {price} = this.state.data;

        ref.get().then((snapshot)=>{
                let info =  snapshot.data();
                if(!info.firstName || !info.lastName || !info.location || !info.occupation ){
                  return  Alert.alert('',"Please complete your profile info to set appointment")
                }

                this.setState({patName:info.firstName + ' ' + info.lastName,userOccupation:info.occupation,userLocation:info.location});
                  
            if(!snapshot.data())return this.setState({visible:false},()=>{
                toast('You dont have enough coins to set appointment')
            });

            let value = snapshot.data().amount?snapshot.data().amount:0
            if(parseInt(value) >= parseInt(price)){
                Alert.alert(
                    '',
                    'You are setting appointment with '+ this.state.data.doctorName + ' confirm or cancel',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {text: 'Confirm', onPress: () => {this.appStatus();this.showLoader()}},
                    ],
                    {cancelable: false},
                  );
            }else{
                    this.hideLoader();
                    toast('Get more coins to set this appointment')
            }
        })
    }


    //Saving appointment to firebase after collecting neccessary information from user like date and credentials that will be neccessary during call and saving of history
    sendAppointMent(){
        const {doctorKey,doctorName,hospitalKey,doctorPhoto,price,location} = this.state.data;
        let FB = firebase.firestore();

        let appointmentId = doctorKey+"-"+firebase.auth().currentUser.uid;

        let appointments = FB.collection(References.CategoryThree).doc(appointmentId);
        let hospitalRef = FB.collection(References.CategoryOne).doc(hospitalKey);
        let doctorRef = FB.collection(References.CategoryTWo).doc(hospitalKey).collection(References.CategoryTwentyOne).doc(doctorKey);
        

       
        
        let appointmentData = {
            patName:this.state.patName,    
            doctorName:doctorName,
            channel:doctorKey,
            userPhoto:firebase.auth().currentUser.photoURL,
            docId:doctorKey,
            patId:firebase.auth().currentUser.uid,
            docPhoto:doctorPhoto,
            hospitalId:hospitalKey,
            paid:parseInt(price),
            userLocation:this.state.userLocation,
            userOccupation:this.state.userOccupation,
            date:new Date().getTime(),
            docLocation:location
        }   


        let ref = firestore.collection(References.CategorySeven).doc(firebase.auth().currentUser.uid).collection(References.CategoryEighteen).doc(References.CategoryNineteen);




                        ref.get().then((snapshot)=>{

                            let value = snapshot.data().amount?snapshot.data().amount:0                                                    
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

                               
                               
                               
                                let newCoins = parseInt(value) - parseInt(price);
                                    ref.update({amount:newCoins}).then((val)=>{
                                        appointments.set(appointmentData).then(()=>{
                                            firebase.messaging().subscribeToTopic(doctorKey)
                                            this.props.navigation.goBack()
                                            this.setState({visible:false},()=>{
                                           });
                                        })
                                })
                                 
                            
                           
                        })


    }



    componentDidMount(){
        //get youtubs urls of doctor passed from data gotten from a specific doctor in an hospital
        // this.setState({youtubeIds:this.state.youtube}); 
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
        const {doctorKey} = this.state.data;
        let FB = firebase.firestore();

        let appointmentId = doctorKey+"-"+firebase.auth().currentUser.uid;

        let appointments = FB.collection(References.CategoryThree).doc(appointmentId);
         
        appointments.get().then((valData)=>{
           if(valData.exists){
             this.hideLoader();
             return  toast("You already have a pending appointment with doctor")
           }else{
            AppStatus().then((val)=>{
                if(val){
                    this.sendAppointMent();
                }else{
                   this.hideLoader();
                   toast('App under maintainance please try again later')
                }
            })
           }
        })

        
    }


   
    
    render(){
        const {doctorKey,doctorName,hospitalKey,doctorPhoto,price,userName,hospitalName,doctorBio} = this.state.data;
        return(  
          <Container style={styles.container}>
             <ScrollView>
              {this.loader()} 
             
              <Toolbar canGoBack goBack={()=>this.props.navigation.goBack()} toggleDrawer={()=>this.toggleDrawer()} bgColor={Colors.primary} /> 
               <View style={styles.topContainer}>
             
               </View>
               <View style={styles.picContainer}>
                
                   
                
                  <View style={styles.profilePic} >
                   <Image style={styles.imgStyle} source={{uri:doctorPhoto}} >
                      
                 </Image>
               
                    
                  </View>
                
                
              
                  
               </View>    
             
             
              
             
             
                 <View style={styles.viewContainer}>
                        <Text style={{marginTop:10}} category="h4">
                            {doctorName}
                        </Text>

                        <Layout style={{width:"100%",flexDirection:'row',marginTop:10}}>
                          <Layout  style={{width:"46%",marginRight:5,backgroundColor:Colors.primary,borderRadius:50,padding:5}}>
                            <Text style={{fontSize:20,color:Colors.white,textAlign:'center',letterSpacing:1}}>{hospitalName}</Text> 
                          </Layout>
                          <Layout style={{width:"46%",backgroundColor:Colors.primary,borderRadius:50,padding:5}}>
                             <Text style={{fontSize:20,color:Colors.white,textAlign:'center',letterSpacing:1}}>Therapist</Text>
                          </Layout>
                        </Layout>
                       
                        {doctorBio?
                        <View>
                            <Text style={{marginTop:10}}>{doctorBio} Lorem, ipsum dolor sit amet consectetur adipisicing elit. A, distinctio non! Tempore ad veniam harum, inventore nemo odio voluptate necessitatibus vel itaque, autem sed labore consequuntur recusandae ea tenetur nihil?</Text>
                        </View>
                    
                        :
                        <Text></Text>
                        }
                 </View>
                 <Layout style={{width:"100%",flexDirection:'row',marginTop:10,marginLeft:10,marginRight:10}}>
                          <Layout style={{width:"30%",marginRight:5,justifyContent:'center',backgroundColor:'#f5f5f5',borderRadius:5}}>
                            <Text style={{alignSelf:'center',color:Colors.primary}} category="h6">${price+'.00'}</Text>
                          </Layout>
                          <Layout style={{width:"66%",marginRight:10}}>
                             <Button style={[{borderColor:Colors.lightGray,borderWidth:2,marginRight:10},styles.shadow]} textStyle={{letterSpacing:2}} onPress={()=>this.confirmBooking()} status="success" >SET APPOINTMENT</Button>
                          </Layout>
                        </Layout>


               <View>

               <View style={styles.youtubeContainer}>
           
             {
                   this.state.youtubeIds.length > 0?
                   <View style={styles.youtube}>
                    <Thumbnail onPress={()=> this.playYoutTubeVidz(this.state.youtubeIds[0])} imageWidth={width-20} imageHeight={200}  url={this.state.youtubeIds[0]} />
                    </View>
                 :<Text></Text>
               } 
   
                <Layout style={{flexDirection:'row'}}>
                {
                   this.state.youtubeIds.length > 1?
                   <View style={styles.youtube}>
                    <Thumbnail onPress={()=> this.playYoutTubeVidz(this.state.youtubeIds[1])}  imageWidth={(width-20)/2}  imageHeight={160}   url={this.state.youtubeIds[1]} />
                    </View>
                 :<Text></Text>
               }

 {
                   this.state.youtubeIds.length > 2 ?
                   <View style={styles.youtube}>
                    <Thumbnail  onPress={()=> this.playYoutTubeVidz(this.state.youtubeIds[2])} imageWidth={(width-20)/2}  imageHeight={160}    url={this.state.youtubeIds[2]} />
                    </View>
                 :<Text></Text>
               }
                </Layout>
            
               </View>

                 
               </View>
             </ScrollView>     
          </Container>   

        )
    }
}        

const styles = StyleSheet.create({
    viewContainer:{
         marginLeft:10,
         marginRight:10
    },
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
        backgroundColor:Colors.white,
        marginTop:20,
        marginLeft:10,
        marginRight:10
    },
    
  picContainer:{
    alignContent:'center',
    marginTop:-60,
  },
  topContainer:{
    height:150,
    backgroundColor:Colors.primary,  
},
imgStyle:{
    width:120,
    height:120,
    borderRadius:100
  },
profilePic:{
 height:120,
 width:120,
//  backgroundColor:'#e9e9e9',
 borderRadius:100,
 alignSelf:'center',
 borderColor:Colors.borderColor,
 borderWidth:2,
 justifyContent:'center',
 alignContent:'center',
 alignItems:'center'
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
        width:(width-10)/2,
        height:200,
        marginBottom:5,
    },   
   container:{
       backgroundColor:Colors.containers
   },
  
   bottomContainer:{    
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center',
       margin:20
   },
   shadow:{
    borderRadius:5,
    paddingTop: 5,
    paddingBottom: 5,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.8,
    elevation: 6,
    shadowRadius: 15 ,
    shadowOffset : { width: 1, height: 8},
   }
})