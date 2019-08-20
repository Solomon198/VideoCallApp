import React from 'react'
import {StyleSheet} from 'react-native'
import {Footer,FooterTab,Button} from 'native-base'
import NavigationService from '../../Navigation/navigationService'
import {getFromStorage,storeInStorage} from '../../Utils/functions'
import Ionicons from '../icons/ionicons';
import MaterialIcons from '../icons/material';
import {Colors, Typography} from '../../styles/index'
import MaterialCommunityIcons from '../icons/materialComunity';
export default class FooterComponent extends React.Component{
    constructor(props){
        super(props)
    }

    state ={
        active:0,
        userMoving:false
    }

    //get info about last nav before app was killed
    getLastTab(){
        getFromStorage('active').then((val)=>{
            if(val){
                this.setState({active:val})
            }else{   
                this.setState({active:1})
            }
       })    
    }

    componentDidMount()
     {    
      this.getLastTab();
    }

   
    
    

   

    returnIcon(active){
        if(active == this.state.active){  
            switch(active){
                case 0:{
                    return{
                        icon:<Ionicons style={style.ico} name='md-home' />,
                        bgColor:Colors.navBtnColor

                    }
                    break
                }   
                case 1 :{
                    return{
                        icon:<MaterialCommunityIcons style={style.ico} name='star' />,
                        bgColor:Colors.navBtnColor

                    }
                    break
                }
                case 2 :{
                    return{
                        icon:<MaterialIcons style={style.ico} name='timelapse' />,
                        bgColor:Colors.navBtnColor

                    }
                    break
                }

              
                case 3 :{
                    return{
                        icon:<MaterialIcons style={style.ico} name='person' />,
                        bgColor:Colors.navBtnColor

                    }
                    break
                }
            }
        }

        switch(active){
            case 0:{
                return{
                    icon:<MaterialCommunityIcons style={style.ico} name='home-outline' />,
                    bgColor:Colors.navBtnColor

                }
                break
            }
            case 1 :{
                return{
                    icon:<MaterialCommunityIcons style={style.ico} name='star-outline' />,
                    bgColor:Colors.navBtnColor

                }
                break
            }
            case 2 :{
                return{
                    icon:<MaterialIcons style={style.ico} name='access-time' />,
                    bgColor:Colors.navBtnColor

                }
                break
            }
           

            case 3 :{
                return{
                    icon:<MaterialIcons style={style.ico} name='person-outline' />,
                    bgColor:Colors.navBtnColor  

                }
                break
            }
    }
    }


    setActive(active){
        this.setState({active:active},()=>{
            storeInStorage('active',active);
        })
    }


    componentWillReceiveProps(){
        this.setState({userMoving:true})
    }

     componentDidUpdate(){
        if(this.state.userMoving){
            let page = parseInt(this.props.navigation.state.index);
            this.setState({active:page,userMoving:false})    
            }
        }
        
    
     

    render(){
           

            return(
            <Footer style={{backgroundColor:Colors.TabFooter}}>
            <FooterTab style={{backgroundColor:Colors.TabFooter}}>
                <Button  style={{backgroundColor:this.returnIcon(0).bgColor}} onPress={()=> {NavigationService.navigate('Hospitals')}}>
                  {this.returnIcon(0).icon}
                </Button>
                <Button style={{backgroundColor:this.returnIcon(1).bgColor}} onPress={()=>{NavigationService.navigate('TopDoctors')}} >
                  {this.returnIcon(1).icon}
                </Button>   
                <Button  style={{backgroundColor:this.returnIcon(2).bgColor}} onPress={()=>{NavigationService.navigate('AppointMents')}} >
                   {this.returnIcon(2).icon}
                </Button>
               
                <Button  style={{backgroundColor:this.returnIcon(3).bgColor}} onPress={()=>{NavigationService.navigate('Patient')}}>
                    {this.returnIcon(3).icon}
                </Button>  
            </FooterTab>
            </Footer>
        )
    }
}

const style = StyleSheet.create({
ico:{
        fontSize:Typography.iconFontSize,
        color:Colors.primary
    } 
})


