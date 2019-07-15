import React,{Component} from 'react'
import {Container,Text,H1,Input,Form,Icon,Button,Spinner,Textarea} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet,View,TouchableHighlight,PermissionsAndroid,Modal,Image,ScrollView} from 'react-native';
import {toast} from '../../components/toast'
import Toolbar from '../../components/Toolbar/Toolbar';
import ImagePicker from 'react-native-image-crop-picker';
import Geolocation from 'react-native-geolocation-service';
import { GEOCODING_API_KEY,GOOGLE_GEOLOCATION_URL} from 'react-native-dotenv'
import {Loading} from '../../components/Loader/loader'
import { Colors, Typography } from '../../styles';
   
const firestore = firebase.firestore();
const imageStore = firebase.storage()

const storage = AsyncStorage;

export default class PatientProfile extends Component {
    constructor(props){
        super(props);

    }
      
    state = {   
           data :{},
           visible:false    ,
           showLoader:false,
           balance:'',
           showModal:false,
           photo:'',
           editing:false,
           firstName:'',
           lastName:'',
           occupation:'',
           personalInfo:{},
           longitude:'',
           latitude:'',
           city:'',
           state:'',
           gettingLocation:false,
           location:''
 
    }       


    //shows progress using Modal
    loader(){
        return(
            <Modal 
                transparent 
                visible={this.state.showModal}
            >
             <Loading show={true}/>

            </Modal>
        )
    }   



