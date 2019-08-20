import React,{Component} from 'react'
import {Container} from 'native-base'
import * as firebase from 'react-native-firebase';
import {AsyncStorage,StyleSheet} from 'react-native';
import Toolbar from '../../components/Toolbar/Toolbar'
import {ListWithImage} from '../../components/RenderList/ListComponents'
import {Colors} from '../../styles/index'
import {Loading} from '../../components/Loader/loader'
const storage = AsyncStorage;
const firestore = firebase.firestore()

export default class TopDoctors extends Component {
    constructor(props){
        super(props);

    }
    
    state = {   
           data :{},
           visible:false ,
           donations:[]   ,
           noDonation:false
 
    }       

    //sort the highest amount from array of objecto of doctors with their total donations
    sortData(arr){
     arr.sort((a,b)=>{
       return parseInt(b.totalDonations) -  parseInt(a.totalDonations) 
     })
     this.setState({                              
        donations:arr    ,
        noDonation:false
    })       
     
    }
  


    componentDidMount(){
        //appending user credentials so that it can be used by component when needed
            storage.getItem('user').then((val)=>{
                let data = JSON.parse(val);
                this.setState({data:data});
            })

            let db = firestore.collection('donation')

            db.onSnapshot((querySnapshot)=>{        
                let docarray = [];    
                    querySnapshot.forEach(function(doc) {
                          docarray.push({  
                              name: doc.data().name,
                              key: doc.id ,   
                              totalDonations:doc.data().totalDonations,
                              hospitalKey:doc.data().hospitalKey
                          })               
                     })
                if(docarray.length < 1){
                    return(
                        this.setState({donations:[],noDonation:true})
                    )
                }

                if(docarray.length == 1){
                    return(
                        this.setState({donations:docarray,noDonation:false},()=>{
                        })
                    )
                }
                this.sortData(docarray)
               
                
            },(err)=>alert('error reading dataBase'),()=>alert('completes'))

    }   
    
    
    navigate(param){
        let data ={}
        data["doctorName"] = param.name;
        data["doctorKey"]  = param.key;
        data["price"]      = param.price;
        data["doctorPhoto"] = param.photo;
        data["doctorBio"] = param.bio;
        data["youtubeIds"] = param.youtube;
        data["hospitalKey"] = param.hospitalKey;
        data["hospitalName"] = "";
        data["userName"]  = firebase.auth().currentUser.email;        

        this.props.navigation.navigate('SetAppointMent',data);
    }


    getDocInfo(items){
        var db = firestore.collection("doctors").doc(items.hospitalKey).collection('credentials').doc(items.key);
        db.get().then((doc)=>{
            let item = {

                name: doc.data().firstName?doc.data().firstName + ' ' + doc.data().lastName:doc.data().name,
                key: doc.id ,
                price:doc.data().price,
                youtube:doc.data().youtube?doc.data().youtube:[],
                bio:doc.data().bio?doc.data().bio:'',
                photo:doc.data().photo?doc.data().photo:'',
                paused:doc.data().paused,
                hospitalKey:items.hospitalKey
            

            }
            this.navigate(item);
        })

    }

    



   
    
    render(){

        if(this.state.noDonation){
            return(
                <Loading show={false}  text='No Top Doctors' />
            )
        }
            
        return(          
          <Container style={styles.container}> 
              <Toolbar title='Top Doctors'/>
              {
                   this.state.donations.length < 1?
                  <Loading show={true}/>
                  :
                   <ListWithImage 
                   onPress={(item)=> this.getDocInfo(item)}
                   data = {this.state.donations}
                   iconColor={Colors.white}   
                   showItem={["name","key"]}
                   location
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
   }
})