import React,{Component} from 'react'
import {Container,Text,Icon,Button,H3,Textarea,Form,Header,Left,Body,Right,Title,Spinner,H1,Modal,ListItem,} from 'native-base'
import {AsyncStorage,StyleSheet,View,Slider,
    BackHandler,FlatList,ScrollView} from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import Toolbar from '../Toolbar/Toolbar';
import { Colors, Typography } from '../../styles/index';
import { toast } from '../toast';
import MaterialIcons from '../icons/material';
import firebase, { Firebase } from 'react-native-firebase'
import { convertToMp3 } from '../../Utils/functions';
import References from '../../Utils/refs'
import DefaultCus from '../../Utils/strings'
import axios from 'axios'
import { API_PREFIX} from 'react-native-dotenv'
import NavigationService from '../../Navigation/navigationService'
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
        url:"http:blablabal",
        editable:false,
        saving:false,
        charityId:'',
        docPercentage:10,
        charityName:'',
        charities:[],
        showCharity:false
    }  
    
     ref   = fireStore.collection(References.CategoryFour);

  

  
    
  uploadVidz(file){
      
  }

     
    

      toggleScreens(){
          this.setState({showRating:!this.state.showRating})
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

   componentDidMount(){
    fireStore.collection('Charity').get().then((snapshot)=>{
        let docarray = [];
        snapshot.forEach((snap)=>{
            docarray.push({
                name:snap.data().name,
                charityId:snap.id
            })
        })
        this.setState({charities:docarray});
    })
         
    } 



    charityVIew(){
        return(
          <View>
              <H3 note style={[{marginTop:20,color:Colors.primary,fontWeight:'bold',marginLeft:10}]}>Donate %{this.state.docPercentage}</H3>
              <Slider 
                 onSlidingComplete={(value)=> value > 10 ?this.setState({docPercentage:parseInt(value)}):this.setState({docPercentage:10}) }
                 value={this.state.docPercentage}
                 maximumValue={100} 
                 maximumTrackTintColor={Colors.primary}
                 minimumTrackTintColor={Colors.primary}
                 minimumValue={0}/>

                <View style={{flexDirection:'row',marginTop:20}}>
                    <Button onPress={()=>this.setState({showCharity:true})} style={{marginLeft:10,marginVertical:5}} bordered>
                     <Text>
                         select charity
                     </Text>
                  </Button>
                  <Text style={{marginTop:20,marginLeft:10}}>{this.state.charityName}</Text>
                </View>
          </View>
        )
    }

    async  saveFeedBack(){
        if(!this.state.charityId) return toast("Please select charity to continue");
        try{
            this.setState({saving:true})
            const saveSuggestionAndRating = await axios.post(API_PREFIX+'transaction/doctorFeedBack',{payload:this.props.data,suggestion:this.state.suggesstion,rating:this.state.rating,charityId:this.state.charityId,docPercentage:this.state.docPercentage});
            this.setState({saving:false})
            const {message,status} = saveSuggestionAndRating.data;
            if(status == 'Success'){
                 NavigationService.navigate("DoctorStack")
            }else{
                alert(message)
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
            const saveSuggestionAndRating = await axios.post(API_PREFIX+'transaction/doctorReport',{payload:this.props.data,audioUrl:this.state.url,rating:this.state.rating,doctorReport:this.state.report,charityId:this.state.charityId,docPercentage:this.state.docPercentage});
            this.setState({saving:false})
            const {message,status} = saveSuggestionAndRating.data;
            if(status == 'Success'){
                 NavigationService.navigate("DoctorStack")

            }else{
                toast(message);
            }  

        }catch(e){
            toast(e.message)
            this.setState({saving:false})
        }
    }

    setCharity(item){
        this.setState({
            charityId:item.charityId,
            charityName:item.name,
            showCharity:false
        })
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
          {this.charityVIew()}
          <Form style={{flex:1,marginLeft:10,marginRight:10,backgroundColor:Colors.containers}}>
         
         
         
          {/* <H3 note style={styles.text}>Suggesstion</H3> */}
          {/* <Text note>{this.state.suggesstion.length}/500</Text>
            <Textarea 
                style={styles.textArea}
                editable={this.state.saving?false:true}
                value={this.state.suggesstion} rowSpan={5} onChangeText={(text)=>this.suggesstion(text)} placeholder="..."/>
           */}

          <View style={styles.seperator}></View>
          <Text note style={styles.text}>How was the call quality ? </Text>
            <AirbnbRating
                count={5}
                defaultRating={this.state.rating}
                size={50}
                onFinishRating={(val)=> this.setState({rating:val})}
                />   

                <Button disabled={this.state.saving} bordered rounded onPress={()=>this.saveFeedBack()} iconRight  primary block style={{marginTop:40}}>
                    <Text uppercase={false} style={styles.textStyle}>Send Feedback</Text>
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
          {this.charityVIew()}
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

        if(this.state.showCharity){
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
           <ScrollView>
                {
                    this.state.charities.map((item)=>
                            <ListItem style={{paddingVertical:5}} onPress={()=>this.setCharity(item)}>
                            <Body>
                                <Text style={{fontWeight:'800'}}>{item.name}</Text>
                            </Body>
                        </ListItem>
                    )
                }
           </ScrollView>
          
           </View>
            )
        }
            
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