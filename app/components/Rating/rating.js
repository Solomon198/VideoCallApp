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
        editable:false
    }  
    
     ref   = fireStore.collection("Rating");

  

  
    
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

     
    

      toggleScreens(){
          this.setState({showRating:!this.state.showRating})
      }

    


      submitSuggesstion(){
          fireStore.collection("Suggestions")
          .add({
              docId:this.props.docId,
              userId:this.props.userId,
              suggesstion:this.state.suggesstion,
              rating:this.state.rating
            }).then(()=>{
                this.props.dismissModal();
            })
      }


      saveRating(userId,docId){
        let path = userId+ "_" +docId
              fireStore.collection("Rating").doc(path).set({
                  userId:userId,
                  docId:docId,
                  rating:this.state.rating
              }).then(()=>{
                  this.getAverageRating(docId);
              })
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
          const {rating,suggesstion} = this.state;
          if(!rating && !suggesstion.trim()){
               toast("Please rate or make a suggesstion to submit feedback")
          }else if(rating && !suggesstion.trim()){
               toast("submit rating");
               this.props.dismissModal();
               this.patientDontReportCall();
          }else if(!rating && suggesstion.trim()){
               toast("submit suggestion");
               this.submitSuggesstion();
               this.patientDontReportCall();
          }else{
              toast("submit all");
              this.submitSuggesstion();
              this.patientDontReportCall();
          }
          
      }
  

      saveReports(data){
        let access = this.props.userId+"_"+this.props.docId;
        let tempCoins = firebase.firestore().collection('tempCoins').doc(access);
        let transactionRef = firebase.firestore().collection("TransactionInfo").doc(access);
        firebase.firestore().collection("Reports").add(data);
        this.props.dismissModal();
        tempCoins.delete();
        transactionRef.delete();
        toast("Report sent we will look into it")
      }


      showProgress(){
       
    } 



    cancelOption(){
        this.patientDontReportCall();
        this.props.dismissModal()
    }

    
    patientDontReportCall(){
        const patId = this.props.userId;
        let access = this.props.userId+"_"+this.props.docId;
        let coins = this.props.data.paid;
        let transactionRef = firebase.firestore().collection("TransactionInfo").doc(access);
                transactionRef.get().then((val)=>{
                    if(val.exists){
                        const {
                            docReported,
                            donationPercentage,
                            docId,
                            charityId,
                            audioPath,
                            docReport,
                            doctorName,
                            charityName,
                        } = val.data();
                        if(docReported){
                            let data = {
                                patId:this.props.userId,
                                patReport:"",
                                donationPercentage:donationPercentage,
                                docId:docId,
                                charityId:charityId,
                                audioPath:audioPath,
                                docReport:docReport,
                                isResolved:false,
                                coins:this.props.data.paid,
                                reportedBy:1,
                                timeStamp:new Date().getTime(),
                                hospitalId:this.props.data.hospitalId
                                
                            }
                            this.saveReports(data)
                        }else{
                             //perform doctor normal transaction



                             //node holds doctor total donations for purpose of top doctors
                             let donationRef = firebase.firestore().collection('donation').doc(docId);

                             let charityMoneyRef = firebase.firestore().collection('charities').doc(charityId);

   


                             //node holds user total amount of coins i.e coins balance
                             let ref = firebase.firestore().collection('doctors').doc(this.props.data.hospitalId).collection('credentials').doc(docId);


                             let hospitalRef = FB.collection("Hospitals").doc(this.props.data.hospitalId);


                            
                             //compile each doctors donation to each charity so that doctor can know donation he made on certain charity when doctor checks donations
                             let refDontations = firebase.firestore().collection('doctors').doc("doctorsDonationTrack").collection(docId).doc(charityId);
                             
                             let charityMoney = (parseInt(donationPercentage)/100)*(parseInt(this.props.data.paid));

   
                             charityMoneyRef.get().then((snapshot)=>{
                                  let money = parseInt(snapshot.data().donation);
                                  let tMoney = money + charityMoney;
                                  charityMoneyRef.update({donation:tMoney})
                             })
                            
                             refDontations.get().then((snapshotVal)=>{
                                if(snapshotVal.exists){
                                    let amount = snapshotVal.data().amount +charityMoney;
                                    refDontations.set({name:charityName,amount:amount,key:charityId});
                                }else{
                                    refDontations.set({amount:charityMoney,key:charityId,name:charityName})
                                }
                            }).catch(err=>{  
                                console.log('err: '+err)
                            })

                             donationRef.get().then((snapshot)=>{
                                 let donationAmount = snapshot.exists?snapshot.data().totalDonations:0;
                                 let _totalDonation = parseInt(donationAmount) + parseInt(charityMoney);
                                 donationRef.set({name:doctorName,doctorKey:docId,totalDontions:_totalDonation}).then(()=>{
                                
                                 })
                             })

                             ref.get().then((onSnapshot)=>{
                                 let userMoney = onSnapshot.data().amount?onSnapshot.data().amount:0;
                                 let userNewBalance = ((parseInt(this.props.data.paid) - charityMoney)) + userMoney;

                                 let hospMoney = parseInt(this.props.data.paid) - charityMoney
                                 hospitalRef.get().then((val)=>{
                                    let earnings = val.data().earnings;
                                    let total = earnings + hospMoney;
                                    hospitalRef.update({earnings:total})
                                    
                                })


                                 ref.update({amount:userNewBalance});
                                 this.props.dismissModal();
                                 transactionRef.delete();
                             })
                       }
                    }else{
                        //submit user credentials to temp
                       //++++++++++++++++++++++++==
                        transactionRef.set({
                            patId:patId,
                            coins:this.props.data.paid,
                            patReported:false
                        })

                        this.props.dismissModal();
                    }
                })
        
    }
    
    
    patientReportCall(){//remember disable editing before this call
        let access = this.props.userId+"_"+this.props.docId;
        let transactionRef = firebase.firestore().collection("TransactionInfo").doc(access);

        transactionRef.get().then((val)=>{
                    if(val.exists){
                        const {
                            docReported,
                            donationPercentage,    
                            docId,
                            charityId,
                            audioPath,
                            docReport,
                            charityName,
                            doctorName,
        
                        } = val.data();
                        if(docReported){
                            let data = {
                                patId:this.props.userId,
                                patReport:this.state.report,
                                donationPercentage:donationPercentage,
                                docId:docId,
                                charityId:charityId,
                                audioPath:audioPath,
                                docReport:docReport,
                                isResolved:false,
                                coins:this.props.data.paid,
                                reportedBy:3,
                                timeStamp:new Date().getTime(),
                                charityName:charityName,
                                doctorName:doctorName,
                                hospitalId:this.props.data.hospitalId
                            }
                            this.saveReports(data)
                        }else{
                            let data = {
                                patId:this.props.userId,
                                patientReport:this.state.report,
                                donationPercentage:donationPercentage,
                                docId:docId,
                                charityId:charityId,
                                audioPath:"",
                                docReport:"",
                                isResolved:false,
                                coins:this.props.data.paid,
                                reportedBy:2,
                                timeStamp:new Date().getTime(),
                                hospitalId:this.props.data.hospitalId
                            }
  

                            let fileName = this.props.userId+""
                            let path =  RNFS.ExternalStorageDirectoryPath+"/Call/"+fileName.trim()+".mp4";
                            this.uploadVidz(path).then((downloadURL)=>{
                                data["audioPath"] = downloadURL;
                                this.saveReports(data);
                            })
                        }
                    }else{   
                            //working                     
                           let patientInfo = {
                            hospitalId:this.props.data.hospitalId,
                            coins:this.props.data.paid,
                            patReported:true,
                            patId:this.props.userId,
                            patReport:this.state.report,
                            audioPath:"",
                            
                           }
                           let fileName = this.props.userId+""
                           let path =  RNFS.ExternalStorageDirectoryPath+"/Call/"+fileName.trim()+".mp4";
                           this.uploadVidz(path).then((downloadURL)=>{
                               patientInfo["audioPath"] = downloadURL;
                               transactionRef.set(patientInfo);
                               this.props.dismissModal();
                           })
        
                    }
                })
        
    }

    
    



    ratingContainer(){
        if(this.state.showRating){
            return(
               <View style={{flex:1}}>
                  <Header style={styles.header} androidStatusBarColor={Colors.primary}>
                <Left>
                    <MaterialIcons name="feedback" style={styles.icon}/>
                </Left>
                <Body>
                  <Title style={styles.title}>Feedback</Title>
                </Body>
                <Right>
                    <Button onPress={()=>this.toggleScreens()} rounded primary style={{backgroundColor:Colors.primary}}>
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
                value={this.state.suggesstion} rowSpan={5} onChangeText={(text)=>this.suggesstion(text)} placeholder="..."/>
          

          <View style={styles.seperator}></View>
          <Text note style={styles.text}>How was the call quality ? </Text>
            <AirbnbRating
                count={5}
                defaultRating={this.state.rating}
                size={30}
                onFinishRating={(val)=> this.setState({rating:val},()=>this.saveRating(this.props.userId,this.props.docId))}
                />   
           <View style={styles.btnActions}>
                
                <Button bordered rounded onPress={()=>this.cancelOption()} iconRight  primary block style={styles.btn}>
                    <Text style={styles.textStyle}>Cancel</Text>
                    <Icon style={styles.textStyle} name='close-circle' />
                </Button>
                <Button bordered rounded onPress={()=>this.submitRating()} iconRight  primary block style={styles.btn}>
                    <Text style={styles.textStyle}>Done</Text>
                    <Icon style={styles.textStyle} name='thumbs-up' />
                </Button>
            </View>
          </Form>   
               </View>
                
            )
        }else{
            return(
                <View style={{flex:1}}>
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
                <Button   disabled={this.state.editable} bordered rounded onPress={()=>this.setState({editable:true},()=>{
                    this.patientReportCall();
                })} iconRight  primary block style={styles.btn}>
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