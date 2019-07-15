import React from 'react'
import {List,ListItem,Text,Icon,Container,Content,Body} from 'native-base'
import {View} from 'react-native'
import MaterialCommunityIcons from '../icons/materialComunity'
import NavigationService from '../../Navigation/navigationService'
import { confirmLogOut } from '../logout';
import Ionicons from '../icons/ionicons';
import {Typography,Colors} from '../../styles/index'

const iconFont = Typography.iconFontSize;
const iconColor = Colors.iconColor;



//Patient sideItems  
const patientItems = [
    {text:'Call History',routeName:'PatientHistory',icon:<MaterialCommunityIcons name='call-made' style={{color:iconColor,fontSize:iconFont}}/>},
    {text:'Privacy',routeName:'P',icon:<MaterialCommunityIcons name='shield' style={{color:iconColor,fontSize:iconFont}}/>},
    {text:'Contact us',routeName:'P',icon:<MaterialCommunityIcons name='help-box' style={{color:iconColor,fontSize:iconFont}}/>},
   {text:'T & C',routeName:'PatientHistory',icon:<MaterialCommunityIcons name='lock' style={{color:iconColor,fontSize:iconFont}}/>},
]


//Doc sideItems
const doctorItems = [
    {text:'Call History',routeName:'DocHistory',icon:<MaterialCommunityIcons name='call-made' style={{color:iconColor,fontSize:iconFont}}/>},
    {text:'Add money',routeName:'P',icon:<Ionicons name='logo-usd' style={{color:iconColor,fontSize:iconFont}}/>},
    {text:'Check Dontation',routeName:'Donation',icon:<Ionicons name='logo-usd' style={{color:iconColor,fontSize:iconFont}}/>},
    {text:'Privacy',routeName:'P',icon:<MaterialCommunityIcons name='shield' style={{color:iconColor,fontSize:iconFont}}/>},
    {text:'Contact Us',routeName:'P',icon:<MaterialCommunityIcons name='help-box' style={{color:iconColor,fontSize:iconFont}}/>},
   {text:'T & C',routeName:'p',icon:<MaterialCommunityIcons name='lock' style={{color:iconColor,fontSize:iconFont}}/>},
]
export default class SideBar extends React.Component{

    navigate(routeName){
         NavigationService.navigate(routeName,[]);
    }


    render(){
        return(
            <Container>
            <View style={Typography.container}>
             <Content>
             <List>

                {
                    this.props.type !== 'doctor'?
                    patientItems.map((val)=>
                      <ListItem onPress={()=>this.navigate(val.routeName)}>
                          {val.icon}
                        <Body>
                        <Text> {val.text}</Text>
                        </Body>
                     </ListItem>

                    )

                    :
                    doctorItems.map((val)=>
                    <ListItem onPress={()=>this.navigate(val.routeName)}>
                        {val.icon}
                      <Body>
                      <Text> {val.text}</Text>
                      </Body>
                   </ListItem>

                  )

                }     
               
                    
            </List>
             </Content>
                
            </View>
            <View>
                <ListItem onPress={()=>confirmLogOut()}>
                   <Icon name='power' />
                   <Body>
                       <Text>Sign Out</Text>
                   </Body>
                </ListItem>
            </View>
         </Container>
        )
    }
}