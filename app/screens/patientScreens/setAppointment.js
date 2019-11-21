import React,{Component} from 'react'
import {H1,Icon,H3,Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {ScrollView,StyleSheet,View,DatePickerAndroid,TimePickerAndroid,Modal,Image,Dimensions,Alert} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import { YouTubeStandaloneAndroid } from 'react-native-youtube';
import {YOUTUBE_DEVELOPER_API_KEY,API_PREFIX} from 'react-native-dotenv'
import { Thumbnail } from 'react-native-thumbnail-video';
import {Loading} from '../../components/Loader/loader'
import {Colors, Typography} from '../../styles/index'
import { AppStatus } from '../../Utils/functions';
import { Text, Layout ,Button,Radio} from 'react-native-ui-kitten';
import { ButtonComponent } from 'react-native-ui-kitten/ui/button/button.component';
import References from '../../Utils/refs'
import DefaultCustoms from '../../Utils/strings'
import axios from 'axios'


const firestore = firebase.firestore();
const {width} = Dimensions.get('window');

    
export default class SetAppointMent extends Component {
    constructor(props){
        super(props);

    }
    
    state = {   
           data :this.props.navigation.state.params,
           visible:false,
           youtubeIds:this.props.navigation.state.params.youtube,
           patName:'',
           userLocation:'',
           userOccupation:'',
           hospitalName:'',
           error:'',
           doctorsIds:[]
 
    }   
    
    showLoader(){
        this.setState({visible:true})
    }

    hideLoader(){
        this.setState({visible:false})
    }
    confirmBooking(){
   
                Alert.alert(
                    '',
                    'You are setting appointment with '+ this.state.data.name + ' confirm or cancel',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {text: 'Confirm', onPress: () => {
                        let doctorInfo = this._getDoctorInfomation();

                        let doctorId = doctorInfo.uid;

                        let findIds = this.state.doctorsIds.indexOf(doctorId);

                        if(findIds >= 0){
                            this.setState({error:'Appointment already exist.'});
                        }else{
                            this.sendAppointMent();
                        }

                        
                      }},
                    ],
                    {cancelable: false},
                  );
           
    }

    _getDoctorInfomation(){
        const {name,uid,worth,avatar,bio,occupation,location,hospitalId} = this.state.data;
        return{name,uid,worth,avatar,bio,occupation,location,hospitalId};
    }

   async  _getPatientInfomation (){
        let user_id = firebase.auth().currentUser.uid;
        const userInfo = await firestore.collection("Users").doc(user_id).get();
        const {firstName,lastName,occupation,uid,location,avatar} = userInfo.data();
        let name = firstName + ' ' + lastName;

        return {name,occupation,uid,location,avatar}
   }


    //Saving appointment to firebase after collecting neccessary information from user like date and credentials that will be neccessary during call and saving of history
    async sendAppointMent(){
         
       
        
        try{

            this.showLoader();
            let doctorInfo = this._getDoctorInfomation();
            let patientInfo = await this._getPatientInfomation();
    
           
            let data = {
                patientName:patientInfo.name,
                doctorName:doctorInfo.name,
                channel:doctorInfo.uid,
                doctorPhoto:doctorInfo.avatar,
                patientPhoto:patientInfo.avatar,
                patientId:patientInfo.uid,
                doctorId:doctorInfo.uid,
                hospitalId:doctorInfo.hospitalId,
                worth:doctorInfo.worth,
                patientLocation:patientInfo.location,
                date:new Date(),
                patientOccupation:patientInfo.occupation,
                doctorLocation:doctorInfo.location,
                doctorOccupation:doctorInfo.occupation
           }

            const saveAppointment = await axios.post( API_PREFIX +"Users/addAppointment",data);

            const {message,status} = saveAppointment.data;

            if(status == 'Success'){
                toast(message);
                this.hideLoader();
                this.props.navigation.goBack();
            }else{
                toast(message);
                this.setState({error:message})
                this.hideLoader();
                console.log(message)
            }
           
            
          
        }catch(e){
     
           this.hideLoader()
           this.setState({error:e.message})
           console.log(e.message);
           toast(e.message)
        }
   

       
    }



    async componentDidMount(){
      
         var appointments = await firebase.firestore().collection('Appointments').where('patientId','==',firebase.auth().currentUser.uid).get();
         
         let doctorsIds = [];

         appointments.forEach((snapshot)=>{
              doctorsIds.push(snapshot.data().doctorId)
         })

        
         
        //get youtubs urls of doctor passed from data gotten from a specific doctor in an hospital
        // this.setState({youtubeIds:this.state.youtube}); 
          var hospitalName = await firestore.collection('Category').doc(this.state.data.hospitalId).get();

          var nameHospital = hospitalName.data().name;


          this.setState({ hospitalName:nameHospital ,doctorsIds:doctorsIds })
             
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


   
    
    render(){
        const {name,uid,worth,avatar,bio,occupation,location} = this.state.data;
        return(  
          <Container style={styles.container}>
             
             <ScrollView>
              {this.loader()} 
             
              <Toolbar canGoBack goBack={()=>this.props.navigation.goBack()} toggleDrawer={()=>this.toggleDrawer()} bgColor={Colors.primary} /> 
               <View style={styles.topContainer}>
             
               </View>
               <View style={styles.picContainer}>
                
                   
                
                  <View style={styles.profilePic} >

                   <Image style={styles.imgStyle} source={avatar?{uri:avatar}: require('../../../assets/default.png')}>
                      
                 </Image>
               
                    
                  </View>
                
                
              
                  
               </View>    
             
             
              
             
             
                 <View style={styles.viewContainer}>
                        <Text style={{marginTop:10}} category="h4">
                            {name}
                        </Text>

                        <Layout style={{width:"100%",flexDirection:'row',marginTop:10}}>
                          <Layout  style={{width:"46%",marginRight:5,backgroundColor:Colors.primary,borderRadius:50,padding:5}}>
                            <Text style={{fontSize:20,color:Colors.white,textAlign:'center',letterSpacing:1}}>{this.state.hospitalName}</Text> 
                          </Layout>
                          <Layout style={{width:"46%",backgroundColor:Colors.primary,borderRadius:50,padding:5}}>
                             <Text style={{fontSize:20,color:Colors.white,textAlign:'center',letterSpacing:1}}>{occupation}</Text>
                          </Layout>
                        </Layout>
                       
                        {bio?
                        <View>
                            <Text style={{marginTop:10}}>{bio} Lorem, ipsum dolor sit amet consectetur adipisicing elit. A, distinctio non! Tempore ad veniam harum, inventore nemo odio voluptate necessitatibus vel itaque, autem sed labore consequuntur recusandae ea tenetur nihil?</Text>
                        </View>
                    
                        :
                        <Text></Text>
                        }
                 </View>
                 <Text style={{color:'red',marginLeft:10,marginTop:5,fontWeight:'bold'}}>{this.state.error}</Text>
                 <Layout style={{width:"100%",flexDirection:'row',marginTop:10,marginLeft:10,marginRight:10}}>
                          <Layout style={{width:"30%",marginRight:5,justifyContent:'center',backgroundColor:'#f5f5f5',borderRadius:5}}>
                            <Text style={{alignSelf:'center',color:Colors.primary}} category="h6">${worth+'.00'}</Text>
                          </Layout>
                          <Layout style={{width:"66%",marginRight:10}}>
                             <Button style={[{borderColor:Colors.lightGray,borderWidth:2,marginRight:10},styles.shadow]} textStyle={{letterSpacing:2}} onPress={()=>this.confirmBooking()} status="success" >{DefaultCustoms.setAppointment}</Button>
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