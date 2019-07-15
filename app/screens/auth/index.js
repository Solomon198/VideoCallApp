
import React,{Component} from 'react'
import {StyleSheet,} from 'react-native'
import {Container,H1,List,ListItem,Body,H3,Radio} from 'native-base'
import SplashScreen from 'react-native-splash-screen'
import { Colors } from '../../styles';

export default class IndexPage extends Component {
    state = {
        doctor:false,
        patient:false               
    }

    nextScreenParams(param,nav){
        this.props.navigation.navigate(nav,{accountType:param});
    }


    componentDidMount(){
        SplashScreen.hide();
    }

   
    render(){
        return(
            <Container style={styles.mainContainer}>
                <H1 style={styles.signIn}>Sign In</H1> 
                <List>
                    <ListItem onPress={()=>this.setState({doctor:!this.state.doctor,patient:false},()=>{
                        this.nextScreenParams('doctor','Hospitals')
                    })}>
                        <Body>
                            <H3 style={styles.items}>Doctor</H3>
                        </Body>
                        <Radio selectedColor={Colors.whitesmoke} selected={this.state.doctor} />
                    </ListItem>     
                    <ListItem onPress={()=>this.setState({patient:!this.state.patient,doctor:false},()=>{
                        this.nextScreenParams('patient','Login')
                    })}>
                        <Body>
                            <H3 style={styles.items}>Patient</H3>
                        </Body>         
                        <Radio  selectedColor={Colors.whitesmoke} selected={this.state.patient} />
                    </ListItem>        
                </List>
            </Container>
        )
    }
}


const styles = StyleSheet.create({
    items:{
        color:Colors.baseText
    },
    signIn:{
        fontSize:40,
        fontWeight:'bold',
        lineHeight:50,
        color:Colors.baseText
    },
    mainContainer:{
        flex:1,     
        justifyContent:'center',
        alignContent:'center',
        padding:10,
        backgroundColor:Colors.containers
    }
})    