import React,{Component} from 'react'
import {Container,Text,List,Body, ListItem} from 'native-base'
import * as firebase from 'react-native-firebase';
import {StyleSheet,View,Image,ScrollView} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';

import { Colors, Typography } from '../../styles';
   
const firestore = firebase.firestore();
export default class ViewDocProfile extends Component {
    constructor(props){
        super(props);

    }
      
    state = {   
           data :{},
           visible:false    ,
           showLoader:false,
           balance:'',
           showModal:false,
           photo:'',
           editing:false,
           firstName:'',
           lastName:'',
           occupation:'',
           personalInfo:{},
           longitude:'',
           latitude:'',
           city:'',
           state:'',
           gettingLocation:false,
           location:''
 
    }       

    componentDidMount(){

                        // Get user information from the below references in firebase
                        const docId = this.props.navigation.state.params.key;
                        const hospitalKey= this.props.navigation.state.params.hospitalKey;
                        let $ref = firestore.collection('doctors').doc(hospitalKey?hospitalKey:"C97QHFhCdxJXvGlVGVj2").collection("credentials").doc(docId);

                        $ref.get().then((onSnapshot)=>{
                           if(!onSnapshot.exists)return false;

                           let data;
                           let documentID;
                           data =   onSnapshot.data();
                           documentID = onSnapshot.id
                           this.setState({
                             name:data.firstName?data.firstName+" "+data.lastName:data.name,
                             bio:data.bio,
                             firstName:data.firstName,
                             lastName:data.lastName,
                             location:data.location,
                             photo:data.photo,   
                             documentID:documentID,
                             price:data.price
                           })   
                        })
           
    }      


    //NOTE tenary operator is used in this render methode to toggle edit features on/off during editing and when editing is canceslled or finished
    render(){
            
        return(       
          <ScrollView>
          <Container style={styles.container}> 
              <Toolbar toggleDrawer={()=>this.toggleDrawer()}  bgColor={Colors.primary} /> 
              <View style={styles.topContainer}>
               </View>
               <View style={styles.picContainer}>
                
                 
                
                  <View style={styles.profilePic} >
                   <Image style={styles.imgStyle} source={{uri:this.state.photo}} >
                      
                 </Image>
                    
                  </View>
                
                
              

               </View>    
           

                           
               <View style={styles.subContainer}>
             
                 <List>
                     <ListItem>
                        <Text style={styles.label}>Name</Text>
                        <Body>
                          <Text >{this.state.name}</Text>
                        </Body>
                     </ListItem>
                     <ListItem>
                        <Text style={styles.label}>Bio</Text>
                        <Body>
                          <Text>{this.state.bio}</Text>
                        </Body>
                     </ListItem>
                     <ListItem>
                        <Text style={styles.label}>Location</Text>
                        <Body>
                          <Text>{this.state.location}</Text>
                        </Body>
                     </ListItem>
                     <ListItem>
                       <Text style={styles.label}>Price</Text>
                        <Body>
                          <Text>${this.state.price}</Text>
                        </Body>
                     </ListItem>
                 </List>
        
             
               </View>
             
          </Container>
          </ScrollView>   

        )
    }   
}        

const styles = StyleSheet.create({
  label:{
    fontWeight:'bold'
  },
  greenDot:{
    width:10,
    height:10,
    borderRadius:100,
    backgroundColor:Colors.forestgreen,
    marginRight:5
  },
  mainLocation:{
    alignItems:'center',
    margin:10,
    flex:1,
    alignContent:'center'
  },
  occupation:{
    marginBottom:10,
    fontSize:Typography.baseFontSize,
    textAlign:'center',
    color:Colors.baseText
  },
  userName:{
    fontWeight:'500',
    marginBottom:10,
    fontSize:Typography.largeHeaderFontSize,
    textAlign:'center',
  },
  subContainer:{
    flex:1,
    backgroundColor:Colors.containers
  },
  btnTopSpace:{marginTop:10},
  locationName:{
    fontWeight:'100',
    marginBottom:10,
    fontSize:Typography.baseFontSize,
    marginLeft:5,
  },
  setLocationBtn:{
    borderRadius:10,
    backgroundColor:Colors.containers
  },
  colors:{color:Colors.baseText},
  alignCity:{textAlign:'center'},
  greenLocationDot:{
    width:10,
    height:10,
    borderRadius:100,
    backgroundColor:Colors.forestgreen,
    marginRight:5,
    alignSelf:'center'},
  editLocationStyle:{
    flexDirection:'row',
    alignItems:'center',
    margin:10,
    flex:1,
    alignContent:'center'},
  textAreaStyle:{
    margin:5
  },
  inputStyle:{
    color:Colors.baseText,
    borderColor:Colors.grayCombination,
    borderWidth:1,
    margin:5
  },
  rowInputStyle:{
    flexDirection:'row',
    justifyContent:'center',
    alignContent:'center'
  },
  formContainer:{
    marginRight:10,
    marginBottom:25
  },
  btnBorder:{
    borderColor:Colors.grayCombination
  },
  toggleBtn:{
    position:'absolute',
    top:80,
    right:10,
    marginRight:10,
  },
  cameraIcon:{
    position:'absolute',
    bottom:0,
    right:10,
    backgroundColor:'white',
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center',
    width:40,
    height:40,
    borderRadius:100
  },
  imgStyle:{
    width:120,
    height:120,
    borderRadius:100
  },
  picContainer:{
    alignContent:'center',
    marginTop:-60,
  },
  textColor:{
      fontWeight:'bold',
      color:'#000'
  },
   btn:{
    backgroundColor:Colors.overLay,
    marginBottom:10
   },
   container:{
       flex:1,
       backgroundColor:Colors.containers
   },
   topContainer:{
       height:105,
       justifyContent:'center',
       backgroundColor:Colors.primary,  
       padding:20,
   },
   bottomContainer:{    
       flex:2,
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center',  
       margin:20
   },
   profilePic:{
       height:120,
       width:120,
      //  backgroundColor:'#e9e9e9',
       borderRadius:100,
       alignSelf:'center',
       borderColor:Colors.borderColor,
       borderWidth:2,
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center'
    }
})