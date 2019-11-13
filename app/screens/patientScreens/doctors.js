import React,{Component} from 'react'
import {View,Container,Text,Input,Title,Spinner,Icon,Button,ListItem,Body,Right,H3,Left,Header,Card} from 'native-base'
import * as firebase from 'react-native-firebase';
import Toolbar from '../../components/Toolbar/Toolbar';
import {Loading} from '../../components/Loader/loader';
import {ListWithImage} from '../../components/RenderList/ListComponents'
import {Colors} from '../../styles/index'
import References from '../../Utils/refs'
import DefaultCustoms from '../../Utils/strings';

export default class Doctors extends Component {
    constructor(props){
        super(props);

    }
    
    state = {
       data:this.props.navigation.state.params,
       accountType:'patient',
       doctors:[
           
        ],
      noDoctors:false,
    }       


    

   async componentDidMount(){  

      //get doctors using hospitals keys.

      var database = firebase.firestore();       

      var db = database.collection("Doctors").where('hospitalId',"==",this.state.data.key);

    
              
      db.onSnapshot((querySnapshot)=>{        
        let docarray = [];     
            querySnapshot.forEach(function(doc) {
                  let info = {
                    name: doc.data().firstName + ' ' + doc.data().lastName,
                    uid: doc.id ,
                    worth:doc.data().worth,
                    youtube:doc.data().youtube?doc.data().youtube:[],
                    bio:doc.data().bio?doc.data().bio:'',
                    avatar:doc.data().avatar?doc.data().avatar:'',
                    paused:doc.data().paused,
                    incomplete:false,
                    location:doc.data().location,
                    occupation:doc.data().occupation,
                    hospitalId:doc.data().hospitalId
                }  

                  if(!info.name || info.youtube.length < 1 || !info.bio || !info.avatar){
                      info.incomplete = true;
                  }



                 if(info.paused || info.incomplete){
                     //do nothing
                 }else{
                    docarray.push(info)
                 }
             });                              
        this.setState({                  
            doctors:docarray,
            noDoctors:docarray.length < 1 ? true:false,
        })    
         
        
    },(err)=>alert('error reading dataBase'),()=>alert('completes'))
    }    
    // ,,,,
    //Navigate to set appointments with user credentials
    nextNavigation(param){

        this.props.navigation.navigate('SetAppointMent',param);
    }


    showLoadingStatus(){
        if(this.state.noDoctors){
            return(
                <View style={{flex:1,justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                    <Text>No Doctor Available</Text>
                </View>
            )
        }
        return <Loading show={true}/>
    }

   
    
    render(){
            
        return(          
          <Container style={{backgroundColor:Colors.containers}}>    
                    <Toolbar canGoBack goBack={()=>this.props.navigation.goBack()} title={DefaultCustoms.DoctorsList}/>               
                    {this.state.doctors.length > 0?
                        <ListWithImage 
                        data = {this.state.doctors}
                        onPress={(item)=> this.nextNavigation(item)}
                        iconColor={Colors.darkText}    
                        showItem={["name"]}
                        location
                        locationProp="location"
                        noDoctors={this.state.noDoctors}
                        textPropertyName={'worth'}
                        iconRightName="logo-usd"
                        iconText= 'worth'
                      />
                      :
                      
                      this.showLoadingStatus()
                    }
          </Container>
        )
    }
}                                                