import React,{Component} from 'react'
import {Container,Text,H1,Icon,Button} from 'native-base'
import {StyleSheet,AsyncStorage,} from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { Colors } from '../../styles';
import Ratings from '../../components/Rating/rating'
const storage = AsyncStorage
export default class PatientRatings extends Component {
    constructor(props){
        super(props);

    }
    
    state = {   
           data :{},
           visible:false    ,
           donate:10,
           rating:0,
           donationPercentage:10
 
    }   
    
    setRatings(){
       this.props.finishRating()
    }

    componentDidMount(){
        storage.getItem("videoData").then((val)=>{
            let unwrap = JSON.parse(val);
            this.setState({data:unwrap})
        })
    }


   
    render(){
            
        return(          
            <Ratings 
            docId={this.props.docId}
            userId={this.props.userId}
            data={this.state.data}
            dismissModal={()=>this.props.dismissModal()}
          />
        )
    }
}        
  
