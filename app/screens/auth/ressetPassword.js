import React,{Component} from 'react'
import {Container,Icon,Form,H1} from 'native-base'
import {Modal,StyleSheet,StatusBar} from 'react-native'
import * as firebase from 'react-native-firebase';
import { toast } from '../../components/toast';
import { Loading } from '../../components/Loader/loader';
import { Colors } from '../../styles';
import { Text, Layout ,Input,Button} from 'react-native-ui-kitten';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class RessetPassword extends Component {
    constructor(props){
        super(props);

    }

    state = {
        visible:false,
        email:'',
        password:''
    }   


    ressetPassword(){
        if(!this.state.email.trim()){
            return toast('Please enter an email Adress')
        }
        this.setState({visible:true})
            firebase.auth().sendPasswordResetEmail(this.state.email).then((val)=>{
                this.setState({visible:false},()=>{
                    toast('A password resset email has been sent to the email you provided follow the link to resset Password');
                    this.props.navigation.goBack();
                })
            }).catch((err)=>{
                this.setState({visible:false},()=>{
                    toast(err.message)
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
         
          <Container style={styles.Container}>
          {this.loader()}
            <StatusBar backgroundColor={Colors.primary}/>
            <Text category="h3" style={{color:Colors.primary,alignSelf:'center',marginBottom:15}}>Resset Password</Text>
           <Form style={styles.form}>
                       <Input 
                                placeholderTextColor={Colors.placeHolderColor} 
                                style={styles.inputStyle} 
                                value={this.state.email}
                                onChangeText={(text)=>this.setState({email:text})} 
                                placeholder="Email"   
                                underlineColorAndroid={Colors.lightGray}
                                clearButtonMode="never"
                                onSubmitEditing={(e)=>e.preventDefault()}
                                icon={()=>
                                <Icon style={styles.textColor} name="mail"/>}
                           />
           </Form> 

               <Button
                   size="giant" status="success" 
                   style={{width:200,borderRadius:50,alignSelf:'center',marginTop:20}}
                   onPress={()=>this.ressetPassword()}>
                   Reset Password
                </Button>      
        
         </Container>
        )
    }
}    

const styles = StyleSheet.create({
  inputStyle:{
    backgroundColor:Colors.white,
    borderWidth:0,
    borderColor:Colors.white
  },
  textColor:{
      color:Colors.baseText
    },
  btn:{
      margin:15,
      borderRadius:4,
      backgroundColor:Colors.containers},
  form:{
      marginRight:10,
      marginBottom:25,
      marginLeft:10
    },
  header:{
      alignSelf:'center'
    },
  Container:{
      flex:1,
      justifyContent:'center',
      alignContent:'center',
      backgroundColor:Colors.containers}
})