import React,{Component} from 'react'
import {H1,Title,Form,Icon,Spinner,Textarea} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet,View,Image,TouchableHighlight,Modal,Alert,ScrollView,Dimensions} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import Geolocation from 'react-native-geolocation-service';
import { Text, Layout ,Input,Button} from 'react-native-ui-kitten';
import { Colors, Typography } from '../../styles';
import Feather from '../../components/icons/feather'
import { Thumbnail } from 'react-native-thumbnail-video';
import { YouTubeStandaloneAndroid } from 'react-native-youtube';
import {YOUTUBE_DEVELOPER_API_KEY} from 'react-native-dotenv'
import References from "../../Utils/refs"
import axios from 'axios'
import { API_PREFIX} from 'react-native-dotenv'




const firestore = firebase.firestore()

const imageStore = firebase.storage();
const storage = AsyncStorage;
const {width} = Dimensions.get('window');
   
export default class DocProfile extends Component {
    constructor(props){
        super(props);

    }
    
    state = {        
           data :{},
           visible:false   ,
           balance:0,
           donation:0,
           showModal:false,
           editing:false,
           firstName:'',
           lastName:'',
           occupation:'',
           link1:'',
           link2:'',
           link3:'',
           bio:'',
           longitude:'',
           latitude:'',
           city:'',
           state:'',
           avatar:'',
           gettingLocation:false,
           location:'',
           coins:0,
           hospitalName:'',
           youtube:[],

           updateFirstName:'',
           updatelastName:'',
           updateOccupation:'',
           updateLocation:'',
           updateAvatar:'',
           updateBio:'',
           UpdateLink1:'',
           UpdateLink2:'',
           UpdateLink3: '',

           hospitalId:'',
           updateProfile:{

          }
 
    }   


    updateAvatar(avatar){
      let profileInfo = this.state.updateProfile;
      profileInfo['avatar']  = avatar;
      this.setState({updateProfile:profileInfo,showModal:false,updateAvatar:avatar});
    }
    
    updateFirstName(firstName){
      let profileInfo = this.state.updateProfile;
      profileInfo['firstName']  = firstName;
      this.setState({updateProfile:profileInfo,updateFirstName:firstName})
    }

updatelastName(lastName){
  let profileInfo = this.state.updateProfile;
  profileInfo['lastName']  = lastName;
  this.setState({updateProfile:profileInfo,updatelastName:lastName})
 }

 updateLocation(location){
  let profileInfo = this.state.updateProfile;
  profileInfo['location']  = location;
  this.setState({updateProfile:profileInfo,updateLocation:location})
 }

 updateOccupation(occupation){
  let profileInfo = this.state.updateProfile;
  profileInfo['occupation']  = occupation;
  this.setState({updateProfile:profileInfo,updateOccupation:occupation})
}

updateBio(bio){
  let profileInfo = this.state.updateProfile;
  profileInfo['bio']  = bio;
  this.setState({updateProfile:profileInfo,updateBio:bio})
}



updateLink(index,link){
  let urls = this.state.youtube;
  let profileInfoUpdate = urls;

  if(profileInfoUpdate.length - 1 >= index){
    profileInfoUpdate[index] = link;
  }else{
    profileInfoUpdate.push(link);
  }

  let updateProfile = this.state.updateProfile;
  updateProfile['youtube'] = profileInfoUpdate;
  

  this.setState({updateProfile:updateProfile})
}


    //show loader indicator or spinner
    loader(){
        return(
            <Modal 
                transparent 
                visible={this.state.showModal}
            >
              <View style={{flex:1,justifyContent:'center',alignContent:'center',alignItems:'center'}}> 
                  <Spinner color='foresgreen'/>
              </View>

            </Modal>
        )
    }

    
    //doc update profile after all parameters have been edited
    updateProfile(path){
        
      const user = firebase.auth().currentUser;
      var imageRef = imageStore.ref('profilePictures/'+user.uid);
    
      imageRef.putFile(path).then((val)=>{
          imageRef.getDownloadURL().then((downloadUrl)=>{
            this.updateAvatar(downloadUrl);  
          }).catch((err)=>{
            this.setState({showModal:false})
              toast('unable to upload url')
          })
      }).catch((err)=>{
        this.setState({showModal:false})
          toast('unable to upload url')
      })
       
      }
    
    

