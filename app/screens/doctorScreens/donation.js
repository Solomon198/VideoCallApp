import React,{Component} from 'react'
import {Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';
import SplashScreen from 'react-native-splash-screen'
import { Loading } from '../../components/Loader/loader';
import { Colors } from '../../styles';
import {ListWithIcon,ListWithImage} from '../../components/RenderList/ListComponents'

const storage = AsyncStorage;

export default class Donation extends Component {
    constructor(props){
        super(props);

    }
    
    state = {   
           data :{},
           visible:false    ,
           donate:0,
           charities:[],
           donating:false,
           isEmpty:false,
 
    }   
    



   
    
  


    componentDidMount(){   
        SplashScreen.hide();
            storage.getItem('user').then((val)=>{
                let data = JSON.parse(val);
                this.setState({data:data},()=>{
                            let docKey = this.state.data.key;
                            var db = firebase.firestore().collection('doctors').doc("doctorsDonationTrack").collection(docKey);
                            
                            db.get().then((querySnapshot)=>{                 
                                let docarray = [];    
                                    querySnapshot.forEach(function(doc) {
                                        
                                          docarray.push({
                                              name: doc.data().name,
                                              key: doc.data().key,
                                              donation:parseInt(doc.data().amount),
                
                                          })    
                                     });                      
                                this.setState({                  
                                    charities:docarray,
                                    isEmpty:docarray.length > 0?false:true
                
                                })
                                 
                                
                            },(err)=>alert('error reading dataBase'),()=>alert('completes'))
                });
            })

            
                
    }    

    



   
    
   
    
    render(){
            
        
         
        return(          
          <Container style={{flex:1,backgroundColor:Colors.containers}}> 
               <Toolbar canGoBack goBack={()=>this.props.navigation.goBack()} title='Donation'/>
               {
                   this.state.charities.length < 1?
                      this.state.isEmpty?
                         <Loading show={false} text='No Donation'/>
                       :
                       <Loading show={true}/>
                   :

                   
                   <ListWithImage
                   data = {this.state.charities}
                   rightItem={true}
                   onPress={()=>''}
                   iconRightName='logo-usd'
                   textPropertyName="donation"
                   iconText
                   iconLeftName='medical'
                   iconColor={Colors.iconColor}
                   showItem ={['name','key']}
                 />
                 
                    }
          </Container>
        )    
    }         
}        
  
const styles = StyleSheet.create({
   container:{
       flex:1,
       justifyContent:'center',

   },
  
})