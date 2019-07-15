import firebase from 'react-native-firebase'
import {Alert,AsyncStorage} from 'react-native'
import Navigationservice from '../Navigation/navigationService'
const storage = AsyncStorage;

export function confirmLogOut(){
    Alert.alert(
        '',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            onPress: () => '',    
            style: 'cancel',
          },
          {text: 'OK', onPress: () => logout()},
        ],
        {cancelable: false},
      );
  }

function logout(){
  
    Navigationservice.navigate('Auth');
    const user = firebase.auth().currentUser;
    if(user){
        firebase.auth().signOut().then((val)=>{

        }).catch(()=>{
          
        })
    }
}