    //use image picker to pick profile picture
    pickProfilePicture(){
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
          }).then(image => {
            this.setState({showModal:true},()=>{
                this.updateProfile(image.path)//upload image and update the picture location
            })
          }).catch(err=>{
            
            toast('Upload cancelled')

          })
    }


     //updating profile info when editing
  async  updateProfileInfo(){

    if(Object.keys(this.state.updateProfile).length == 0) return this.setState({editing:!this.state.editing});
 
    this.setState({showModal:true});

     try{
          const uid = firebase.auth().currentUser.uid;

          const updateProfile = await axios.post(`${API_PREFIX}Users/updateProfileDoctor`,{uid:uid,payload:this.state.updateProfile})
        
          const {status,message} = updateProfile.data;
    
          if(status == "Success"){
              this.setState({showModal:false,updateProfile:{},editing:!this.state.editing});
          }else{
              this.setState({showModal:false})
              toast("unable to update profile");
          }
     }catch(e){
       this.setState({showModal:false})
       toast(e.message)
     }
    
    }

  
    //toggles editing mode.
    toggleEditing(){
      if(this.state.editing){
        return  this.updateProfileInfo()
      }
      this.setState({editing:!this.state.editing});
      
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



    //get human readable locations from longitude and latitude from gcm gecoding api
 //users google gecoding api to convert longitude and latitude to human readable format
 async  googleReverseGeo(){
   
  this.setState({gettingLocation:true})
  
  try{

       const location = await axios.post(API_PREFIX+"services/location",{longitude:this.state.longitude,latitude:this.state.latitude});
      
       const {message,status,data} = location.data;

       this.setState({gettingLocation:false});
       if(status == "Success"){

          this.updateLocation(data)
       }else{
          toast(message)
       }
   }catch(e){

      this.setState({gettingLocation:false});
      console.log(e.message);
      toast(e.message)
   }
    
  
    
}


  // get current longitude and latitude using geolocation
  getLocation(){  
      if(this.state.gettingLocation){
         return toast('Getting location...')
      }
      this.setState({gettingLocation:true},()=>{
          Geolocation.getCurrentPosition(
              (position) => {
                  this.setState({
                      latitude:position.coords.latitude,
                      longitude:position.coords.longitude
                  },()=>{
                      this.googleReverseGeo()
                  })
              },
              (error) => {
                  // See error code charts below.
                  console.log(error.code, error.message);
                  this.setState({gettingLocation:false})
                  toast('Location request timeout please try turning off and switch on your location gps')
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
      })
     
  }
   

    async  componentDidMount(){                
                  
                  let user = firebase.auth().currentUser.uid;
               
                  var $ref = firestore.collection("Doctors").doc(user);
          
                  $ref.onSnapshot((onSnapshot)=>{

                    let data;

                    let documentID;

                    data =   onSnapshot.data();

                    let value = onSnapshot.data().coins?onSnapshot.data().coins:0

                    documentID = onSnapshot.id
                    let checkUrls = data.youtube?data.youtube:[];
                    let link1 = checkUrls.length > 0 ?data.youtube[0]:'';
                    let link2 = checkUrls.length > 1 ?data.youtube[1]:'';
                    let link3 = checkUrls.length > 2 ?data.youtube[2]:'';

                   // var hospitalName = await firestore.collection('Category').doc(data.hospitalId).get();

                 //  var nameHospital = hospitalName.data().name;

                    this.setState({
                      youtube:checkUrls,
                      firstName:data.firstName,
                      lastName:data.lastName,
                      location:data.location,
                      documentID:documentID,
                      avatar:data.avatar,
                      bio:data.bio?data.bio:'',
                      link1:link1,
                      link2:link2,  
                      link3:link3,
                      showLoader:false,
                      coins:value,
                      coins: value,
                      occupation:data.occupation,
                      updateFirstName:data.firstName,
                      updatelastName:data.lastName,
                      updateOccupation:data.occupation,
                      updateLocation:data.location,
                      updateAvatar:data.avatar,
                      updateBio:data.bio,
                      UpdateLink1:link1,
                      UpdateLink2:link2,
                      UpdateLink3: link3,
                      updateProfile:{},
                      hospitalId:data.hospitalId
                    })   
                 })
                  
    }    


      //This methode get the urls of youtube the user can either paste urls from phone or from browser but what we are interested is the id of the video and the youtube libary will play the video provided it is a youtube video and the id is correct. the two url format has / an = before the id which is a good target to get the id for either
      getYoutubeVidzId(url){
        let checkUrl = url.indexOf('=');
        let lastSlashPos = checkUrl == -1?url.lastIndexOf('/'):url.lastIndexOf('=');
        let videoId = url.substring(lastSlashPos+1);

        return videoId
     }



  confirmLogOut(){
    Alert.alert(
        '',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            onPress: () => '',
            style: 'cancel',
          },
          {text: 'OK', onPress: () => this.logOut()},
        ],
        {cancelable: false},
      );
  }
    
  

   
   

    toggleDrawer(){
      this.props.navigation.toggleDrawer();
    }

   async getHospitalName(){

        if(!this.state.hospitalName){

          var hospitalName = await firestore.collection('Category').doc(this.state.hospitalId).get();

          var nameHospital = hospitalName.data().name;


          this.setState({ hospitalName:nameHospital  })

        }
    }
    

    //tenary operator is used for toggling between edit mode 
    render(){
        if(this.state.hospitalId){
           this.getHospitalName();
        }
        let link1 = this.state.link1?this.getYoutubeVidzId(this.state.link1):'';
        let link2 = this.state.link2?this.getYoutubeVidzId(this.state.link2):'';
        let link3 = this.state.link3?this.getYoutubeVidzId(this.state.link3):'';

        return(         
          <ScrollView style={styles.container}>
             {this.loader()}
             <Toolbar toggleDrawer={()=>this.toggleDrawer()} menu bgColor={Colors.primary} />     
              <View style={styles.topContainer}>

              </View>
              <View style={styles.profilePicMainContainer}>
                 <View style={styles.profilePic} >
                 {
                    this.state.editing?
                     <Image style={styles.imgStyle} source={this.state.updateAvatar?{uri:this.state.updateAvatar}: require('../../../assets/default.png')}/>
                            :
                     <Image style={styles.imgStyle} source={this.state.avatar?{uri:this.state.avatar}: require('../../../assets/default.png')}/>

                  }
                {
                    this.state.editing?
                    <TouchableHighlight style={styles.cameraStyle} onPress={()=>this.pickProfilePicture()}>
                      <Icon name='camera' />

                   </TouchableHighlight>  :
                   <View></View>
                  }
                 </View>
              
              
                    <View style={styles.toggle}>
                      {!this.state.editing?
                        <Button 
                        appearance="ghost"
                        size="large"
                        icon={()=> <Feather style={{fontSize:20,color:'#000'}} name="edit" />} 
                         onPress={()=>this.toggleEditing()} >
                      </Button>:<Text></Text>
                    }
                       
                    </View> 
         
              </View>

               {
                 this.state.editing?
                 <View>
                 <Form style={styles.form}>
                   <View style={styles.inputContainer}>
                     <Input 
                     underlineColorAndroid={Colors.lightGray}
                     label="FIRST NAME"
                     value={this.state.updateFirstName} style={{width:"47%",marginRight:4,backgroundColor:'#fff',borderColor:"#fff"}} placeholderTextColor='#ccc' onChangeText={(text)=>this.updateFirstName(text)} placeholder="First Name" />
                     <Input 
                     underlineColorAndroid={Colors.lightGray}
                     label="LAST NAME"
                     value={this.state.updatelastName} style={{width:"50%",backgroundColor:'#fff',borderColor:"#fff"}} placeholderTextColor='#ccc'  onChangeText={(text)=>this.updatelastName(text)} placeholder="Last Name" />
                   </View>

                   <Input 
                     underlineColorAndroid={Colors.lightGray}
                     label="Occupation"
                     value={this.state.updateOccupation} style={{width:"50%",backgroundColor:'#fff',borderColor:"#fff"}} placeholderTextColor='#ccc'  onChangeText={(text)=>this.updateOccupation(text)} placeholder="occupation" />


                   
                   <Textarea value={this.state.updateBio}  onChangeText={(text)=> this.updateBio(text)} rowSpan={4} style={styles.textArea} bordered placeholder='biography'/>


                  <View style={styles.editLocationStyle}>
                             { this.state.updateLocation ? 
                             <View style={styles.greenLocationDot}></View>:<Text></Text>}
                             <Text style={styles.alignCity}>{this.state.updateLocation}</Text>
                     </View>
                  <Button  icon={()=> this.state.gettingLocation?  <Spinner color={Colors.white}/> :<Icon style={{color:Colors.white,fontSize:16}} name='pin'/>  
                    } onPress={()=>this.getLocation()}>                       
                            Set Location
                  </Button>
                   


                          
                   <H1 style={styles.youtubeHeader}>Youtube link</H1>
                    <Text note style={styles.youtubeHeaderNote}>copy and past youtube video links from youtube</Text>
                     <Textarea value={this.state.UpdateLink1} 
                     onChangeText={(text)=> this.setState({link1:text},()=>{this.updateLink(0,text) })} rowSpan={2} style={styles.youtubeHeaderNote} bordered placeholder='Link 1'/>
                    <Textarea value={this.state.UpdateLink2} onChangeText={(text)=> this.setState({link2:text},()=>this.updateLink(1,text))} rowSpan={2} style={styles.youtubeHeaderNote} bordered placeholder='Link 2'/>
                     <Textarea value={this.state.UpdateLink3} onChangeText={(text)=> this.setState({link3:text},()=>{this.updateLink(2,text)})} rowSpan={2} style={styles.youtubeHeaderNote} bordered placeholder='Link 3'/>
                  </Form>    
                  

                  <View style={[styles.bottomContainer,{width:"100%",marginTop:20}]}>
                  <Button 
                     style={{width:"48%",marginRight:5,backgroundColor:Colors.whitesmoke}}
                     appearance="ghost" onPress={()=>this.setState({editing:false})}>
                     CANCEL
                    </Button>
                    <Button  
                      style={{width:"48%",marginRight:5}}
                      status="success" onPress={()=>this.updateProfileInfo()}>
                       SAVE
                  </Button>
                </View>


             </View>
                 :
                 <View style={styles.subContainer}>
                
                    <Text style={{textAlign:'center'}} category="h3">
                    {this.state.firstName + ' ' + this.state.lastName}   
                    </Text> 
                       
                        <Layout style={{width:"100%",flexDirection:'row',marginTop:10,marginBottom:10}}>
                          <Layout style={{width:"46%",marginRight:5}}>
                            <Button textStyle={{fontSize:18,fontWeight:"100",lineHeight:20}} status="success" size="small" style={{borderRadius:50,backgroundColor:Colors.primary,borderColor:Colors.primary}} >{this.state.occupation}</Button>
                          </Layout>
                          <Layout style={{width:"46%"}}>
                              <Button textStyle={{fontSize:18,fontWeight:"100",lineHeight:20}} status="success" size="small" style={{borderRadius:50,backgroundColor:Colors.primary,borderColor:Colors.primary}}>{this.state.hospitalName}  </Button>
                          </Layout>
                        </Layout>
                       
                   
                   {this.state.location?
                      <View style={styles.locationContainer}>
                      <Icon style={[styles.iconColor,{fontSize:18,marginRight:10}]} name='pin'/>
                      <Text>
                      <Text style={styles.locationText}></Text>
                      {this.state.location}</Text>
                    </View>:null}
                       

                  {
                    this.state.bio?
                    <Text><Text style={{fontWeight:"bold"}}>Bio </Text>{this.state.bio}</Text>:null
                  }


                  <View style={styles.youtubeContainer}>
           
           {
                 this.state.link1?
                 <View style={styles.youtube}>
                  <Thumbnail onPress={()=> this.playYoutTubeVidz(link1)} imageWidth={width-25} imageHeight={200}  url={this.state.link1} />
                  </View>
               :<Text></Text>
             } 
 
              <Layout style={{flexDirection:'row'}}>
              {
                 this.state.link2?
                 <View style={[styles.youtube]}>
                  <Thumbnail onPress={()=> this.playYoutTubeVidz(link2)}  imageWidth={(width-32)/2}  imageHeight={160}   url={this.state.link2} />
                  </View>
               :<Text></Text>
             }

{
                 this.state.link3?
                 <View style={[styles.youtube,{marginRight:10}]}>
                  <Thumbnail  onPress={()=> this.playYoutTubeVidz(link3)} imageWidth={(width-33)/2}  imageHeight={160}    url={this.state.link3} />
                  </View>
               :<Text></Text>
             }
              </Layout>
          
             </View>
                        <Layout style={{width:"100%",flexDirection:'row',marginBottom:10,marginTop:-20}}>
                          <Layout style={{width:"30%",marginRight:6,justifyContent:'center',backgroundColor:'#f5f5f5',borderRadius:5}}>
                            <Text style={{alignSelf:'center',color:Colors.primary,paddingVertical:10,paddingHorizontal:5}} category="h6">${this.state.coins || this.state.coins?this.state.coins + '.00':0+'.00'}</Text>
                          </Layout>
                          <Layout style={{width:"70%"}}>
                             <Button  status="success" >REDEEM</Button>
                          </Layout>
                        </Layout>

                    
               
                 </View>
               }
             
          
          </ScrollView> 

        )
    }
}           

