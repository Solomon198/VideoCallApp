import React,{Component} from 'react'
import {Container,Text,Input,Item,Form,H1,Button} from 'native-base'
import {Modal,StyleSheet} from 'react-native'
import * as firebase from 'react-native-firebase';
import { toast } from '../../components/toast';
import { Loading } from '../../components/Loader/loader';
import { Colors } from '../../styles';


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
            <H1 style={styles.header}>Resset Password</H1>
           <Form style={styles.form}>
            <Item  >     
            <Input placeholderTextColor={Colors.placeHolderColor} onChangeText={(text)=>this.setState({email:text})} placeholder="Email" />
            </Item>
           </Form>    
          
              <Button onPress={()=>this.ressetPassword()}  block style={styles.btn}>
              <Text style={styles.textColor} >Reset Password</Text>
             </Button>
         </Container>
        )
    }
}    

const styles = StyleSheet.create({
  textColor:{
      color:Colors.baseText
    },
  btn:{
      margin:15,
      borderRadius:4,
      backgroundColor:Colors.containers},
  form:{
      marginRight:10,
      marginBottom:25
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