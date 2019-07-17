import React,{Component} from 'react'
import {Container,Text,H1,Icon,Button,H3,Header,Body,Left,Title,Right,} from 'native-base'
import {AsyncStorage,StyleSheet,View,Slider,
    BackHandler,} from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { Colors, Typography } from '../../styles';
import firebase from 'react-native-firebase';
import Charity from '../../screens/doctorScreens/charity';
import MaterialIcons from '../../components/icons/material'
import ReportComponent from '../../components/Rating/reportOnly'
import {toast} from '../../components/toast'
import { convertToMp3 } from '../../Utils/functions';
var RNFS = require('react-native-fs');

const fireStore = firebase.firestore();
const storage = AsyncStorage;


export default class Ratings extends Component {
    constructor(props){
        super(props);


    }
    
    state = {   
           data :{},
           visible:false    ,   
           donate:10,
           rating:0,
           donationPercentage:10,
           average:null,
           docKey:"",
           uid:"",
           showCharity:false,
           showReport:false,
           showRating:true,
           charityId:"",
           charityName:"",
           docReport:"",
           audioPath:"",
           doctorName:"",
           hospitalKey:''
 
    }   

    ref   = fireStore.collection("userRating");

  


    saveRating(userId,docId){
        let path = docId+ "_" +userId
              fireStore.collection("userRating").doc(path).set({
                  userId:userId,
                  docId:docId,
                  rating:this.state.rating
              }).then(()=>{
                  this.getAverageRating(userId);
              })
    }