const styles = StyleSheet.create({
  locationText:{
    width:10,
    height:10,
    borderRadius:100,
    backgroundColor:Colors.forestgreen,
    marginRight:5},
  locationContainer:{
    flex:1,
    flexDirection:"row",
    marginBottom:5
  },
  hospitalTextStyle:{
    fontSize:Typography.headerFontSize,
    color:Colors.baseText
  },
  headerText:{
    fontWeight:'100',
    marginBottom:10,
    fontSize:Typography.headerFontSize,
    marginLeft:5,
  },
  imgStyle:{
    width:120,
    height:120,
    borderRadius:100,
    backgroundColor:'white'
  },
  subContainer:{
     flex:1,
     backgroundColor:Colors.containers,
     marginLeft:15,
     marginRight:15
  },
  youtubeHeaderNote:{
    marginLeft:10
  },
  youtubeHeader:{
    fontSize:Typography.headerFontSize,
    marginLeft:10
  },
  textStyle:{
    color:Colors.baseText
  },
  iconColor:{
    color:Colors.iconColor
  },
  btnLocation:{
    borderRadius:10,
    backgroundColor:Colors.containers
  },
  greenDot:{
    width:10,
    height:10,
    borderRadius:100,
    backgroundColor:Colors.forestgreen,
    marginRight:5},
  locationEditContainer:{
    alignItems:'center',
    margin:10,
    flex:1,
    alignContent:'center'
  },
 textArea:{
   margin:5
  },
  input:{
    color:Colors.baseText,
    borderColor:Colors.borderColor,
    borderWidth:1,
    margin:5},
  inputContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignContent:'center'},
  form:{
    marginRight:10,
    marginLeft:10,
    marginBottom:25
  },
  docBalance:{
    position:'absolute',
    top:80,
    left:10,
    marginLeft:10,
  },
  btn:{
    borderColor:Colors.borderColor,
    backgroundColor:Colors.containers
  },
  toggle:{
    position:'absolute',
    top:80,
    right:10,
    marginRight:10,
  },
  cameraStyle:{
    position:'absolute',
    bottom:0,
    right:10,
    backgroundColor:Colors.containers,
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center',
    width:40,
    height:40,
    borderRadius:100
  },
  img:{
    width:150,
    height:150,
    borderRadius:100,
    marginBottom:20
  },
   profilePicMainContainer:{
     alignContent:'center',
     marginTop:-70,
    },
   container:{
       backgroundColor:Colors.containers
   },
   btn:{
    backgroundColor:Colors.overLay,
    marginBottom:10
   },
   textColor:{
    fontWeight:'bold',
    color:Colors.baseText
},
   topContainer:{
       height:105,
       justifyContent:'center',
       backgroundColor:Colors.primary,
       padding:20,
   },
   bottomContainer:{    
       flex:2,
       flexDirection:'row',
       marginBottom:10
   } ,  
   youtube:{
    width:(width-10)/2,
    height:200,
    marginBottom:5,
}, 
   profilePic:{
       height:120,
       width:120,
       backgroundColor:Colors.containers,
       borderRadius:100,
       alignSelf:'center',
       borderColor:Colors.borderColor,
       borderWidth:2,
       marginBottom:10,
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center'
    },
    youtubeContainer:{
      backgroundColor:Colors.white,
      marginTop:20,  
  },
  editLocationStyle:{
    flexDirection:'row',
    alignItems:'center',
    marginTop:10,
    alignContent:'center'},
    alignCity:{textAlign:'center'},
    greenLocationDot:{
      width:10,
      height:10,
      borderRadius:100,
      backgroundColor:Colors.forestgreen,
      marginRight:5,
      alignSelf:'center'},
})