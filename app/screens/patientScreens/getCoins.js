import React,{Component} from 'react'
import {Container,H1,Icon} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet,View,ProgressBarAndroid,Modal,TextInput} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import {Loading} from '../../components/Loader/loader'
import { Colors, Typography } from '../../styles';
import { AppStatus } from '../../Utils/functions';
import { Text, Layout ,Input,Button} from 'react-native-ui-kitten';
import References from '../../Utils/refs'
import { GEOCODING_API_KEY,GOOGLE_GEOLOCATION_URL,API_PREFIX} from 'react-native-dotenv'
import DefaultCustoms from '../../Utils/strings';
import axios from 'axios'


const firestore = firebase.firestore();
const storage = AsyncStorage;

export default class GetCoins extends Component {
    constructor(props){
        super(props);

    }
    
    state = {   
           data :{},
           visible:false    ,
           coin:'',
           inputVal:'',
           show:false
 
    }       
   

    componentDidMount(){
            storage.getItem('user').then((val)=>{
                let data = JSON.parse(val);
                this.setState({data:data});
            })
    }    

    
   //back navigator
   goback(){
       this.props.navigation.goBack()
   }


   //show loader when processing coins
   renderLoader(){
       return(
           <Modal visible={this.state.show} transparent>
               <Loading show={true}/>
           </Modal>
       )
   }

   
   

    //formatts input to be in floating format
    editing(text){
        text = parseFloat(text)
        this.setState({coin:text,inputVal:text},()=>{
    
        })
    }

  
  
      //updating profile info when editing
  async  setCoinsNumber(){

    if(!this.state.coin) return this.setState({show:false},()=>toast('please enter an amount'))
 
    this.setState({show:true});

     try{
          const uid = firebase.auth().currentUser.uid;

          const updateProfile = await axios.post(`${API_PREFIX}Users/creditUser`,{uid:uid,amount:this.state.coin})
        
          const {status,message} = updateProfile.data;
    
          if(status == "Success"){
              this.props.navigation.goBack();
              this.setState({show:false,updateProfile:{}});
          }else{
              this.setState({show:false})
              toast(message);
          }
     }catch(e){
       this.setState({show:false})
       toast(e.message)
     }
    
    }

   
    
    render(){
                      
        return(          
          <Container style={styles.Container}> 
               <Toolbar title={DefaultCustoms.GetCoinsHeading} canGoBack={true} goBack={()=>this.props.navigation.goBack()}/>
               {this.renderLoader()}
                    <View style={styles.subContainer}>
                        {/* <Text style={styles.textStyle} note>Amount</Text> */}
                    {/* <H1  style={styles.amountStyle}>$ {this.state.coin?this.state.coin:0} .00</H1> */}
                    <View style={styles.emptyView}></View>
                        <TextInput
                        value={this.state.coin}
                        onChangeText={(text)=>this.editing(text)}
                        keyboardType='numeric'
                        placeholder='$0.00'
                        placeholderTextColor="#000"
                        style={styles.input}
                        underlineColorAndroid='transparent'
                        />
                        <Button size="large" onPress={()=> this.setCoinsNumber()} 
                        style={{width:"100%",margin:10}}
                        icon={()=><Icon style={{color:Colors.white}} name='checkmark'/>} status="success">
                            
                            <Text style={styles.textStyle}>Get Coin</Text>
                        </Button>   
                    </View>
                    
          </Container>   
        )
    }
}        
   
const styles = StyleSheet.create({
   Container:{
       flex:1,
       backgroundColor:Colors.containers},
   subContainer:{
       flex:1,
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center',
       marginLeft:10,marginRight:10,
   },
   textStyle:{
       color:Colors.baseText
    },
    amountStyle:{
        fontWeight:'bold',color:Colors.baseText
    }
    ,
    emptyView:{
        borderBottomColor:Colors.white,
        borderBottomWidth:1,width:'100%',
        marginTop:10,
    },
    input:{
        fontWeight:'100',
        fontSize:Typography.largeFontSize,
        width:'100%',
        margin:10,
        alignSelf:'center',
        textAlign:'center',
        color:Colors.baseText,
        backgroundColor:"#f4f4f4",
        height:100,
        borderRadius:5,
        
    },
    btn:{
        margin:10,
        backgroundColor:Colors.overLay
    }
})