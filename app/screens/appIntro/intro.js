
import React,{Component} from 'react'
import {View,StyleSheet,ViewPagerAndroid,ImageBackground,StatusBar,AsyncStorage} from 'react-native'
import {Button,Text,Icon} from 'native-base'
import SplashScreen from 'react-native-splash-screen'
import {Colors, Typography} from '../../styles/index'
import firebase from 'react-native-firebase'
const storage = AsyncStorage;

export default class AppIntro extends Component {
    state = {
        doctor:false,
        patient:false,
        active:0            
    }

    nextScreenParams(param,nav){
        this.props.navigation.navigate(nav,{accountType:param});
    }


    componentDidMount(){
        storage.setItem('appIntro',JSON.stringify(true))
        SplashScreen.hide();
    }


   async onFinish(){
        
        const uid = firebase.auth().currentUser.uid;
        const user =  await firebase.firestore().collection('Users').doc(uid).get();
        if(user.exists){
            //this guy does not belong to usercateory1
            this.props.navigation.navigate("PatientStack");
        }else{
            this.props.navigation.navigate("DoctorStack");
        }
    }



    returnColor(index){
        if(index == this.state.active){
            return Colors.primary
        }else{
            return "#fff"
        }
    }


    dotComponent(){
        return(
            <View style={styles.dotContainer}>
               <View style={styles.emptyComponent}>
                    
                </View>
                <View style={styles.dotContainer2}>
                    <View style={[styles.dots,{backgroundColor:this.returnColor(0)}]}></View>
                    <View style={[styles.dots,{backgroundColor:this.returnColor(1)}]}></View>
                    <View style={[styles.dots,{backgroundColor:this.returnColor(2)}]}></View>
                </View>
                <View style={styles.emptyComponent}>
                    {
                        this.state.active == 2 ?
                        <Button transparent onPress={()=>this.onFinish()}>
                           <Text style={styles.text}>Done</Text>
                        </Button>
                        :
                        <Button transparent >
                           <Icon style={styles.directionStyle} name='ios-arrow-forward'/>
                        </Button>
                    }
                   
                </View>
                
            </View>
        )
    }

   
    render(){
        return(
            <View style={styles.viewPager}>
                  <StatusBar backgroundColor={Colors.primary}/>
                  <ViewPagerAndroid
                onPageSelected={(e)=>this.setState({active:e.nativeEvent.position})}
                style={styles.viewPager}
                initialPage={0}>
                <View style={styles.pageStyle} key="1">
                     <ImageBackground style={styles.img} source={require('../../../assets/slideOne.jpg')}>
                         <View style={styles.mainSpace}>
                         </View>
                         {this.dotComponent()}
                     </ImageBackground>
                </View>    
                <View style={styles.pageStyle} key="2">
                     <ImageBackground style={styles.img} source={require('../../../assets/slideTwo.jpg')}>
                         <View style={styles.mainSpace}>
                         </View>
                         {this.dotComponent()}
                     </ImageBackground>
                </View>
                <View style={styles.pageStyle} key="3">
                     <ImageBackground style={styles.img} source={require('../../../assets/slideThree.jpg')}>
                         <View style={styles.mainSpace}>
                             
                         </View>
                         {this.dotComponent()}
                     </ImageBackground>
                </View>
           </ViewPagerAndroid>
            </View>
            
        )
    }
}


const styles = StyleSheet.create({
    directionStyle:{
        color:Colors.appIntroIconColor,
        fontSize:Typography.baseFontSize
    },
    emptyComponent:{
        flex:1
    },
    text:{
        fontWeight:'bold',
        color:Colors.baseText
    
    },
    mainSpace:{
       flex:1,
       justifyContent:'center',
       alignContent:'center',
       alignItems:'center'
    },
    dots:{
      width:10,
      height: 10,
      borderRadius:100,
      marginRight:10
    },
    dotContainer:{
       flexDirection:'row',
       alignContent:'center',
       justifyContent:'center',
       alignItems:'center',
       height:100,
    },
    dotContainer2:{
        flex:2,
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'center',
        alignItems:'center',
     },
  
    viewPager: {
        flex: 1  
      },
      pageStyle: {
      },
      img:{
          flex:1,
          width:'100%',
          
      }
})    