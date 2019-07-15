import React,{Component} from 'react'
import {View,Container,Text,Input,Title,Spinner,Icon,Button,ListItem,Body,Right,H3,Left,Header,Card} from 'native-base'
import * as firebase from 'react-native-firebase';
import Toolbar from '../../components/Toolbar/Toolbar';
import {Loading} from '../../components/Loader/loader';
import {ListWithImage} from '../../components/RenderList/ListComponents'
import {Colors} from '../../styles/index'

export default class Doctors extends Component {
    constructor(props){
        super(props);

    }
    
    state = {
       data:this.props.navigation.state.params,
       accountType:'patient',
       doctors:[
           
        ]

    }       


    

    componentDidMount(){  

      //get doctors using hospitals keys.

      var database = firebase.firestore();       
 
      var db = database.collection("doctors").doc(this.state.data.hospital.key).collection('credentials')
             
              
      db.get().then((querySnapshot)=>{        
        let docarray = [];    
            querySnapshot.forEach(function(doc) {
                                    
                  docarray.push({
                      name: doc.data().firstName + ' ' + doc.data().lastName,
                      key: doc.id ,
                      price:doc.data().price,
                      youtube:doc.data().youtube?doc.data().youtube:[],
                      bio:doc.data().bio?doc.data().bio:'',
                      photo:doc.data().photo?doc.data().photo:''
                  })               
             });                              
        this.setState({                  
            doctors:docarray  
        })    
         
        
    },(err)=>alert('error reading dataBase'),()=>alert('completes'))
    }    

    //Navigate to set appointments with user credentials
    nextNavigation(param){
        this.props.navigation.navigate('SetAppointMent',{doctor:param,data:this.state.data});
    }

   
    
    render(){
            
        return(          
          <Container style={{backgroundColor:Colors.containers}}>    
                    <Toolbar canGoBack goBack={()=>this.props.navigation.goBack()} title='Doctors'/>               
                    {this.state.doctors.length > 0?
                        <ListWithImage 
                        rightItem={true}
                        iconText={true}
                        iconRightName='logo-usd'
                        data = {this.state.doctors}
                        onPress={(item)=> this.nextNavigation(item)}
                        textPropertyName={'price'}
                        iconColor={Colors.iconColor}   
                        showItem={["name","key"]}
                      />
                      :
                      <Loading show={true}/>
                    }
          </Container>
        )
    }
}                                                