import React from 'react'
import {Footer,FooterTab,Button,} from 'native-base'
import  {Image,View,StyleSheet} from 'react-native'
import NavigationService from '../../Navigation/navigationService'
import {AsyncStorage} from 'react-native'
import {Colors,Typography} from '../../styles/index'
import MaterialIcons from '../icons/material';
import MaterialCommunityIcons from '../icons/materialComunity';
const storage = AsyncStorage
export default class DocFooterComponent extends React.Component{
    constructor(props){
        super(props)
    }

    state ={
        active:0,
        userMoving:false
    }

    componentDidMount()
     {
         
      


        storage.getItem('active').then((val)=>{
            val = JSON.parse(val)
            if(val){
                this.setState({active:val})
            }else{   
                this.setState({active:1})
            }
        })
    }

   
    
    

   

    returnColor(active){
        if(active == this.state.active){  
            switch(active){
                case 0:{
                    return{
                        icon:<MaterialIcons style={style.ico} name='class' />,
                        bgColor:Colors.navBtnColor
                    }
                    break   
                }
                case 1 :{
                    return{
                        icon:<MaterialIcons style={style.ico} name='assessment' />,
                        bgColor:Colors.navBtnColor
                    }
                    break
                }

              


            
                case 2 :{
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
                    icon:<MaterialCommunityIcons style={style.ico} name='book-outline' />,
                    bgColor:Colors.navBtnColor
                }
                break
            }
            case 1 :{
                return{
                    icon:<Image style={{width:25,height:25}} source={require('../../../assets/assesment.png')} />,
                    bgColor:Colors.navBtnColor
                }  
                break
            }

           
           
            case 2 :{
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
            storage.setItem('active',JSON.stringify(active))
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
                <Button  style={{backgroundColor:this.returnColor(0).bgColor}} onPress={()=> {NavigationService.navigate('AppointMents')}}>
                  {this.returnColor(0).icon}
                </Button>
                <Button style={{backgroundColor:this.returnColor(1).bgColor}} onPress={()=>{NavigationService.navigate('Status')}} >
                  {this.returnColor(1).icon}
                </Button>   
                
                <Button  style={{backgroundColor:this.returnColor(2).bgColor}} onPress={()=>{NavigationService.navigate('Profile')}}>
                    {this.returnColor(2).icon}
                </Button>  
            </FooterTab>
            </Footer>
        )
    }
}

const style = StyleSheet.create({
    ico:{
        fontSize:Typography.iconFontSize,
        color:Colors.navIconColor
    }
})  