    uploadVidz(file){
        return new Promise((resolve,reject)=>{
            toast("upload started")
            convertToMp3(file).then((mp3File)=>{
                let time = new Date().getTime().toString();
                firebase.storage().ref('/Records/'+this.props.docId+"_"+time).putFile(file).on(firebase.storage.TaskEvent.STATE_CHANGED,(snapshot)=>{
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
                toast(err);
            })
           
        })
        
      }

    showReport(){
        this.setState({
            showReport:true,
            showCharity:false,
            showRating:false,
        })
    }

      getAverageRating(userId){
          this.ref.where("userId","==",userId).onSnapshot((val)=>{
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


      saveReports(data){
        let access = this.state.uid+"_"+this.state.docKey;
        let transactionRef = firebase.firestore().collection("TransactionInfo").doc(access);
        let tempCoins = firebase.firestore().collection('tempCoins').doc(access);

        firebase.firestore().collection("Reports").add(data);
        toast("Report sent we will look into it");
        transactionRef.delete();
        tempCoins.delete();
        this.props.navigation.navigate("DoctorStack");
      }


      doctorReportCall(){//remember disable editing before this call
        let access = this.state.uid+"_"+this.state.docKey;
        const {hospitalKey,docKey,charityId,charityName,doctorName,donationPercentage} = this.state;
        let transactionRef = firebase.firestore().collection("TransactionInfo").doc(access);

                transactionRef.get().then((val)=>{
                    if(val.exists){
                        const {
                            patReported,
                            patId,
                            patReport,
                            audioPath,
                            coins
        
                        } = val.data();
                        if(patReported){
                            let data = {
                                patId:patId,
                                hospitalId:hospitalKey,
                                patReport:patReport,
                                donationPercentage:this.state.donationPercentage,
                                docId:this.state.docKey,
                                charityId:this.state.charityId,
                                audioPath:audioPath,
                                docReport:this.state.docReport,
                                isResolved:false,
                                coins:coins,
                                doctorName:this.state.doctorName,
                                reportedBy:3,
                                timeStamp:new Date().getTime()
                            }
                            this.saveReports(data)
                        }else{
                            let data = {
                                patId:patId,
                                patReport:patReport,
                                hospitalId:hospitalKey,
                                donationPercentage:this.state.donationPercentage,
                                docId:this.state.docKey,
                                charityId:this.state.charityId,
                                audioPath:this.state.audioPath,
                                docReport:this.state.docReport,
                                doctorName:this.state.doctorName,
                                isResolved:false,
                                coins:coins,
                                reportedBy:1,
                                timeStamp:new Date().getTime()
                            }
                            
                                this.saveReports(data);
                        }
                    }else{   

                            let patientInfo = {
                            docReported:true,
                            hospitalId:hospitalKey,
                            docReport:this.state.docReport,
                            donationPercentage:this.state.donationPercentage,
                            docId:this.state.docKey,
                            charityId:this.state.charityId,
                            doctorName:this.state.doctorName,
                            charityName:this.state.charityName,
                            audioPath:this.state.audioPath
                           }
                               transactionRef.set(patientInfo);
                               this.props.navigation.navigate("DoctorStack");

        
                    }
                })
           
        
    }

    submitFeedback(){
        if(this.state.charityName.trim() && this.state.charityId.trim()){
            if(this.state.audioPath && this.state.docReport.trim()){
                this.doctorReportCall()
            }else{
                this.doctorDontReportCall()
            }
        }else{
            toast("Please select charity to submit feedback or report");
        }
    }


       
    doctorDontReportCall(){
        let access = this.state.uid+"_"+this.state.docKey;
        const {hospitalKey,docKey,charityId,charityName,doctorName,donationPercentage} = this.state;
        let transactionRef = firebase.firestore().collection("TransactionInfo").doc(access);

    
                transactionRef.get().then((val)=>{
                    if(val.exists){
                        const {
                            patReported,
                            patId,
                            patReport,
                            audioPath,
                            coins,
                        } = val.data();
                        if(patReported){
                            let data = {
                                hospitalId:hospitalKey,
                                patId:patId,
                                patReport:patReport,
                                donationPercentage:this.state.donationPercentage,
                                docId:this.state.docKey,
                                charityId:this.state.charityId,
                                audioPath:audioPath,
                                docReport:this.state.docReport,
                                isResolved:false,
                                charityName:this.state.charityName,
                                doctorName:this.state.doctorName,
                                coins:coins,
                                reportedBy:2,
                                timeStamp:new Date().getTime()
                            }
                            this.saveReports(data)
                        }else{
                             //node holds doctor total donations for purpose of top doctors
                             let donationRef = firebase.firestore().collection('donation').doc(docKey);
                            
                             let charityMoneyRef = firebase.firestore().collection('charities').doc(charityId);
                             let hospitalRef = firebase.firestore().collection("Hospitals").doc(hospitalKey);

                               
                            
                            
                             //node holds user total amount of coins i.e coins balance
                             let ref = firebase.firestore().collection('doctors').doc(hospitalKey).collection('credentials').doc(docKey);
                            
                            
                            
                            
                                                        
                            //compile each doctors donation to each charity so that doctor can know donation he made on certain charity when doctor checks donations
                                                         let refDontations = firebase.firestore().collection('doctors').doc("doctorsDonationTrack").collection(docKey).doc(charityId);
                                                         
                                                         let charityMoney = (parseInt(donationPercentage)/100)*(parseInt(coins));
                            
                               
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
                                                             donationRef.set({name:doctorName,doctorKey:docKey,totalDontions:_totalDonation}).then(()=>{
                                                            
                                                             })
                                                         })
                            
                                                         ref.get().then((onSnapshot)=>{
                                                             let userMoney = onSnapshot.data().amount?onSnapshot.data().amount:0;
                                                             let userNewBalance = ((parseInt(coins) - charityMoney)) + userMoney;
                            
                                                             let hospMoney = parseInt(coins) - charityMoney
                                                             hospitalRef.get().then((val)=>{
                                                                let earnings = val.data().earnings;
                                                                let total = earnings + hospMoney;
                                                                hospitalRef.update({earnings:total})
                                                                
                                                            })
                            
                            
                                                             ref.update({amount:userNewBalance});
                                                             this.props.navigation.navigate("DoctorStack");
                                                             transactionRef.delete();
                                                         })

                        }
                    }else{
                        //submit user credentials to temp
                       //++++++++++++++++++++++++==
                        transactionRef.set({
                            hospitalId:hospitalKey,
                            docReported:false,
                            docReport:"",
                            donationPercentage:this.state.donationPercentage,
                            docId:this.state.docKey,
                            charityId:this.state.charityId,
                            doctorName:this.state.doctorName,
                            charityName:this.state.charityName
                        })
                        this.props.navigation.navigate("DoctorStack");
                    }
                })
          
        
    }


    componentDidMount(){
            // this.handleBack();
            storage.getItem('user').then((val)=>{
                let data = JSON.parse(val);
                this.setState({data:data,doctorName:data.name,hospitalKey:data.hospitalKey});
            })
            storage.getItem("donationInfo").then((val)=>{
                let data = JSON.parse(val);
                this.setState({uid:data.uid,docKey:data.docKey})
            })
    }    


    
    componentWillUnmount(){

    }
     
      handleBack(){

    }



    



   
    

   goBack(){
       this.props.navigation.navigate('DoctorStack')
   }
    
    render(){
            if(this.state.showRating){
                return (
                    <Container style={styles.container}> 
          <Header style={styles.header} androidStatusBarColor={Colors.primary}>
                <Left>
                </Left>
                <Body>
                  <Title style={styles.title}>Feedback</Title>
                </Body>
                <Right>
                    <Button onPress={()=>this.showReport()} rounded primary style={{backgroundColor:Colors.primary}}>
                         <MaterialIcons name="report" style={styles.icon}/>
                        <Text>Report</Text>
                    </Button>
                </Right>
          </Header>         

          <View style={styles.subContainer}>
                    <H1 style={styles.text}>Experience</H1>
                    <AirbnbRating
                        count={5}
                        defaultRating={this.state.rating}
                        size={30}
                        onFinishRating={(val)=> this.setState({rating:val},()=>this.saveRating(this.state.uid,this.state.docKey))}
                        />   
                   </View>
                   <View style={styles.donationContainer}>
                
                    <H3 style={styles.text}>Donation</H3>
                    <Text style={styles.sliderValue}>{this.state.donationPercentage} %</Text>
                    <Slider   
                        maximumValue={100}
                        step={1}
                        value={this.state.donationPercentage}
                        minimumValue={10}
                        onValueChange={(val)=>this.setState({donationPercentage:val})}
                    />
                   </View>
                   <View style={styles.btnActions}>
                    <Button onPress={()=> this.submitFeedback()} iconRight  primary rounded block style={styles.btn}>
                        <Text >Submit</Text>
                    </Button>
                    <Button onPress={()=>this.setState({showCharity:true,showRating:false,showReport:false})} iconRight  primary rounded block style={styles.btn}>
                        <Text >Charity</Text>
                    </Button>
                   </View>
              </Container>
                )
            };

            if(this.state.showCharity){
                return(
                    <Charity charitySelected={(item)=>this.setState({showCharity:false,showRating:true,charityName:item.name,charityId:item.key})}/>
                )
            }

            if(this.state.showReport){
                let fileName = this.state.uid+" "
                return(
                    <ReportComponent 
                    audioPath={RNFS.ExternalStorageDirectoryPath+"/Call/"+fileName.trim()+".mp4"}
                    setReportText={(text)=>this.setState({docReport:text})}
                    setAudioPath={(path)=>this.setState({audioPath:path})}
                    cancelReport={()=>this.setState({showCharity:false,showRating:true,showReport:false})}/>
                )
            }
    }
}        
  
const styles = StyleSheet.create({
    header: {backgroundColor:Colors.primary},
    title:{color:Colors.white,fontWeight:'bold'},
    icon:{
      color:Colors.white,
      alignSelf:"center",
      fontSize:Typography.iconFontSize
    },
    container:{
        flex:1,
        backgroundColor:Colors.containers},
    donationContainer:{
        flex:1,
        justifyContent:'center',
        borderTopColor:Colors.overLay,
        borderTopWidth:1
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
        backgroundColor:Colors.primary,
        width:'48%'
    },
    btnActions:{
       flexDirection:'row',
       width:'100%'},
   textStyle:{
       color:Colors.baseText
    },
   text:{
       fontWeight:'bold', 
       marginTop:10,
       marginLeft:5,
       fontSize:Typography.baseFontSize,
       color:Colors.baseText,
       textAlign:'center'
   },
   subContainer:{
       flex:1,
       justifyContent:'center',

   },
  
  
})