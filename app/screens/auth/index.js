
import React,{Component} from 'react'
import {StyleSheet,} from 'react-native'
import {Container,H1,List,ListItem,Body,H3} from 'native-base'
import SplashScreen from 'react-native-splash-screen'
import { Colors } from '../../styles';
import { Text, Layout ,Input,Radio} from 'react-native-ui-kitten';


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
                <Text category="h1" style={styles.signIn}>Sign In</Text> 
                <List>
                    <ListItem onPress={()=>this.setState({doctor:!this.state.doctor,patient:false},()=>{
                        this.nextScreenParams('doctor','Hospitals')
                    })}>
                        <Body>
                            <Text category="h4" style={styles.items}>Doctor</Text>
                        </Body>
                        <Radio onChange={()=>this.setState({doctor:!this.state.doctor,patient:false},()=>{
                        this.nextScreenParams('doctor','Hospitals')
                    })} checked={this.state.doctor} />
                    </ListItem>     
                    <ListItem onPress={()=>this.setState({patient:!this.state.patient,doctor:false},()=>{
                        this.nextScreenParams('patient','Login')
                    })}>
                        <Body>
                            <Text category="h4" style={styles.items}>Patient</Text>
                        </Body>         
                        <Radio  onChange={()=>this.setState({patient:!this.state.patient,doctor:false},()=>{
                        this.nextScreenParams('patient','Login')
                    })} checked={this.state.patient} />
                    </ListItem>        
                </List>
            </Container>
        )
    }
}


const styles = StyleSheet.create({
    items:{
        color:Colors.baseText,
        fontWeight:'100'
    },
    signIn:{
        fontSize:40,
        fontWeight:'bold',
        lineHeight:50,
        color:Colors.primary
    },
    mainContainer:{
        flex:1,     
        justifyContent:'center',
        alignContent:'center',
        padding:10,
        backgroundColor:Colors.containers
    }
})    