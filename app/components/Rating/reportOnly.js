import React,{Component} from 'react'
import {Container,Text,Icon,Button,H3,Textarea,Form,Header,Left,Body,Right,Title,Spinner,H1,Modal} from 'native-base'
import {AsyncStorage,StyleSheet,View,
    BackHandler,} from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import Toolbar from '../Toolbar/Toolbar';
import { Colors, Typography } from '../../styles/index';
import { toast } from '../toast';
import MaterialIcons from '../icons/material';
import firebase, { Firebase } from 'react-native-firebase'
import { startRecorder ,stopRecorder,convertToMp3} from '../../Utils/functions';
import References from '../../Utils/refs'
import DefaultCus from '../../Utils/strings'
const fireStore = firebase.firestore();
var RNFS = require('react-native-fs');
const storage = AsyncStorage;

export default class ReportComponent extends Component {
   
    state = {   
        
        suggesstion:"",
        report:"",
        showRating:true,
        rating:0,
        average:null,
        uploading:0,
        editable:false
    }  
    
     ref   = fireStore.collection(References.CategoryFour);

  

     uploadVidz(file){
      return new Promise((resolve,reject)=>{
          toast("upload started")
          convertToMp3(file).then((mp3File)=>{
              let time = new Date().getTime().toString();
              firebase.storage().ref('/Records/'+this.props.docId+"_"+time).putFile(mp3File).on(firebase.storage.TaskEvent.STATE_CHANGED,(snapshot)=>{
                  let percentageUploaded = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
                  let transfered = Math.round(percentageUploaded);
                  this.setState({uploading:transfered});
                  switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                      toast('Upload is paused');
                      break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                      toast('Upload is running '+ transfered+'%');
                      break;
                  }
                },(err)=>{
                    toast(err.message);
                    reject(err)
                },(complete)=>{
                   let downloadURL  = complete.downloadURL;
                   resolve(downloadURL)
                })
          }).catch((err)=>{
              toast(err.message)
          })
    
      })
      
    }
    



  report(text){
    if(text.length > 800){
      return  toast("Maximnum characters exceeded")
    }
    this.props.setReportText(text);
}


    componentWillUnmount(){

    }
     
     

     
  

      saveReports(data){
        firebase.firestore().collection("Reports").add(data);
        this.props.dismissModal();
        toast("Report sent we will look into it")
      }


      showProgress(){
       
    } 


   
    

    
    



    ratingContainer(){
          return ( <View style={{flex:1}}>
                    {this.showProgress()}
                <Header style={styles.header} androidStatusBarColor={Colors.primary}>
                <Left>
                    <MaterialIcons name="report" style={styles.icon}/>
                </Left>
                <Body>
                  <Title style={styles.title}>Report</Title>
                </Body>
               
          </Header>
          <Form style={{flex:1,marginLeft:10,marginRight:10,backgroundColor:Colors.containers}}>
         

          <H3 note style={styles.text}>What went wrong ?</H3>
          <Text note>{this.state.report.length}/800</Text>
            <Textarea 
                editable={!this.state.editable}
                style={styles.textArea}
                rowSpan={5} 
                onChangeText={(text)=> {if(text.length > 800){
                    return  toast("Maximnum characters exceeded")
                  }
                  
                  this.props.setReportText(text)}} placeholder="..."/>
          
           {this.state.editable?<View style={styles.seperator}></View>:<Text></Text>}
           
           {this.state.editable?
           <View >
           <View style={{justifyContent:'center',alignContent:'center',alignItems:'center',backgroundColor:'white'}}>
                <View style={{justifyContent:'center',width:150,height:150,borderColor:Colors.primary,borderWidth:4,borderRadius:100,alignContent:'center',alignItems:'center'}}>
                    <View style={{justifyContent:'center',width:140,height:140,borderColor:Colors.primary,borderWidth:2,borderRadius:100,alignContent:'center',alignItems:'center'}}>
                          <H1 style={{fontWeight:'bold',fontSize:40,lineHeight:70,color:Colors.primary}}>{this.state.uploading}%</H1>
                          {/* <Spinner color={Colors.primary} style={{position:'absolute',bottom:0}} /> */}
                    </View>
                </View>
            </View>
            <View style={{marginLeft:15,marginRight:15}}>
                <Text style={{textAlign:'center'}} note>Please wait...</Text>
                <Text style={{textAlign:'center'}} note>Uploading call and other information. we will look into it</Text>
            </View>
           </View>
           :<Text></Text>
           }
          <View style={styles.btnActions}>
                
                <Button  bordered rounded onPress={()=>this.props.cancelReport()} iconRight  primary block style={styles.btn}>
                   <Icon style={styles.textStyle} name='arrow-back' />
                    <Text style={styles.textStyle}>Back</Text>
                </Button>
                <Button   bordered rounded onPress={()=>this.setState({editable:true},()=>{
                    this.uploadVidz(this.props.audioPath).then((val)=>{
                        this.props.setAudioPath(val);
                        this.props.cancelReport();
                        toast("Please press submit to send all information");
                    });
                })} iconRight  primary block style={styles.btn}>
                    <Text style={styles.textStyle}>Report</Text>
                    <Icon style={styles.textStyle} name="arrow-forward" />
                </Button>
            </View>
          </Form>
          
          </View>
            )
    }



   
    

   goBack(){
       this.props.navigation.navigate('DoctorStack')
   }

   report(text){
    if(text.length > 800){
      return  toast("Maximnum characters exceeded")
    }
    this.setState({report:text});
}
    suggesstion(text){
        if(text.length > 500){
          return  toast("Maximnum characters exceeded")
        }
        this.setState({suggesstion:text});
    }
    render(){
            
        return(          
          <Container style={styles.container}> 
               
                 {this.ratingContainer()}
                 
               
          </Container>
        )
    }
}        
  
const styles = StyleSheet.create({
    title:{color:Colors.white,fontWeight:'bold'},
     icon:{
       color:Colors.white,
       alignSelf:"center",
       fontSize:Typography.iconFontSize
     },
     header: {backgroundColor:Colors.primary},
    seperator:{
        height:50
    },
    textArea:{
       borderColor:Colors.borderColor,
       borderWidth:1,

    },
    container:{
        flex:1,
        backgroundColor:Colors.containers,
    },
    donationContainer:{
        flex:1,
        justifyContent:'center',
        borderTopColor:Colors.overLay,
        borderTopWidth:1,
        marginLeft:10,
        marginRight:10
    },
    sliderValue:{
        textAlign:'center',
        fontWeight:'bold',
        color:Colors.baseText,
        textAlign:'center'
    },
    btn:{
        marginLeft:5,
        marginTop:15,
        marginRight:5,
        marginBottom:5,
        borderColor:Colors.primary,
        // backgroundColor:Colors.overLay,
        width:'48%'
    },
    btnActions:{
       flexDirection:'row',
       width:'100%'},
   textStyle:{
       color:Colors.primary
    },
   text:{
       fontWeight:'bold', 
       marginTop:10,
       marginLeft:5,
       fontSize:Typography.largeHeaderFontSize,
       color:Colors.primary,
       marginTop:10,
       marginBottom:20
   },
   subContainer:{
       flex:1,
       justifyContent:'center',

   },
  
  
})