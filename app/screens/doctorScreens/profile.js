import React,{Component} from 'react'
import {Text,H1,Title,Form,Icon,Button,Spinner,Textarea,Input} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet,View,Image,TouchableHighlight,Modal,Alert,ScrollView} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import Geolocation from 'react-native-geolocation-service';
import { GEOCODING_API_KEY,GOOGLE_GEOLOCATION_URL} from 'react-native-dotenv'
import { Colors, Typography } from '../../styles';
const firestore = firebase.firestore()

const imageStore = firebase.storage();
const storage = AsyncStorage;
    
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
           gettingLocation:false,
           location:''
 
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
        
        var imageRef = imageStore.ref('profilePictures/'+this.state.data.key);
        var userRef = firestore.collection('doctors').doc(this.state.data.hospitalKey).
        collection('credentials').doc(this.state.data.key);
  
        imageRef.putFile(path).then((val)=>{
            imageRef.getDownloadURL().then((downloadUrl)=>{
                  this.setState({showModal:false,photo:downloadUrl},()=>{
                      //set image in database and local storage
                      userRef.update({photo:downloadUrl}).then(()=>{
                          let userData = this.state.data;
                          userData['photo'] = downloadUrl;
                          let wrap = JSON.stringify(userData);
                          storage.setItem('user',wrap);
                      })
                  })     
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

    //validate and update doctor other credentials before submitting changes
    updateProfileInfo(){
      let links = [];
      if(!this.state.firstName.trim() || !this.state.lastName.trim() || !this.state.bio.trim()){
        return toast('Please fill all fields')
      }
      this.setState({editing:!this.state.editing});
      if(this.state.link1.trim()){
        links.push(this.state.link1)
      }
      if(this.state.link2.trim()){
        links.push(this.state.link2)
      }
      if(this.state.link3.trim()){
        links.push(this.state.link3)
      }   
      
      var $ref = firestore.collection('doctors').doc(this.state.data.hospitalKey).
      collection('credentials').doc(this.state.data.key);

         
         $ref.update({
          firstName:this.state.firstName,
          lastName:this.state.lastName,
          bio:this.state.bio,
          location:this.state.city + this.state.state,
          youtube:links
        })
      
      }


    //toggles editing mode.
    toggleEditing(){
      if(this.state.editing){
        return  this.updateProfileInfo()
      }
      this.setState({editing:!this.state.editing});
      
    }


    //get human readable locations from longitude and latitude from gcm gecoding api
    googleReverseGeo(){
      fetch(`${GOOGLE_GEOLOCATION_URL} ${this.state.latitude},${this.state.longitude}&key=${GEOCODING_API_KEY}`).then((response)=> response.json()).then((val)=>{
        if(val.results.length < 1){
          this.setState({gettingLocation:false})
          return false;
        };
          let location = val.results[0].address_components;
          let state,city;
          location.forEach((value)=>{
              if(value.types[0] == 'locality'){
                 city = value.long_name + ', '
              }
              if(value.types[0] == 'administrative_area_level_1'){
                  state = value.long_name
               }
          })
          
      this.setState({gettingLocation:false,state:state,city:city})
      }).catch((err)=>{
          this.setState({gettingLocation:false})
      })   
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
   

    componentDidMount(){

            storage.getItem('user').then((val)=>{
                let data = JSON.parse(val);
                if(data){
                    let donationRef = firestore.collection('donation').doc(data.key);

                    donationRef.onSnapshot((snapshot)=>{
                        if(!snapshot.data())return false;
                        let value = snapshot.data().totalDonations
                        if(value){
                           this.setState({donation:value,showLoader:false})
                        }    
                    })

                   
                }
                this.setState({data:data,photo:data.photo},()=>{
                  var $ref = firestore.collection('doctors').doc(this.state.data.hospitalKey).
                  collection('credentials').doc(this.state.data.key);

                  $ref.onSnapshot((onSnapshot)=>{
                    if(!onSnapshot.exists)return false;

                    let data;
                    let documentID;
                    data =   onSnapshot.data();
                    let value = onSnapshot.data().amount?onSnapshot.data().amount:0

                    documentID = onSnapshot.id
                    let checkUrls = data.youtube?data.youtube:[];
                    let link1 = checkUrls.length > 0 ?data.youtube[0]:'';
                    let link2 = checkUrls.length > 1 ?data.youtube[1]:'';
                    let link3 = checkUrls.length > 2 ?data.youtube[2]:'';


                    this.setState({
                      firstName:data.firstName,
                      lastName:data.lastName,
                      location:data.location,
                      documentID:documentID,
                      photo:data.photo?data.photo:'',
                      bio:data.bio?data.bio:'',
                      link1:link1,
                      link2:link2,  
                      link3:link3,
                      showLoader:false,
                      balance:value
                    })   
                 })
                  
                });
            })
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
    

    //tenary operator is used for toggling between edit mode 
    render(){
            
        return(         
          <ScrollView style={styles.container}>
             {this.loader()}
             <Toolbar toggleDrawer={()=>this.toggleDrawer()} menu bgColor={Colors.primary} />     
              <View style={styles.topContainer}>

              </View>
              <View style={styles.profilePicMainContainer}>
                 <View style={styles.profilePic} >
                  <Image style={styles.img} source={{uri:this.state.photo}} >
                     
                </Image>    
                {
                    this.state.editing?
                    <TouchableHighlight style={styles.cameraStyle} onPress={()=>this.pickProfilePicture()}>
                      <Icon name='camera' />

                   </TouchableHighlight>  :
                   <View></View>
                  }
                 </View>
                 <View style={styles.docBalance} onPress={()=>this.pickProfilePicture()}>
                       <Button iconLeft onPress={()=>this.toggleEditing()} style={{backgroundColor:'white'}} transparent  >
                           {/* <Icon  style={{fontSize:Typography.buttonFontSize,color:Colors.iconColor}} name='logo-usd'/> */}
                          <Text note uppercase={false}>${this.state.balance || this.state.balance?this.state.balance + '.00':0+'.00'}</Text>
                       </Button>
                       
                    </View>
                 <View style={styles.toggle} onPress={()=>this.pickProfilePicture()}>
                       <Button transparent onPress={()=>this.toggleEditing()} style={{borderColor:'lightgray',backgroundColor:'white'}} bordered small iconLeft>
                          {!this.state.editing?
                          <Text note uppercase={false}>Edit</Text>
                          :
                          <Text note uppercase={false}>Save</Text>
                        }
                       </Button>
                       
                    </View> 
         
              </View>

               {
                 this.state.editing?
                 <View>
                 <Form style={styles.form}>
                   <View style={styles.inputContainer}>
                     <Input value={this.state.firstName} placeholderTextColor='#ccc' style={styles.input} onChangeText={(text)=>this.setState({firstName:text})} placeholder="First Name" />
                     <Input value={this.state.lastName} placeholderTextColor='#ccc' style={styles.input} onChangeText={(text)=>this.setState({lastName:text})} placeholder="Last Name" />
                   </View>

                   
                   <Textarea value={this.state.bio}  onChangeText={(text)=> this.setState({bio:text})} rowSpan={4} style={styles.textArea} bordered placeholder='biography'/>
                   <View style={styles.locationEditContainer}>
                             <Text>
                             <Text style={styles.greenDot}></Text>
                             {this.state.city + ' ' + this.state.state}</Text>
                         </View>
                   <Button onPress={()=>this.getLocation()} block iconLeft light  style={styles.btnLocation}>
                              {
                                  this.state.gettingLocation?
                                       <Spinner color={Colors.forestgreen}/> :
                                     <Icon style={styles.iconColor} name='pin'/>

                              }


                             <Text style={styles.textStyle}>Set Location</Text>
                         </Button> 
                   <H1 style={styles.youtubeHeader}>Youtube link</H1>
                    <Text note style={styles.youtubeHeaderNote}>copy and past youtube video links from youtube</Text>
                     <Textarea value={this.state.link1} onChangeText={(text)=> this.setState({link1:text},()=>{

                          })} rowSpan={2} style={styles.youtubeHeaderNote} bordered placeholder='Link 1'/>
                     <Textarea value={this.state.link2} onChangeText={(text)=> this.setState({link2:text})} rowSpan={2} style={styles.youtubeHeaderNote} bordered placeholder='Link 2'/>
                     <Textarea value={this.state.link3} onChangeText={(text)=> this.setState({link3:text})} rowSpan={2} style={styles.youtubeHeaderNote} bordered placeholder='Link 3'/>
                  </Form>    
                  

                

                <Button onPress={()=>this.setState({editing:false})} vertical dark block style={{marginTop:10}} transparent>
                  <Icon name='ios-close' />
                  <Text style={styles.textStyle}>cancel</Text>
                </Button>
             </View>
                 :
                 <View style={styles.subContainer}>
                
                    <H1 style={styles.headerText}>
                    {this.state.firstName + ' ' + this.state.lastName}   
                    </H1> 
                    <Text style={styles.hospitalTextStyle}>
                        {this.state.data.hospital}   
                    </Text>   

                   
                    <View style={styles.locationContainer}>
                             <Text>
                             <Text style={styles.locationText}></Text>
                             {this.state.location}</Text>
                         </View>
                 <View style={styles.bottomContainer}>
                 
                        <Button style={styles.btn} iconLeft  block rounded>
                            <Icon style={styles.iconColor}  name='ios-add' />
                            <Text style={styles.textColor}>2000</Text>
                       </Button> 
                       <Button style={styles.btn} iconRight   block rounded>
                            <Text style={styles.textColor}>Payment</Text>
                           
                       </Button>
   
                 </View>   
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
    alignItems:'center',
    margin:10,
    flex:1,
    alignContent:'center'
  },
  hospitalTextStyle:{
    fontSize:Typography.headerFontSize,
    textAlign:'center',
    color:Colors.baseText
  },
  headerText:{
    fontWeight:'100',
    marginBottom:10,
    fontSize:Typography.headerFontSize,
    marginLeft:5,
    textAlign:'center'
  },
  subContainer:{
     flex:1,
     backgroundColor:Colors.containers
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
    width:120,
    height:120,
    borderRadius:100
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
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center',
       margin:20
   } ,  
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
    }
})