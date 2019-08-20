import React,{Component} from 'react'
import {Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage} from 'react-native'
import Toolbar from '../../components/Toolbar/Toolbar';
import { Colors } from '../../styles';
import { ListWithIcon, ListWithImage } from '../../components/RenderList/ListComponents';
import { Loading } from '../../components/Loader/loader';

const storage = AsyncStorage;

export default class Hospitals extends Component {
    constructor(props){
        super(props);

    }
    
    state = {
       hospitals:[
          
        ],
        user:false

       

    }       

    
    componentDidMount(){
        // console.error(this.state.userInfo)
        storage.getItem('user').then((val)=>{
            let data = JSON.parse(val);
            this.setState({user:data});
        })

        var database = firebase.firestore();    
 
      var db = database.collection("Hospitals")
             
           
          
    db.get().then((querySnapshot)=>{                 
        let docarray = [];    
            querySnapshot.forEach(function(doc) {
                
                  docarray.push({
                      name: doc.data().name,
                      key: doc.id
                  })    
             });                      
        
        this.setState({                  
            hospitals:docarray
        })
         
        
    },(err)=>alert('error reading dataBase'),()=>alert('completes'))
            
    }    

      
    nextNavigation(param){
        this.props.navigation.navigate('Login',{accountType:'doctor',hospital:param})
    }
   
   
    
    render(){
    let name = this.state.user?this.state.user.name:''
        return(          
          <Container style={{backgroundColor:Colors.white}}>    
                      <Toolbar title='Hospitals'/>                      
                      {this.state.hospitals.length > 0?
                      <ListWithImage
                        data = {this.state.hospitals}
                        onPress={(item)=>this.nextNavigation(item)}
                        iconLeftName='medical'
                        iconColor={Colors.iconColor}
                        showItem ={['name']}
                       />
                    :
                      <Loading show={true}/>
                      }
          </Container>
        )
    }
}                                                