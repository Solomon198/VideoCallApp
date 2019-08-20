import React,{Component} from 'react'
import {Container,H1,Form,Icon,Spinner,Textarea} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet,View,TouchableNativeFeedback,PermissionsAndroid,Modal,Image,ScrollView,TouchableHighlight} from 'react-native';
import {toast} from '../../components/toast'
import Toolbar from '../../components/Toolbar/Toolbar';
import ImagePicker from 'react-native-image-crop-picker';
import Geolocation from 'react-native-geolocation-service';
import { GEOCODING_API_KEY,GOOGLE_GEOLOCATION_URL} from 'react-native-dotenv'
import {Loading} from '../../components/Loader/loader'
import { Colors, Typography } from '../../styles';
import FontAwsome from '../../components/icons/fontawsome'
import Feather from '../../components/icons/feather'
import { Text, Layout ,Input,Button} from 'react-native-ui-kitten';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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
           location:'',
           bio:''
 
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
          
      this.setState({gettingLocation:false,state:state,city:city,location:state+" "+city},()=>{
        firebase.firestore().collection('users').doc(user.uid).collection('personalInfo').doc('info').update({
          location: state + " " + city
        })
      })
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
        firebase.firestore().collection('users').doc(user.uid).collection('personalInfo').doc('info').update({
          firstName:this.state.firstName,
          lastName:this.state.lastName,
          occupation:this.state.occupation,
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
                             balance:!data.amount?0:data.amount,
                           })   
                        })
                });
            })
           
    }      

    //use to toggle editing on or off for updating profile
    toggleEditing(){

      this.setState({editing:!this.state.editing});
      
    }

    



   
  

   

    
      //toggles the sidebar
      toggleDrawer(){
        this.props.navigation.toggleDrawer();
      }
      
    //NOTE tenary operator is used in this render methode to toggle edit features on/off during editing and when editing is canceslled or finished
    render(){
            
        return(       
          <Container style={styles.container}>
             <ScrollView >
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
                    <TouchableHighlight style={styles.cameraIcon}  onPress={()=>this.pickProfilePicture()}>
                      <Icon name='camera'/>

                   </TouchableHighlight>  :
                   <View></View>
                  }
                
                    
                  </View>
                
                
              
                  <View style={styles.toggleBtn} onPress={()=>this.pickProfilePicture()}>
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
               <View >
                   <Form style={styles.formContainer}>
                     <View style={styles.rowInputStyle}>

                       <Input 
                          
                         style={styles.input}  underlineColorAndroid={Colors.lightGray} label="FIRST NAME" style={styles.input} value={this.state.firstName} placeholderTextColor='#ccc' onChangeText={(text)=>this.setState({firstName:text})} placeholder="First Name" />
                       <Input 
                        
                         label="LAST NAME" underlineColorAndroid={Colors.lightGray}   style={styles.input} value={this.state.lastName} placeholderTextColor='#ccc'  onChangeText={(text)=>this.setState({lastName:text})} placeholder="Last Name" />
                     </View>

                     <Input 
                       underlineColorAndroid={Colors.lightGray}   value={this.state.occupation}  label="OCCUPATION" style={{backgroundColor:Colors.white,width:"100%",borderColor:Colors.white}} onChangeText={(text)=> this.setState({occupation:text})}  placeholder='Occupation'/>
                   
                     <Input label="EMAIL" style={{backgroundColor:Colors.white,width:"100%"}} disabled style={{width:"100%"}} value={this.state.data.name} placeholderTextColor='#ccc'  placeholder="EMAIL" />  

                     <View style={styles.editLocationStyle}>
                             { this.state.location ? 
                             <View style={styles.greenLocationDot}></View>:<Text></Text>}
                             <Text style={styles.alignCity}>{this.state.location}</Text>
                     </View>
                     <Button icon={()=> this.state.gettingLocation?  <Spinner color={Colors.white}/> :<Icon style={{color:Colors.white,fontSize:16}} name='pin'/>  
                    } onPress={()=>this.getLocation()}>                       
                            Set Location
                         </Button>

                         
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

                    </Form>  
                    

               </View>
               :
               <View style={styles.subContainer}>
             
               <Text category="h3" style={styles.userName}>
                      {this.state.firstName + ' ' + this.state.lastName}   
                  </Text>  
                        
                            {
                              this.state.location?
                              <View style={[styles.mainLocation,{flexDirection:'row',marginBottom:10}]}>
                                <View style={styles.greenLocationDot}></View>
                                <Text>{this.state.location}</Text>
                             </View>
                               :
                               <View></View>
                            }

                   <Text note style={styles.occupation}>
                      {this.state.occupation + " Lorem, ipsum dolor sit amet consectetur adipisicing elit. A, distinctio non! Tempore ad veniam harum, inventore nemo odio voluptate necessitatibus vel itaque, autem sed labore consequuntur recusandae ea tenetur nihil?"}   
                  </Text> 

                   <View style={styles.bottomContainer}>
                  
                  <Layout style={styles.containerAddMoney}>
                     <Text style={{color:Colors.btnIfo}} category="h4">$  {this.state.balance || this.state.balance?this.state.balance + '.00':0+'.00'}</Text>
                  </Layout>

                  <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('GetCoins')}>
                    <Layout
                      style={styles.moneyContainer}>
                        <Icon name="add" style={styles.addIcon}/>
                    </Layout >
                  </TouchableNativeFeedback>
                 
               </View>
                  
             
               </View>
             }
              </ScrollView>   
          </Container>

        )
    }   
}        

