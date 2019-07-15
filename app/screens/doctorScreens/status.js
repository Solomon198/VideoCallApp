import React,{Component} from 'react'
import {View,Container,Text} from 'native-base'
import * as firebase from 'react-native-firebase';
import {Switch,AsyncStorage,StyleSheet} from 'react-native'
import Toolbar from '../../components/Toolbar/Toolbar';
import { toast } from '../../components/toast';
import {PUSH_NOTIFICATION_URL_FIREBASE} from 'react-native-dotenv'
import { Colors } from '../../styles';

const storage = AsyncStorage

export default class Any extends Component {
    constructor(props){
        super(props);

    }
    
    state = {
       data:this.props.navigation.state.params,
       accountType:'patient',
       doctors:[
           
        ],
       online:false,
       docName :'',
       docKey:'',
       status:false

    }  

    componentDidMount(){
      storage.getItem('user').then((val)=>{
        storage.getItem('status').then((status)=>{
            status = status?status:'offline'
            status = status == 'online' ?true:false
            let data = JSON.parse(val);
            this.setState({docKey:data.key,docName:data.name,online:status},()=>{
                const ref =  firebase.database().ref('/status/'+this.state.docKey);
                ref.onDisconnect();
                ref.set({name:this.state.docName,status:'offline'})
            })  
        })
         
      })
     
    }

   
    //whenever status is online a notiication is sent to all patient who have an appointment with doctor
    sendNotification(){
        fetch(PUSH_NOTIFICATION_URL_FIREBASE, {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({        
                topic:this.state.docKey,
                payload:{
                    docName:this.state.docName,
                    docKey:this.state.docKey   
                }
            })
            }).then((val)=>val.json())
            .then((valz)=>{
              toast('Presence sent to client')
            }).catch((err)=>{
                //
            })
    }
      
    //toggle presence of doctor on or off
    togglePresence(){
        this.setState({online:!this.state.online},()=>{
            if(this.state.online){
                    let ref = firebase.database().ref('/status/'+this.state.docKey);
                    
                    ref.set({name:this.state.docName,status:'online'}).then(()=>{
                    })
                    ref.onDisconnect().set({name:this.state.docName,status:'offline'})
                    this.sendNotification()
            }else{
                storage.setItem('status','offline').then(()=>{
                 firebase.database().ref('/status/'+this.state.docKey)
                .set({name:this.state.docName,status:'offline'})
                })
                
            }
        })

    }
        
    render(){
            
        return(          
          <Container style={styles.container}> 
                <Toolbar  title='Status'/>
               <View style={styles.subContainer}>
                <View style={styles.statusConatainer}>
                    <Text style={styles.headerText}>{this.state.online?'Online':'Offline'}</Text>
                        <Switch onValueChange={()=>this.togglePresence()} value={this.state.online}/>

                </View>
                </View>
               
          </Container>
        )
    }
}                                                


const styles = StyleSheet.create({
    headerText:{
        fontSize:30,
        marginRight:10,
        fontWeight:'bold',
        color:Colors.baseText
    },
    statusConatainer:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignContent:'center',
        alignItems:'center'
    },
   container:{
       flex:1,
       backgroundColor:Colors.containers
    },
   subContainer:{
       flex:1,
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center',
       backgroundColor:Colors.containers},

})