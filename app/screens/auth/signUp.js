import React,{Component} from 'react'
import {View,Container,Item,Form,Icon,Spinner} from 'native-base'
import {AsyncStorage,Modal,StyleSheet,TouchableNativeFeedback} from 'react-native'
import * as firebase from 'react-native-firebase';
import { toast } from '../../components/toast';
import Geolocation from 'react-native-geolocation-service';
import { GEOCODING_API_KEY,GOOGLE_GEOLOCATION_URL,API_PREFIX} from 'react-native-dotenv'
import { Loading } from '../../components/Loader/loader';
import FontAwsome from '../../components/icons/fontawsome'
import Octicons from '../../components/icons/octicons'
import { Colors } from '../../styles';
import { Text, Layout ,Input,Button} from 'react-native-ui-kitten';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import axios from 'axios'

   

const storage = AsyncStorage;

export default class SignUp extends Component {
    constructor(props){
        super(props);

    }

    state = {
        visible:false,
        email:'',
        password:'',
        firstName:'',
        lastName:'',
        location:'',
        occupation:'',
        longitude:'',
        latitude:'',
        state:'',
        city:'',
        gettingLocation:false,
        errorMessage:''
    }   

    validation(){
        if(!this.state.firstName.trim()){
           return toast('Enter first name')
        }else if(!this.state.lastName.trim()){
           return toast('Enter Last name')
        }else if(!this.state.email.trim()){
          return  toast('Enter an email address')
        } else if(!this.state.password.trim()){ 
           return toast('Enter password')
        }
        else{
            this.signUp()   
        }
    }

    
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
        this.setState({visible:false})
        storage.getItem('loca').then((val)=>{
         
        })
    }



  async   signUp(){

        try{

            
            this.setState({visible:true});

            const signUser = await axios.post(`${API_PREFIX}Users/registerUser`,{email:this.state.email,password:this.state.password,firstName:this.state.firstName,lastName:this.state.lastName})
           
            const {status,message,data} = signUser.data;

            this.setState({visible:false})

            if(status == "Success") {
               this.props.navigation.goBack();
               return toast('Verification sent to email address verify email and login');
   
            }else{
                this.setState({errorMessage:message})
                return toast(message)
            }
   
   
        }catch(e){
            this.setState({visible:false})
            toast(e.message);
            console.log(e)
        }
       
       
    }
   

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


    
    render(){
        
        return(      
          <Container style={styles.container}>
           {this.loader()}

           <Form style={styles.form}>
           <Text style={{color:Colors.primary,marginBottom:10,marginTop:10}} category="h2">Create account</Text>
           <Text style={{marginTop:10,marginHorizontal:10,color:'red'}}>{this.state.errorMessage}</Text>

                        <View style={styles.inputContainer}>
                        <View  style={styles.inputSubContainer}>
                             <Input 
                                placeholderTextColor={Colors.placeHolderColor} 
                                style={styles.inputStyle} 
                                value={this.state.firstName}
                                onChangeText={(text)=>this.setState({firstName:text})} 
                                placeholder="First name" 
                                clearButtonMode="never"
                                underlineColorAndroid={Colors.lightGray}
                                onSubmitEditing={(e)=>e.preventDefault()}
                                // icon={()=>
                                //     <FontAwsome style={[styles.textColor,{fontSize:23}]} name="user-o"/>
                                // }
                                    />
                         </View>
                        
                    
                          <View  style={styles.inputSubContainer}>
                          <Input 
                                placeholderTextColor={Colors.placeHolderColor} 
                                style={styles.inputStyle} 
                                value={this.state.lastName}
                                onChangeText={(text)=>this.setState({lastName:text})} 
                                placeholder="last name" 
                                underlineColorAndroid={Colors.lightGray}
                                clearButtonMode="never"
                                onSubmitEditing={(e)=>e.preventDefault()}
                            //     icon={()=>
                            //     <FontAwsome style={[styles.textColor,{fontSize:23}]} name="user-o"/>
                            // }
                            /> 
                           
                         </View>
                        </View>
                        
                        <View  style={styles.inputSubContainer3}>

                        <Input 
                                placeholderTextColor={Colors.placeHolderColor} 
                                style={styles.inputStyle} 
                                value={this.state.email}
                                onChangeText={(text)=>this.setState({email:text})} 
                                placeholder="Email" 
                                underlineColorAndroid={Colors.lightGray}
                                clearButtonMode="never"
                                onSubmitEditing={(e)=>e.preventDefault()}
                                // icon={()=>
                                // <Octicons style={[styles.textColor,{fontSize:23}]} name="mail"/>
                            // }
                            />
                         </View>

                         <View  style={styles.inputSubContainer2}>

                         <Input 
                                placeholderTextColor={Colors.placeHolderColor} 
                                style={styles.inputStyle} 
                                value={this.state.password}
                                onChangeText={(text)=>this.setState({password:text})} 
                                placeholder="password" 
                                secureTextEntry
                                underlineColorAndroid={Colors.lightGray}
                                
                                clearButtonMode="never"
                                onSubmitEditing={(e)=>e.preventDefault()}
                            />
                         </View>

                        
                         {/* <View style={styles.locationContainer}>
                             {this.state.city && this.state.state ? <View style={styles.greenDot}></View>:<Text></Text>}
                             <Text style={styles.cityPosition}>{this.state.state + ','} {this.state.city}</Text>
                         </View>
                         <Button
                            status="primary"
                            icon={()=> this.state.gettingLocation?
                                <Spinner color={Colors.white}/> :
                              <Icon style={styles.iconStyle} name='pin'/>}
                            onPress={()=>this.getLocation()}>
                             Set Location
                         </Button>

                         <View  style={styles.inputSubContainer2}>
                         <Input 
                                placeholderTextColor={Colors.placeHolderColor} 
                                style={styles.inputStyle} 
                                value={this.state.occupation}
                                label="OCCUPATION"
                                
                                onChangeText={(text)=>this.setState({occupation:text})} 
                                placeholder="Occupation" 
                                clearButtonMode="never"
                                onSubmitEditing={(e)=>e.preventDefault()}
                            />
                         </View> */}
                
            
           
           </Form>    
          
           <Button
                   status="success" 
                   style={{width:200,borderRadius:50,alignSelf:'center',marginTop:15,marginBottom:10}}
                   onPress={()=>this.validation()}>
                   Sign Up
                </Button>  
         <Text style={{textAlign:'center',padding:5,marginTop:10}}>Have an account? <Text  onPress={()=>this.props.navigation.goBack()}  style={styles.link}>Log in</Text></Text> 
         </Container>
        )
    }
}     


