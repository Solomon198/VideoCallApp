import React,{Component} from 'react'
import {View,Container,Text,Input,Item,Form,Icon,Button,Spinner} from 'native-base'
import {AsyncStorage,Modal,StyleSheet} from 'react-native'
import * as firebase from 'react-native-firebase';
import { toast } from '../../components/toast';
import Geolocation from 'react-native-geolocation-service';
import { GEOCODING_API_KEY,GOOGLE_GEOLOCATION_URL} from 'react-native-dotenv'
import { Loading } from '../../components/Loader/loader';
import { Colors } from '../../styles';
   

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
        gettingLocation:false
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
        else if(!this.state.occupation.trim()){
           return toast('Please enter occupation')
        }else if(!this.state.city && !this.state.state){
          return toast('Please set your location to continue');
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
        storage.getItem('loca').then((val)=>{
         
        })
    }


    signUp(){
        let auth = firebase.auth();
        this.setState({visible:true},()=>{
            auth.createUserWithEmailAndPassword(this.state.email,this.state.password).then((val)=>{
                let $ref = firebase.firestore().collection('users').doc(val.user.uid).collection('personalInfo').doc('info');
                 $ref.set({
                    firstName:this.state.firstName,
                    lastName:this.state.lastName,
                    occupation:this.state.occupation,
                    location: this.state.city + this.state.state
                  })
                val.user.sendEmailVerification().then((val)=>{
                    toast('Verification sent to email address');
                    this.setState({visible:false})
                    this.props.navigation.goBack();   
                }).catch((err)=>{
                    this.setState({visible:false})
                    this.props.navigation.goBack();      
                })
               
           }).catch((val)=>{
               this.setState({visible:false})
               toast(val.message);
           })
        })
       
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
                        <View style={styles.inputContainer}>
                        <View  style={styles.inputSubContainer}>
                            <Item  >     
                            <Input placeholderTextColor={Colors.placeHolderColor} onChangeText={(text)=>this.setState({firstName:text})} placeholder="First name" />
                            </Item>
                         </View>
                        
                    
                          <View  style={styles.inputSubContainer}>
                            <Item  >     
                            <Input placeholderTextColor={Colors.placeHolderColor} onChangeText={(text)=>this.setState({lastName:text})} placeholder="Last name" />
                            </Item>
                         </View>
                        </View>
                        
                        <View  style={styles.inputSubContainer3}>
                            <Item  >     
                            <Input placeholderTextColor={Colors.placeHolderColor} onChangeText={(text)=>this.setState({email:text})} placeholder="Email" />
                            </Item>
                         </View>

                         <View  style={styles.inputSubContainer2}>
                            <Item  >     
                            <Input placeholderTextColor={Colors.placeHolderColor} secureTextEntry={true} onChangeText={(text)=>this.setState({password:text})} placeholder="Password" />
                            </Item>
                         </View>

                         <View  style={styles.inputSubContainer2}>
                            <Item  >     
                            <Input placeholderTextColor={Colors.placeHolderColor} secureTextEntry={true} onChangeText={(text)=>this.setState({occupation:text})} placeholder="Occupation" />
                            </Item>
                         </View>
                         <View style={styles.locationContainer}>
                             {this.state.city && this.state.state ? <View style={styles.greenDot}></View>:<Text></Text>}
                             <Text style={styles.cityPosition}>{this.state.state + ','} {this.state.city}</Text>
                         </View>
                         <Button onPress={()=>this.getLocation()} block iconLeft light  style={styles.btn}>
                              {
                                  this.state.gettingLocation?
                                       <Spinner color={Colors.forestgreen}/> :
                                     <Icon style={styles.iconStyle} name='pin'/>

                              }


                             <Text style={styles.textStyle}>Set Location</Text>
                         </Button>
                
            
           
           </Form>    
          
              <Button onPress={()=>this.validation()}  block style={styles.btn2}>
              <Text style={styles.textStyle} >Create Account</Text>
             </Button>
         </Container>
        )
    }
}     


const styles = StyleSheet.create({
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
        margin:10,
        flex:1,
        alignContent:'center'
    },
    textStyle:{
        color:Colors.iconColor
    },
    iconStyle:{
        color:Colors.iconColor
    },
    inputSubContainer3:{
        borderColor:Colors.borderColor,
        borderWidth:1,
        margin:2,
        borderRadius:10,
        marginBottom:10
    },
    inputSubContainer2:{
        borderColor:Colors.borderColor,
        borderWidth:1,
        marginBottom:10,
        borderRadius:10
    },
    inputSubContainer:{
        borderColor:Colors.borderColor,
        borderWidth:1,
        margin:2,
        flex:1,
        borderRadius:10
    },
    inputContainer:{
        flexDirection:'row',
        marginBottom:10},
   container:{
       flex:1,
       backgroundColor:Colors.containers
    },
   form:{
       marginLeft:10,
       marginBottom:10,
       marginRight:10,
       marginTop:100
    },
})