const styles = StyleSheet.create({
  input:{
     width:"48%",
     margin:2,
     backgroundColor:Colors.white,
     borderColor:Colors.white,
     paddingBottom:5


  },
  addIcon:{
    color:Colors.btnIfo,
    fontSize:50},
  containerAddMoney:{
    width:"48%",
    backgroundColor:Colors.whitesmoke,
    borderRadius:5,
    height:100,
    justifyContent:'center',
    alignContent:'center',alignItems:'center',
    marginRight:10
  }, 
    moneyContainer:{
    width:"48%",
    borderRadius:5,
    borderColor:Colors.borderColor,
    borderWidth:1,
    height:100,
    justifyContent:'center',
    alignContent:'center',alignItems:'center'
  },
  greenDot:{
    width:10,
    height:10,
    borderRadius:100,
    backgroundColor:Colors.forestgreen,
    marginRight:5
  },
  
  mainLocation:{
    marginTop:10,
  },
  occupation:{
    marginBottom:5,
    fontSize:Typography.baseFontSize,
    color:Colors.baseText
  },
  userName:{
    marginTop:10,
  },
  subContainer:{
    backgroundColor:Colors.containers,
    marginLeft:16,
    marginRight:16
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
    marginTop:10,
    alignContent:'center'},
  textAreaStyle:{
    margin:5
  },
  inputStyle:{
    color:Colors.baseText,
    borderColor:Colors.grayCombination,
    borderWidth:1,
    margin:5,
    borderColor:Colors.white
  },
  rowInputStyle:{
    flexDirection:'row',
    marginTop:10,
   
  },
  formContainer:{
    marginRight:10,
    marginBottom:25,
    marginLeft:10,
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
    color:Colors.primary,
    right:10,
    backgroundColor:Colors.white,
    width:35,
    height:35,
    borderRadius:100,
    justifyContent:"center",
    alignContent:'center',
    alignItems:'center'
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
  topContainer:{
    height:105,
    justifyContent:'center',
    backgroundColor:Colors.primary,  
    padding:20,
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
  textColor:{
      fontWeight:'bold',
      color:'#000'
  },
   btn:{
    backgroundColor:Colors.overLay,
    marginBottom:10
   },
   container:{
       backgroundColor:Colors.containers,
   },
  
   bottomContainer:{     
     flexDirection:'row',
     flex:1
  },
 
})