const styles = StyleSheet.create({
    link:{
        color:Colors.primary,
        fontWeight:"300"
    },
    inputStyle:{
        marginTop:15,
        backgroundColor:Colors.white,
        borderWidth:0,
        borderColor:Colors.white
      },
    btn2:{
        margin:15,
        borderRadius:4,
        backgroundColor:Colors.containers},
    btn:{
        borderRadius:10,
        backgroundColor:Colors.containers
    },
    cityPosition:{
        textAlign:'center'
    },
    greenDot:{
        width:10,
        height:10,
        borderRadius:100,
        backgroundColor:Colors.forestgreen,
        marginRight:5,
        alignSelf:'center'},
    locationContainer:{
        flexDirection:'row',
        alignItems:'center',
        margin:5,
        flex:1,
        alignContent:'center'
    },
    textStyle:{
        color:Colors.iconColor
    },
    iconStyle:{
        color:Colors.white,
        fontSize:20
    },
    inputSubContainer3:{
        margin:2,
        borderRadius:10,
        marginBottom:6
    },
    inputSubContainer2:{
        marginBottom:6,
        borderRadius:10
    },
    inputSubContainer:{
        margin:2,
        flex:1,
        borderRadius:10
    },
    inputContainer:{
        flexDirection:'row',
        marginBottom:6},
   container:{
       flex:1,
       backgroundColor:Colors.containers,
       justifyContent:'center',
       alignContent:'center'
    },
   form:{
       marginLeft:20,
       marginBottom:10,
       marginRight:20,
       justifyContent:'center',
       alignContent:'center'
    },
})