import React,{Component} from 'react'
import {View,Container,Item,Form,Icon,} from 'native-base'
import {TouchableHighlight,AsyncStorage,Modal,PermissionsAndroid,StyleSheet,StatusBar,TouchableNativeFeedback} from 'react-native'
import * as firebase from 'react-native-firebase';
import { toast } from '../../components/toast';
import { Loading } from '../../components/Loader/loader';
import { Colors } from '../../styles';
import { Text, Layout ,Input,Button} from 'react-native-ui-kitten';
import Feather from '../../components/icons/feather'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'



const storage = AsyncStorage;

export default class Login extends Component {
    constructor(props){
        super(props);

    }

    state = {
       accountType:this.props.navigation.state.params.accountType,
       data:this.props.navigation.state.params.hospital,
       name:'',
       password:'',
       doctors:[],
       visible:false,
       secureTextEntry:true

    }   

    //handles patient login process when validation has been made on input fields
    loginPatient(userInfo){
        //validate user
    
            
            this.setState({visible:true},()=>{
                firebase.auth().signInWithEmailAndPassword(this.state.name,this.state.password).then((val)=>{
                   let user = firebase.auth().currentUser
                        if(user){
                            if(user.emailVerified){
                                this.setState({visible:false})
                                storage.getItem('appIntro').then((val)=>{  
                                    if(!val){
                                        this.props.navigation.navigate('IntroNav');
                                            let info = JSON.stringify({user:userInfo});
                                            storage.setItem('userInfo',info).then(()=>{
                                                storage.setItem('accountType','1');
                                            })                                
                                    }else{
                                        this.props.navigation.navigate('PatientStack',{user:userInfo});    
                                    }
                                })
                            }else{
                                user.sendEmailVerification().then(()=>{
                                    this.setState({visible:false},()=>{
                                        toast('A verification email has been sent to your email address please confirm your email to login')
                                    })

                                }).catch((err)=>{
                                    this.setState({visible:false},()=>{
                                    toast('Verification message already sent please verify your account')
                                })
                            })
                            }
                        }
                    
                }).catch((val)=>{
                   this.setState({visible:false})
                   alert(val.message)    
               })
            })
           

    }

    //show loader
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

    saveInfo(val=''){
                
        if(val){
            val['hospital'] = this.state.data.name;
            val['hospitalKey']  = this.state.data.key,
            val['photo']  = val.photo
        }
        if(!val){
          var user = {
                name:this.state.name,
  
            }
            val = user;
        }
        let wrap = JSON.stringify(val)
        storage.setItem('user',wrap);
    }
          
    //handles doctor login process when validation has been made on input fields
    doctorLogin(){
        const {doctors} = this.state;
        if( doctors.length > 0){
              doctors.forEach((val,index)=>{
                if(this.state.name.toLowerCase() == val.name.toLowerCase() && this.state.password == val.pswd){
                    storage.getItem('appIntro').then((val)=>{
                        if(!val){
                            this.props.navigation.navigate('IntroNav');
                                let info = JSON.stringify(val);
                                storage.setItem('userInfo',info).then(()=>{
                                    storage.setItem('accountType','2');
                                })
                        }else{
                            this.props.navigation.navigate('DoctorStack',val)
                        }
                    })
                    this.saveInfo(val);
                }
            })
        }
    }


    //get doctors records base on hospital
    getRecords(){  
        if(this.state.accountType == 'doctor'){
            var database = firebase.firestore();    
 
            var db = database.collection("doctors").doc(this.state.data.key).collection('credentials')
                   
      
                
          db.get().then((querySnapshot)=>{                 
              let docarray = [];    
                  querySnapshot.forEach(function(doc) {
                        let photo = doc.data().photo?doc.data().photo:'';
                        docarray.push({
                            name: doc.data().name,
                            pswd:doc.data().pswd,
                            photo:photo,
                            key: doc.id,
                           
                        })       
                   });                      
              this.setState({                  
                  doctors:docarray
              })
               
              
          },(err)=>alert('error reading dataBase'),()=>alert('completes'))
              
        }
    }