    //uploads/update  profile picture
    In(path){
      const user = firebase.auth().currentUser;
      var imageRef = imageStore.ref('profilePictures/'+user.uid);
    
      imageRef.putFile(path).then((val)=>{
          imageRef.getDownloadURL().then((downloadUrl)=>{
            user.updateProfile({
                displayName:'Default Name',
                photoURL:downloadUrl 
            }).then((val)=>{
                this.setState({showModal:false,photo:path})
            }).catch((val)=>{      
                this.setState({showModal:false})
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

    //users google gecoding api to convert longitude and latitude to human readable format
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
          console.log(err.results)
          this.setState({gettingLocation:false})
      })   
  }


  //use geolocation libary to get user location
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


    //updating profile info when editing
    updateProfileInfo(){
      const user = firebase.auth().currentUser;
      if(!this.state.firstName.trim() || !this.state.lastName.trim() || !this.state.occupation.trim()){
        return toast('Please fill all fields')
      }
      this.setState({editing:!this.state.editing});
      if(user){
        firebase.firestore().collection('users').doc(user.uid).collection('personalInfo').doc('info').set({
          firstName:this.state.firstName,
          lastName:this.state.lastName,
          occupation:this.state.occupation,
          location: this.state.city  + this.state.state
        })
      }
      }
    


    //image picker for picking image during editing of profile
    pickProfilePicture(){
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
          }).then(image => {
            this.setState({showModal:true},()=>{
                this.In(image.path)
            })
          }).catch(err=>{
            
            toast('Upload cancelled')

          })
    }

    componentDidMount(){
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((val)=>{
            }).catch((err)=>{

            })
            let user = firebase.auth().currentUser;
            let picture = '';
            if(user){
              picture = user.photoURL;
            }      
            storage.getItem('user').then((val)=>{
                let data = JSON.parse(val);
                this.setState({data:data,photo:picture},()=>{

                        // Get user information from the below references in firebase
                        let $ref = firestore.collection('users').doc(firebase.auth().currentUser.uid).collection('personalInfo').doc('info');

                        $ref.onSnapshot((onSnapshot)=>{
                           if(!onSnapshot.exists)return false;

                           let data;
                           let documentID;
                           data =   onSnapshot.data();
                           documentID = onSnapshot.id
                           this.setState({
                             firstName:data.firstName,
                             lastName:data.lastName,
                             location:data.location,
                             occupation:data.occupation,   
                             documentID:documentID,
                             balance:!data.amount?0:data.amount
                           })   
                        })
                });
            })
           
    }      

    //use to toggle editing on or off for updating profile
    toggleEditing(){
      if(this.state.editing){
        return  this.updateProfileInfo()
      }
      this.setState({editing:!this.state.editing});
      
    }

    



   
  

   

    
      //toggles the sidebar
      toggleDrawer(){
        this.props.navigation.toggleDrawer();
      }
      
    //NOTE tenary operator is used in this render methode to toggle edit features on/off during editing and when editing is canceslled or finished
    render(){
            
        return(       
          <ScrollView>
          <Container style={styles.container}> 
              {this.loader()}
              <Toolbar toggleDrawer={()=>this.toggleDrawer()} menu bgColor={Colors.primary} /> 
              <View style={styles.topContainer}>
               </View>
               <View style={styles.picContainer}>
                
                 
                
                  <View style={styles.profilePic} >
                   <Image style={styles.imgStyle} source={{uri:this.state.photo}} >
                      
                 </Image>
                 {
                    this.state.editing?
                    <TouchableHighlight style={styles.cameraIcon} onPress={()=>this.pickProfilePicture()}>
                      <Icon name='camera' />

                   </TouchableHighlight>  :
                   <View></View>
                  }
                
                    
                  </View>
                
                
              
                  <View style={styles.toggleBtn} onPress={()=>this.pickProfilePicture()}>
                       <Button onPress={()=>this.toggleEditing()} style={styles.btnBorder} bordered small iconLeft>
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
                   <Form style={styles.formContainer}>
                     <View style={styles.rowInputStyle}>

                       <Input value={this.state.firstName} placeholderTextColor='#ccc' style={styles.inputStyle} onChangeText={(text)=>this.setState({firstName:text})} placeholder="First Name" />
                       <Input value={this.state.lastName} placeholderTextColor='#ccc' style={styles.inputStyle} onChangeText={(text)=>this.setState({lastName:text})} placeholder="Last Name" />
                     </View>

                     <Textarea value={this.state.occupation} onChangeText={(text)=> this.setState({occupation:text})} rowSpan={2} style={styles.textAreaStyle} bordered placeholder='Occupation'/>
                     <View style={styles.editLocationStyle}>
                             {this.state.city && this.state.state ? 
                             <View style={styles.greenLocationDot}></View>:<Text></Text>}
                             <Text style={styles.alignCity}>{this.state.state + ' '} {this.state.city}</Text>
                     </View>
                     <Button onPress={()=>this.getLocation()} block iconLeft light  style={styles.setLocationBtn}>
                              {
                                  this.state.gettingLocation?
                                       <Spinner color={Colors.forestgreen}/> :
                                     <Icon style={styles.colors} name='pin'/>

                              }


                             <Text style={styles.colors}>Set Location</Text>
                         </Button>

                    </Form>    
                    <H1 style={styles.locationName}>
                      {this.state.data.name}   
                  </H1> 

                  <Button onPress={()=>this.setState({editing:false})} vertical dark block style={styles.btnTopSpace} transparent>
                    <Icon name='ios-close' />
                    <Text>cancel</Text>
                  </Button>
               </View>
               :
               <View style={styles.subContainer}>
             
               <H1 style={styles.userName}>
                      {this.state.firstName + ' ' + this.state.lastName}   
                  </H1>  
                  <Text note style={styles.occupation}>
                      {this.state.occupation}   
                  </Text> 
                  <View style={styles.mainLocation}>
                             <Text>
                             <Text style={styles.greenDot}></Text>
                             {this.state.location}</Text>
                         </View>
        
               <View style={styles.bottomContainer}>
                     <Button style={styles.btn} iconLeft  onPress={()=>this.props.navigation.navigate('GetCoins')} block rounded>
                          <Icon style={styles.colors}  name='ios-add' />
                          <Text style={styles.textColor}>{this.state.balance || this.state.balance?this.state.balance + '.00':0+'.00'}</Text>
                     </Button> 
                     <Button style={styles.btn} iconRight   block rounded>
                          <Text style={styles.textColor}>Payment</Text>
     
                     </Button>   
               </View>
               </View>
             }
          </Container>
          </ScrollView>   

        )
    }   
}        

const styles = StyleSheet.create({
  greenDot:{
    width:10,
    height:10,
    borderRadius:100,
    backgroundColor:Colors.forestgreen,
    marginRight:5
  },
  mainLocation:{
    alignItems:'center',
    margin:10,
    flex:1,
    alignContent:'center'
  },
  occupation:{
    marginBottom:10,
    fontSize:Typography.baseFontSize,
    textAlign:'center',
    color:Colors.baseText
  },
  userName:{
    fontWeight:'500',
    marginBottom:10,
    fontSize:Typography.largeHeaderFontSize,
    textAlign:'center',
  },
  subContainer:{
    flex:1,
    backgroundColor:Colors.containers
  },
  btnTopSpace:{marginTop:10},
  locationName:{
    fontWeight:'100',
    marginBottom:10,
    fontSize:Typography.baseFontSize,
    marginLeft:5,
  },
  setLocationBtn:{
    borderRadius:10,
    backgroundColor:Colors.containers
  },
  colors:{color:Colors.baseText},
  alignCity:{textAlign:'center'},
  greenLocationDot:{
    width:10,
    height:10,
    borderRadius:100,
    backgroundColor:Colors.forestgreen,
    marginRight:5,
    alignSelf:'center'},
  editLocationStyle:{
    flexDirection:'row',
    alignItems:'center',
    margin:10,
    flex:1,
    alignContent:'center'},
  textAreaStyle:{
    margin:5
  },
  inputStyle:{
    color:Colors.baseText,
    borderColor:Colors.grayCombination,
    borderWidth:1,
    margin:5
  },
  rowInputStyle:{
    flexDirection:'row',
    justifyContent:'center',
    alignContent:'center'
  },
  formContainer:{
    marginRight:10,
    marginBottom:25
  },
  btnBorder:{
    borderColor:Colors.grayCombination
  },
  toggleBtn:{
    position:'absolute',
    top:80,
    right:10,
    marginRight:10,
  },
  cameraIcon:{
    position:'absolute',
    bottom:0,
    right:10,
    backgroundColor:'white',
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center',
    width:40,
    height:40,
    borderRadius:100
  },
  imgStyle:{
    width:120,
    height:120,
    borderRadius:100
  },
  picContainer:{
    alignContent:'center',
    marginTop:-60,
  },
  textColor:{
      fontWeight:'bold',
      color:'#000'
  },
   btn:{
    backgroundColor:Colors.overLay,
    marginBottom:10
   },
   container:{
       flex:1,
       backgroundColor:Colors.containers
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
    }
})