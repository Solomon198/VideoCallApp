import {createStackNavigator,createSwitchNavigator,createTabNavigator,createDrawerNavigator} from 'react-navigation'
import React,{Component} from 'react'  
import {View,Text} from 'react-native'
import { mapping, light as lightTheme } from '@eva-design/eva';
import { ApplicationProvider, Layout } from 'react-native-ui-kitten';
import Login from '../screens/auth/login'
import IndexPage from '../screens/auth/index'
import PatientDashBoard from '../screens/patientScreens/dashboard'
import Doctors from '../screens/patientScreens/doctors'
import SetAppointMent from '../screens/patientScreens/setAppointment'
import AppointMents  from '../screens/patientScreens/AppointMents'
import Hospitals from '../screens/auth/hospitals'
import DocDashboard from '../screens/doctorScreens/dashboard'
import SignUp from '../screens/auth/signUp'
import DocProfile from '../screens/doctorScreens/profile'
import DocHistory from '../screens/doctorScreens/docHistory'
import Status from '../screens/doctorScreens/status'
import PatientProfile from '../screens/patientScreens/profile'
import PatientHistory from '../screens/patientScreens/patientHistory';
import FooterComponent from '../components/PatientTab/patientTab'
import DocFooterComponent from '../components/DoctorTab/docTab';
import SideBar from '../components/SideMenu/sideBar';
import RenderCall from '../screens/patientScreens/renderCall';
import DocRenderCall from '../screens/doctorScreens/docRenderCall';
import NavigationService from './navigationService';
import TopDoctors from '../screens/patientScreens/topDoctors';
import GetCoins from '../screens/patientScreens/getCoins';
import Donation from '../screens/doctorScreens/donation';
import Ratings from '../screens/doctorScreens/rating'   
import Charity from '../screens/doctorScreens/charity'
import RessetPassword from '../screens/auth/ressetPassword';
import AppIntro from '../screens/appIntro/intro';
import SplashScreen from 'react-native-splash-screen';
import ViewDocProfile from '../screens/patientScreens/viewDoctorProfile'
import PatientRatingStack from '../screens/patientScreens/patientRatingStack'
                   
const PatientStack = createStackNavigator({

     //patient navigation  
     PatientDashBoard:PatientDashBoard,
     SetAppointMent:SetAppointMent,            
     Doctors:Doctors,    
 
},{
    headerMode:'none'
})


const CallStack = createStackNavigator({

   RenderCall:RenderCall

},{
   headerMode:'none'
})

const IntroNav = createStackNavigator({

  AppIntro:AppIntro
 
 },{
    headerMode:'none'
 })

const DocCallStack = createStackNavigator({

    DocRenderCall:DocRenderCall,
 
 },{
    headerMode:'none'
 })

 const FeedBack = createStackNavigator({
    Ratings:Ratings,
    Charity:Charity,
 },{
    headerMode:'none'
 })

 const FeedBackPatient = createStackNavigator({
    PatientRatingStack:PatientRatingStack
 },{
    headerMode:'none'
 })

const ProfileStack = createStackNavigator({
    PatientProfile:PatientProfile,
    PatientHistory:{
        screen:PatientHistory
    },
    GetCoins:GetCoins
    
},{
    headerMode:'none'
})

const DocProfileStack = createStackNavigator({
   DocProfile:DocProfile,
   Donation:Donation,
   DocHistory:DocHistory
},{
    headerMode:'none'
})




const DoctorStack = createStackNavigator({

    DocDashboard:DocDashboard  

},{   
   headerMode:'none'
});


const TopDoctorStack = createStackNavigator({
    Index:TopDoctors,
    ViewDocProfile:ViewDocProfile
},{
    headerMode:'none'
})


const PatientTabDrawerContent = createTabNavigator({
    Hospitals:{
        screen:PatientStack,
        
    },
    TopDoctors:TopDoctorStack,
    AppointMents:{   
        screen:AppointMents,
        navigationOptions:({navigation})=>({
        })
    },

    Patient:{
        screen:ProfileStack,
    },
},{
    tabBarComponent:({navigation})=>(
           <FooterComponent
             navigation={navigation}
          />
    ),  
    tabBarPosition:'bottom'   ,
    animationEnabled:false
})  

const PatientTab = createDrawerNavigator({
    pagess:PatientTabDrawerContent
},{
    drawerPosition:'right',
    contentComponent:()=><SideBar/>
})



const DoctorDrawerContent= createTabNavigator({
    AppointMents:{
        screen:DoctorStack, 
    },      
    Profile:{
        screen:DocProfileStack,
    },

},
    {
        tabBarComponent:({navigation})=>(
            <DocFooterComponent
                navigation={navigation}
              />
        ),
        tabBarPosition:'bottom'   
    })



const DoctorTab = createDrawerNavigator({
   pagesDoctor:DoctorDrawerContent
},
{
    drawerPosition:'right',
    contentComponent:()=><SideBar type='doctor'/>
}) 
 
const Auth = createStackNavigator({    

     //^^^^^^^^^^^^^^^^^^^^^^^^^^^
    IndexPage:IndexPage,
    SignUp:SignUp,
    Hospitals:Hospitals,
    RessetPassword:RessetPassword,
    Login:{
        screen:Login
    },
 
},{    
    headerMode:'none',
})


const SwitchNav = createSwitchNavigator({
    Auth:Auth,
    PatientStack:PatientTab,
    DoctorStack:DoctorTab,
    CallStack:CallStack,
    DocCallStack:DocCallStack,
    FeedBack:FeedBack,
    IntroNav:IntroNav,
    FeedBackPatient:FeedBackPatient,
},{
    initialRouteName:'Auth'
})
    
const navigationPersistenceKey = __DEV__ ? "Niihygitjil8hjrtjghjhgjhhklkjhuujgkkkuykkg" : 'Navuuoikjhgfghjkjhjhghokkkjukjdkkkkjhfoovu';


   

     
export default class NavContainer extends React.Component{
    componentDidMount(){
        SplashScreen.hide();
    }
    render(){
        return(
            <ApplicationProvider
               
               mapping={mapping}
               theme={lightTheme}>
            <SwitchNav persistenceKey={navigationPersistenceKey}  ref={navigatorRef => {
                NavigationService.setTopLevelNavigator(navigatorRef);
              }}/>  
             </ApplicationProvider>
        )
    }
}

   