    componentDidMount(){
        if(this.state.accountType == 'doctor'){
           this.getRecords()
        }


        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then((val)=>{
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).then((val)=>{
              //do nothing;WRITE_EXTERNAL_STORAGE
              PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((val)=>{
                //do nothing;
                PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((val)=>{
                    //do nothing;
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((val)=>{
                        //do nothing;ACCESS_FINE_LOCATION
                      })
                  })
              })
            })
       }).catch((err)=>'')   
    }    


    //display doctor form base on accountype
    _doctorForm(){
        return(
            <Form style={styles.form}>

               <Input 
               placeholderTextColor={Colors.placeHolderColor} 
               style={styles.inputStyle} 
               value={this.state.name}
               underlineColorAndroid={Colors.lightGray}
               onChangeText={(text)=>this.setState({name:text})} 
               placeholder="USERNAME" 
               clearButtonMode="never"
               onSubmitEditing={(e)=>e.preventDefault()}
               icon={()=>
                <Feather style={[styles.textColor,{fontSize:23}]} name="mail"/>  }           
                />

               
              <Input 
                  clearButtonMode="never"
                  value={this.state.password}
                  placeholderTextColor={Colors.placeHolderColor} 
                  style={styles.inputStyle} 
                  underlineColorAndroid={Colors.lightGray}
                  secureTextEntry={this.state.secureTextEntry} 
                  icon={()=><TouchableNativeFeedback onPress={()=>this.setState({secureTextEntry:!this.state.secureTextEntry})}>
                  <Feather style={[styles.textColor,{fontSize:23}]} name={this.state.secureTextEntry?'eye-off':'eye'}/>
               </TouchableNativeFeedback>}
                  onChangeText={(text)=>this.setState({password:text})} placeholder="PASSWORD" />
        
               </Form>    
        )
    }


    //checks accountype to determine which account to login into
    login(info){
        if(this.state.accountType == 'patient'){
            this.loginPatient(info);
            this.saveInfo();
        }else{
            this.doctorLogin()
        }
    }

   //display patient form base on accountype

    _clientForm(){
        return(
          <Form style={styles.form}>
           
            <Input 
               placeholderTextColor={Colors.placeHolderColor} 
               style={styles.inputStyle} 
               value={this.state.name}
               onChangeText={(text)=>this.setState({name:text})} 
               placeholder="EMAIL" 
               underlineColorAndroid={Colors.lightGray}
               clearButtonMode="never"
               onSubmitEditing={(e)=>e.preventDefault()}
               icon={()=>
               <Feather style={[styles.textColor,{fontSize:23}]} name="mail"/>  }           
               />

          

              <Input 
                  clearButtonMode="never"
                  underlineColorAndroid={Colors.lightGray}
                  value={this.state.password}
                  placeholderTextColor={Colors.placeHolderColor} 
                  style={styles.inputStyle} 
                  secureTextEntry={this.state.secureTextEntry} 
                  icon={()=><TouchableHighlight style={{backgroundColor:'#fff'}} onPress={()=>this.setState({secureTextEntry:!this.state.secureTextEntry})}>
                  <Feather style={[styles.textColor,{fontSize:23}]} name={this.state.secureTextEntry?'eye-off':'eye'}/>
               </TouchableHighlight>}
                  onChangeText={(text)=>this.setState({password:text})} placeholder="PASSWORD" />
         
         </Form>    
        )
    }
    

    //renders correct form base on accountype
    renderForm(){
        if(this.state.accountType == 'patient'){
            return(this._clientForm())
        }
        return this._doctorForm()
    }


    
    render(){
        
        return(      
          <KeyboardAwareScrollView>
          <Container style={styles.container}>
           <Container style={styles.subContainer}>
                <StatusBar backgroundColor={Colors.primary} />
                <Text style={{color:Colors.primary,marginBottom:10}} category="h1">Login to  your account</Text>
                {this.renderForm()}    
                {this.loader()}   
                
                <Button 
                   status="danger" 
                   style={{alignSelf:"flex-end",marginTop:0}}  
                   appearance="ghost" 
                   onPress={()=>this.props.navigation.navigate('RessetPassword')}  >
                    Foggot Password?
                </Button>

                <Button
                   size="large" status="success" 
                   style={{width:200,borderRadius:50,alignSelf:'center',marginTop:10}}
                   onPress={()=>this.login({username:this.state.name,password:this.state.password,accountType:this.state.accountType})}>
                   Login
                </Button>    

         {this.state.accountType == 'patient'?
              <Button style={{marginTop:10}} size="large" appearance="ghost" status="primary" onPress={()=>this.props.navigation.navigate('SignUp')} >
                 Create an account
             </Button> :<Text></Text>
          } 
          </Container>
         <Text style={styles.terms}>By continuing, i accept the terms of <Text style={styles.link}>services,</Text> <Text style={styles.link}>community guidelines</Text> and i have read the <Text style={styles.link}>Privacy policy</Text></Text>
         </Container>
         </KeyboardAwareScrollView>

        )  
    }
} 

const styles = StyleSheet.create({
    terms:{
        textAlign:"center",
        padding:10,
        color:Colors.darkGray,
        marginLeft:20,
        marginRight:20,
        fontWeight:'300'},
    link:{
        color:Colors.primary,
        fontWeight:"300"
    },
    btn2:{
        margin:15,
        borderRadius:4
    },
    btn:{
        margin:15,
        borderRadius:4,
        backgroundColor:Colors.btnColor
    },
    subContainer:{
        flex:1,
        marginLeft:20,  
        marginRight:20,
        marginTop:10,
        justifyContent:'center',
        alignContent:'center'
    },
    container:{
        flex:1,
        backgroundColor:Colors.containers},
    textColor:{
        color:Colors.baseText
     },
    
   form:{
       marginRight:10,
       marginBottom:25
    }
    ,
    inputStyle:{
      marginTop:10,
      backgroundColor:Colors.white,
      borderWidth:0,
      borderColor:Colors.white
    }
})