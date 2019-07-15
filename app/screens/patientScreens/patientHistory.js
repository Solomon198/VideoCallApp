


import React,{Component} from 'react'
import {Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage} from 'react-native'
import Toolbar from '../../components/Toolbar/Toolbar';
import {Loading} from '../../components/Loader/loader'
import {ListWithImage} from '../../components/RenderList/ListComponents'
import { Colors } from '../../styles';
const storage = AsyncStorage;



export default class PatientHistory extends Component {
    constructor(props){
        super(props);

    }

   
    
    state = {
    history:[],
    data :{},
    showLive:false, 
    addedTime:0,
    item:{},
    user:{},
    noHistory:false
    }      
    
    

    //get user history on calls made and display
    componentDidMount(){
        storage.getItem('user').then((val)=>{
            let data = JSON.parse(val);
            this.setState({user:data},()=>{
                var database = firebase.firestore();    
                var db = database.collection("users").doc(data.uid).collection('history')
                       
                
                    
              db.get().then((querySnapshot)=>{                    
                  let docarray = [];        
                      querySnapshot.forEach((doc)=>{   
                            docarray.push({
                                name: doc.data().callerName,    
                                key: doc.id,
                                date:doc.data().date,
                                duration:doc.data().duration
    
                            })    
                       });                      
                  this.setState({                  
                      history:docarray,
                      noHistory:docarray.length > 0?false:true
                  })  
                      
                  
              },(err)=>alert('error reading dataBase'),()=>alert('completes'))
                
            });   


        
       
        }).catch((err)=>{
          ///
        })   

       
    }    


    

    
    render(){
        return(          
          <Container style={{backgroundColor:Colors.containers}}>    
                      <Toolbar 
                         title='Call History'
                         canGoBack
                         goBack={()=>this.props.navigation.goBack()}
                      />                    
                      {this.state.history.length > 0?
                          <ListWithImage 
                          rightItem={true}
                          onPress={()=> ''}
                          iconRightName='call'
                          format
                          data = {this.state.history}
                          iconColor={Colors.iconRedColor}   
                          showItem={["name","date","key","duration"]}
                        />
                     
                      :
                       !this.state.noHistory?     
                        <Loading show={true}/>
                     :  <Loading show={false} text="No History"/>
                      }
          </Container>
        )
    }
}                                                