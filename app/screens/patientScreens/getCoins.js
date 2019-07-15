import React,{Component} from 'react'
import {Container,Text,H1,Icon,Button} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet,View,ProgressBarAndroid,Modal,TextInput} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import {Loading} from '../../components/Loader/loader'
import { Colors, Typography } from '../../styles';
import { AppStatus } from '../../Utils/functions';

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

  
    //Adding requested coins to the user balance
    setCoinsNumber(){
       if(!this.state.coin) return this.setState({show:false},()=>toast('please enter an amount'))
       storage.getItem('user').then((val)=>{
           if(val){
               let data = JSON.parse(val);
               let ref = firestore.collection('users').doc(firebase.auth().currentUser.uid).collection('personalInfo').doc('info');
               ref.get().then((snapshot)=>{
                   let value = snapshot.data()?snapshot.data().amount:'';
                   if(value){
                       let amount = parseInt(this.state.coin) + parseInt(value);
                       
                       ref.update({amount:amount}).then(()=>{
                        this.setState({
                            show:false
                        },()=>{
                            this.goback()
                        })
                       }).catch((err)=>{
                        this.setState({
                            show:false
                        },()=>{
                            toast('Error getting coins')
                        })
                       })
                   }else{
                       ref.update({amount:this.state.coin}).then(()=>{
                        this.setState({
                            show:false
                        },()=>{
                            this.goback()   
                        })
                       }).catch((err)=>{
                        this.setState({
                            show:false
                        },()=>{
                            toast('Error getting coins')
                        })
                       })
                   }
               })
           }
       })
    }

   
    
    render(){
                      
        return(          
          <Container style={styles.Container}> 
               <Toolbar title='Get Coins' canGoBack={true} goBack={()=>this.props.navigation.goBack()}/>
               {this.renderLoader()}
                    <View style={styles.subContainer}>
                        <Text style={styles.textStyle} note>Amount</Text>
                    <H1  style={styles.amountStyle}>$ {this.state.coin?this.state.coin:0} .00</H1>
                    <View style={styles.emptyView}></View>
                        <TextInput
                        value={this.state.coin}
                        onChangeText={(text)=>this.editing(text)}
                        keyboardType='numeric'
                        placeholder='Enter An Amount'
                        placeholderTextColor='lightgray'
                        style={styles.input}
                        underlineColorAndroid='transparent'
                        />
                        <Button onPress={()=>this.setState({show:true},()=>{
                             AppStatus().then((val)=>{
                                if(val){
                                    this.setCoinsNumber()
                                }else{
                                   this.setState({show:false},()=>{
                                    toast('App under maintainance please try again later')
                                   })
                                }
                            })
                        })} style={styles.btn}  rounded block iconLeft>
                            <Icon style={styles.textStyle} name='logo-usd'/>
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
       alignItems:'center'
   },
   textStyle:{
       color:Colors.baseText
    },
    amountStyle:{
        fontWeight:'bold',color:Colors.baseText
    }
    ,
    emptyView:{
        borderBottomColor:Colors.overLay,
        borderBottomWidth:1,width:'100%',
        marginTop:10,
    },
    input:{
        fontWeight:'bold',
        fontSize:Typography.largeFontSize,
        width:'100%',
        margin:10,
        alignSelf:'center',
        textAlign:'center',
        color:Colors.baseText
    },
    btn:{
        margin:10,
        backgroundColor:Colors.overLay
    }
})