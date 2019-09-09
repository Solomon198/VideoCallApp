import React,{Component} from 'react'
import {Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage} from 'react-native'
import Toolbar from '../../components/Toolbar/Toolbar';
import { ListWithImage } from '../../components/RenderList/ListComponents';
import { Loading } from '../../components/Loader/loader';
import { Colors } from '../../styles';
import References from "../../Utils/refs"
import DefaultCustoms from '../../Utils/strings'

const storage = AsyncStorage;


export default class DocHistory extends Component {
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
    
    

              
    componentDidMount(){
        storage.getItem('user').then((val)=>{
            let data = JSON.parse(val);
            this.setState({user:data},()=>{
                var database = firebase.firestore();    
                var db = database.collection(References.CategorySeven).doc(data.key).collection('history').limit(100);
                       
                
                    
              db.get().then((querySnapshot)=>{              
                  let docarray = [];    
                      querySnapshot.forEach(function(doc) {   
                          
                            docarray.push({
                                callerName: doc.data().callerName,    
                                key: doc.id,
                                duration:doc.data().duration,
                                date:doc.data().date,
       
                            })    
                       });          
                  this.setState({                  
                      history:docarray,
                      noHistory:docarray.length > 1?false:true
                  })
                   
                  
              },(err)=>alert('error reading dataBase'),()=>alert('completes'))
                
            });   


        
       
        })       

       
    }    


    

    
    render(){
        return(          
          <Container style={{backgroundColor:Colors.containers}}>    
                     <Toolbar
                        canGoBack
                        goBack={()=>this.props.navigation.goBack()}
                        title={DefaultCustoms.CallHistoryPage}/>                     
                      {this.state.history.length > 0?
                          <ListWithImage 
                          rightItem={true}
                          onPress={()=> ''}
                          moment={false}
                          location
                          format
                          dateRight
                          data = {this.state.history}
                          iconColor={Colors.iconRedColor}   
                          showItem={["name","duration"]}
                        />
                       :
                       !this.state.noHistory?     
                        <Loading show={true}/>
                     :<Loading text='No history' show={false}/>
                      }
          </Container>
        )
    }
}                                                