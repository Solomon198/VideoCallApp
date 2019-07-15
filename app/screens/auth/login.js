import React,{Component} from 'react'
import {View,Container,Text,Input,Item,Form,Icon,Button,} from 'native-base'
import {TouchableHighlight,AsyncStorage,Modal,PermissionsAndroid,StyleSheet} from 'react-native'
import * as firebase from 'react-native-firebase';
import { toast } from '../../components/toast';
import { Loading } from '../../components/Loader/loader';
import { Colors } from '../../styles';

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
            <Item  >     
             <Icon style={styles.textColor} name='person'/>
             <Input placeholderTextColor={Colors.placeHolderColor} style={styles.textColor} onChangeText={(text)=>this.setState({name:text})} placeholder="Username" />
            </Item>
            <Item>
            <TouchableHighlight onPress={()=>this.setState({secureTextEntry:!this.state.secureTextEntry})}>
               <Icon style={styles.textColor} name={this.state.secureTextEntry?'eye-off':'eye'}/>
            </TouchableHighlight>
            <Input  placeholderTextColor={Colors.placeHolderColor} style={styles.textColor}  secureTextEntry={this.state.secureTextEntry} onChangeText={(text)=>this.setState({password:text})} placeholder="Password" />
            </Item>
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
            <Item bordered={false} >     
            <Icon style={styles.textColor} name='mail'/>
            <Input placeholderTextColor={Colors.placeHolderColor} style={styles.textColor} onChangeText={(text)=>this.setState({name:text})} placeholder="Email" />
            </Item>
            <Item bordered={false}>
            <TouchableHighlight onPress={()=>this.setState({secureTextEntry:!this.state.secureTextEntry})}>
               <Icon style={styles.textColor} name={this.state.secureTextEntry?'eye-off':'eye'}/>
            </TouchableHighlight>

              <Input placeholderTextColor={Colors.placeHolderColor} style={styles.textColor} secureTextEntry={this.state.secureTextEntry} onChangeText={(text)=>this.setState({password:text})} placeholder="Password" />
            </Item>
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
         
          <Container style={styles.container}>
           <View style={styles.subContainer}>
                {this.renderForm()}    
                {this.loader()}             
                <Button onPress={()=>this.login({username:this.state.name,password:this.state.password,accountType:this.state.accountType})}  block style={styles.btn}>
                    <Text style={styles.textColor}>Sign In</Text>
                </Button> 

                <Button transparent onPress={()=>this.props.navigation.navigate('RessetPassword')}  block style={styles.btn2}>
                    <Text style={styles.textColor}>Foggot Password?</Text>
                </Button>
                  
          </View>
          {this.state.accountType == 'patient'?
              <Button onPress={()=>this.props.navigation.navigate('SignUp')}  block style={styles.btn}>
              <Text style={styles.textColor}>Sign Up</Text>
             </Button> :<Text></Text>
          }
         </Container>
        )  
    }
} 

const styles = StyleSheet.create({
    btn2:{
        margin:15,
        borderRadius:4
    },
    btn:{
        margin:15,
        borderRadius:4,
        backgroundColor:Colors.overLay
    },
    subContainer:{
        flex:1,
        justifyContent:'center',
        alignContent:'center'
    },
    container:{
        flex:1,
        justifyContent:'center',
        alignContent:'center',
        backgroundColor:Colors.containers},
    textColor:{
        color:Colors.baseText
     },
   form:{
       marginRight:10,
       marginBottom:25
    }
})