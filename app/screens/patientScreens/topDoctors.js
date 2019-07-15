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
                   rightItem={true}
                   iconText={true}
                   onPress={()=> ''}
                   iconRightName='logo-usd'
                   data = {this.state.donations}
                   textPropertyName={'totalDonations'}
                   iconColor={Colors.iconColor}   
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
   }
})