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
import { convertToMp3 } from '../../Utils/functions';
import References from '../../Utils/refs'
import NavigationService from '../../Navigation/navigationService'
import DefaultCus from '../../Utils/strings'
import axios from 'axios'
import { API_PREFIX} from 'react-native-dotenv'
const fireStore = firebase.firestore();
var RNFS = require('react-native-fs');

const storage = AsyncStorage;

export default class Ratings extends Component {
   
    state = {   
        
        suggesstion:"",
        report:"",
        showRating:true,
        rating:0,  
        average:null,
        uploading:0,
        url:"http://blahblahblah",
        editable:false,
        saving:false
    }  
    
     ref   = fireStore.collection(References.CategoryFour);

  

   
    
  uploadVidz(file){
      
  }

     
    

      toggleScreens(){
          this.setState({showRating:!this.state.showRating})
      }



      componentDidMount(){

    } 
    


      submitSuggesstion(){
         
      }


      saveRating(userId,docId){
       
    }

      getAverageRating(docId){
          this.ref.where("docId","==",docId).onSnapshot((val)=>{
            let arr = [];
            val.forEach(function(doc){
                arr.push({
                    docId:doc.data().docId,
                    userId:doc.data().userId,
                    rating:doc.data().rating
                })
            })
            const ratings = arr.map((val,index)=>val.rating);
            let totalVal =  ratings.reduce((total,value)=> parseInt(total)+parseInt(value));
            let average = totalVal/ratings.length;
            this.setState({average:average})
          })

        
      }


      submitRating(){
         
          
      }
  

    


      showProgress(){
       
    } 


    async  saveFeedBack(){
        if(!this.state.suggesstion.trim() || !this.state.rating) return toast("Please fill all fields")
        try{
            this.setState({saving:true})
            const saveSuggestionAndRating = await axios.post(API_PREFIX+'transaction/patientFeedBack',{payload:this.props.data,suggestion:this.state.suggesstion,rating:this.state.rating});
            this.setState({saving:false})
            const {message,status} = saveSuggestionAndRating.data;

            if(status == 'Success'){
                 NavigationService.navigate("PatientStack")
    }else{
                toast(message);
            }

        }catch(e){  
            toast(e.message)
            this.setState({saving:false})
        }
    }

    
    async  saveReport(){
        if(!this.state.url || !this.state.report.trim())return toast('Please write a problem description')
        try{
            this.setState({saving:true})
            const saveSuggestionAndRating = await axios.post(API_PREFIX+'transaction/patientReport',{payload:this.props.data,audioUrl:this.state.url,rating:this.state.rating,suggestion:this.state.suggesstion,patientReport:this.state.report});
            this.setState({saving:false})
            const {message,status} = saveSuggestionAndRating.data;
            if(status == 'Success'){
                 NavigationService.navigate("PatientStack")
            }else{
                alert(message)
                toast(message);
            }    

        }catch(e){
            toast(e.message)
            this.setState({saving:false})
        }
    }


    async  done(){
        if(!this.state.url || !this.state.report.trim())return toast('Please write a problem description')
        try{
            this.setState({saving:true})
            const saveSuggestionAndRating = await axios.post(API_PREFIX+'Users/done',{payload:this.props.data,patient:true,doctor:false});
            this.setState({saving:false})
            const {message,status} = saveSuggestionAndRating;
            if(status == 'Success'){
                this.props.navigation.navigate('PatientStack');
            }else{
                toast(message);
            }

        }catch(e){
            toast(e.message)
            this.setState({saving:false})
        }
    }




    
    



    ratingContainer(){
        if(this.state.showRating){
            return(
               <View style={{flex:1}}>
                   {
                       this.state.saving?
                       <View style={{flex:1,position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'center',zIndex:10,backgroundColor:'rgba(0,0,0,0.5)'}}>
                           <Spinner />
                   </View>:null
                   }
                  <Header style={styles.header} androidStatusBarColor={Colors.primary}>
                <Left>
                    <MaterialIcons name="feedback" style={styles.icon}/>
                </Left>
                <Body>
                  <Title style={styles.title}>Feedback</Title>
                </Body>
                <Right>
                    <Button disabled={this.state.saving} onPress={()=>this.toggleScreens()} rounded primary style={{backgroundColor:Colors.primary}}>
                         <MaterialIcons name="report" style={styles.icon}/>
                        <Text>Report</Text>
                    </Button>
                </Right>
          </Header>
          <Form style={{flex:1,marginLeft:10,marginRight:10,backgroundColor:Colors.containers}}>
         
         
         
          <H3 note style={styles.text}>Suggesstion</H3>
          <Text note>{this.state.suggesstion.length}/500</Text>
            <Textarea 
                style={styles.textArea}
                editable={this.state.saving?false:true}
                value={this.state.suggesstion} rowSpan={5} onChangeText={(text)=>this.suggesstion(text)} placeholder="..."/>
          

          <View style={styles.seperator}></View>
          <Text note style={styles.text}>How was the call quality ? </Text>
            <AirbnbRating
                count={5}
                defaultRating={this.state.rating}
                size={50}
                onFinishRating={(val)=> this.setState({rating:val})}
                />   
                
                {/* <Button disabled={this.state.saving} bordered rounded onPress={()=>this.saveFeedBack()} iconRight  primary block style={styles.btn}>
                    <Text style={styles.textStyle}>Cancel</Text>
                    <Icon style={styles.textStyle} name='close-circle' />
                </Button> */}
                <Button disabled={this.state.saving} bordered rounded onPress={()=>this.saveFeedBack()} iconRight  primary block style={[{marginTop:40}]}>
                    <Text style={styles.textStyle}>Submit Feedback</Text>
                    <Icon style={styles.textStyle} name='thumbs-up' />
                </Button>

          </Form>   
               </View>
                
            )
        }else{
            return(
                <View style={{flex:1}}>
                     {
                       this.state.saving?
                       <View style={{flex:1,position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'center',zIndex:10,backgroundColor:'rgba(0,0,0,0.5)'}}>
                           <Spinner />
                   </View>:null
                   }
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
                value={this.state.report} rowSpan={5} onChangeText={(text)=>this.report(text)} placeholder="..."/>
          
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
                
                <Button disabled={this.state.editable} bordered rounded onPress={()=>this.toggleScreens()} iconRight  primary block style={styles.btn}>
                   <Icon style={styles.textStyle} name='arrow-back' />
                    <Text style={styles.textStyle}>Back</Text>
                </Button>
                <Button   disabled={this.state.editable} bordered rounded onPress={()=>this.saveReport()} iconRight  primary block style={styles.btn}>
                    <Text style={styles.textStyle}>Report</Text>
                    <Icon style={styles.textStyle} name="arrow-forward" />
                </Button>
            </View>
          </Form>
          
          </View>
            )
        }
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