import React,{Component} from 'react'
import {Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet,Modal} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar';
import { Loading } from '../../components/Loader/loader';
import { ListWithImage } from '../../components/RenderList/ListComponents';
import { Colors } from '../../styles';
import References from "../../Utils/refs"
const storage = AsyncStorage;

export default class Charity extends Component {
    constructor(props){
        super(props);

    }   
    
    state = {   
           data :{},
           visible:false    ,
           donate:0,
           charities:[],
           donating:false
 
    }   
    

   

    //shows loader for indicating busy.
    loader(){
        return(
            <Modal 
                transparent 
                visible={this.state.donating}
            >
             <Loading show={true}/>

            </Modal>
        )
    }
    


    
    //donation logic and computation
    donation(rating,percent,uid,docKey,charityKey,charityName){

      //temporal location for storing amount for appointment which will be released after call between patient and doctor
      let direction = uid + "_" + docKey;
      let userDonated = firebase.firestore().collection(References.CategoryTwelve).doc(direction);
      
      //node holds doctor total donations for purpose of top doctors
      let donationRef = firebase.firestore().collection(References.CategoryTen).doc(docKey);
     

      //node holds user total amount of coins i.e coins balance
      let ref = firebase.firestore().collection(References.CategorySeven).doc(docKey).collection(References.CategoryThirteen).doc(References.CategoryFiftenn);

       //compile each doctors donation to each charity so that doctor can know donation he made on certain charity when doctor checks donations
      let refDontations = firebase.firestore().collection(References.CategoryTWo).doc(References.CategoryFourteen).collection(docKey).doc(charityKey);


      let doctorName = this.state.data.name;
        userDonated.get().then((onSnapshot)=>{

          let data = onSnapshot.data()?onSnapshot.data().amount:0
          let charityMoney = (parseInt(percent)/100) * parseInt(data);
          let docMoney = parseInt(data) - parseInt(charityMoney);
          //go to charity code here
                    refDontations.get().then((snapshotVal)=>{
                        if(snapshotVal.exists){
                            let amount = snapshotVal.data().amount +charityMoney;
                            refDontations.update({name:charityName,amount:amount,key:charityKey});
                        }else{
                            refDontations.set({amount:charityMoney,key:charityKey,name:charityName})
                        }
                    }).catch(err=>{  
                        console.log('err: '+err)
                    })
                    ref.get().then((snapshot)=>{
                        let value = snapshot.data()?snapshot.data().amount:0;
                        let total = parseInt(value) + parseInt(docMoney) ;
                        ref.set({amount:total}).then((val)=>{
                            donationRef.get().then((_snapshot)=>{

                                     let oldDonation = _snapshot.data()?_snapshot.data().totalDonations:0;
                                     let _totalDonation = parseInt(oldDonation) + parseInt(charityMoney)

                                     donationRef.set({name:doctorName,doctorKey:docKey,totalDonations:_totalDonation}).then(()=>{
                                        this.setState({donating:false},()=>{
                                            this.props.navigation.navigate('DoctorStack');
                                        })
                                     })
                             })
                        })
           })

      })
    }

    //get donation info like percentage doctor want to donate from present call from slider the user and doctor key  and the  charity key and name etc as the code shows
    getDonationInfo(charity){
        storage.getItem('donationInfo').then((val)=>{
            let {uid,docKey} = JSON.parse(val);
            storage.getItem('ratingInfo').then((info)=>{
            let {rating,donationPercentage} = JSON.parse(info)
            this.donation(rating,donationPercentage,uid,docKey,charity.key,charity.name)   
            })
        })
    }


    componentDidMount(){
       
            storage.getItem('user').then((val)=>{
                let data = JSON.parse(val);
                this.setState({data:data});
            })

            var db = firebase.firestore().collection(References.CategorySix)
                       
                     
            db.onSnapshot((querySnapshot)=>{                 
                let docarray = [];    
                    querySnapshot.forEach(function(doc) {
                        
                          docarray.push({
                              name: doc.data().name,
                              key: doc.id,
                              donation:doc.data().donation,

                          })    
                     });                      
                this.setState({                  
                    charities:docarray,

                },()=>{
                })
                 
                
            },(err)=>alert('error reading dataBase'),()=>alert('completes'))
                
    }    

    



   
    nextNavigation(param){
        this.props.navigation.navigate('SetAppointMent',{hospital:param})
    }

   
    
    render(){
            
        
         
        return(          
          <Container style={styles.container}> 
               <Toolbar  title='Donation'/>
               {this.loader()}
               {
                   this.state.charities.length < 1?
                     <Loading show={true}/>
                   :
                   <ListWithImage 
                   onPress={(item)=> this.props.charitySelected(item)}
                   data = {this.state.charities}
                   showItem={["name","key"]}
                   />
                    }
          </Container>
        )    
    }         
}        
  
const styles = StyleSheet.create({
   container:{
    flex:1,
    backgroundColor:Colors.containers
   },
  
 
})