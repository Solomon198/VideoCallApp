import {AsyncStorage,PermissionsAndroid} from 'react-native'
import firebase from 'react-native-firebase'
const storage = AsyncStorage;
var RNFS = require('react-native-fs');
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { transcode } from 'react-native-audio-transcoder'
const audioRecorderPlayer = new AudioRecorderPlayer();

export var jsonEncode = (data) => JSON.stringify(data);
export var jsonDecode = (data) => JSON.parse(data);

export var getFromStorage = (key)=> new Promise((resolve,reject)=>{
    storage.getItem(key).then((val)=>{
        val?resolve(jsonDecode(val)):null;
    }).catch((err)=>{
        return reject(err.message)
    })
})


export function permissionCheck(){
    return new Promise((resolve,reject)=>{
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then((val)=>{
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).then((val)=>{
              //do nothing;WRITE_EXTERNAL_STORAGE
              PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((val)=>{
                //do nothing;
                PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((val)=>{
                    //do nothing;
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((val)=>{
                        //do nothing;ACCESS_FINE_LOCATION
                       resolve("Permission Granted")
                      }).catch((err)=>reject(err.message))
                  }).catch((err)=> reject(err.message))
              }).catch((err)=> reject(err.message))
            }).catch((err)=> reject(err.message))
       }).catch((err)=> reject(err.message))
    })
}

export var storeInStorage = (keyName,data) => new Promise((resolve,reject)=>{
    if(!data) throw new Error('Data cannot be empty. empty argument passed to storeInStorage ')
    storage.setItem(keyName,jsonEncode(data)).then(()=>{
        resolve({saved:true})
    }).catch((err)=>{
        reject({saved:false,message:err.message})
    })
})

function createDirectory(){
    return new Promise((resolve,reject)=>{
        let path = RNFS.ExternalStorageDirectoryPath+"/Call";
        RNFS.exists(path).then((val)=>{
            if(val == false){
                RNFS.mkdir(path).then(()=>{
                    resolve({status:true,message:'directory created'})
                }).catch((err)=>{
                    reject({status:false,message:err.message})
                })
            }else{
                resolve({status:true,message:"directory already exist"})
            }
        })
    })
}


export function deleteDirectory(){
    return new Promise((resolve,reject)=>{
        let path = RNFS.ExternalStorageDirectoryPath+"/Call";
        RNFS.exists(path).then((val)=>{
            if(val){
               RNFS.unlink(path).then(()=>{
                   resolve(true)
               }).catch((err)=>{
                   reject(err)
               })
            }else{
                   reject("no such directory")
            }
        })
    })
}


export function startRecorder(patientId){
    return new Promise((resolve,reject)=>{
       createDirectory().then(()=>{
           let path =  RNFS.ExternalStorageDirectoryPath;
        //    let timeStamp = new Date().getTime();
           let fileName = patientId + " " 
           audioRecorderPlayer.startRecorder(path+"/Call/"+fileName.trim()+".mp4").then((val)=>{
           resolve({path:val})
        }).catch((err)=> {
            reject({message:err.message})
        })
       }).catch(err=>reject({err:err.message}))
    })
   }

   export function convertToMp3(file){
    return new Promise((resolve,reject)=>{
           const myFilePath = file;
          const myNewFile = myFilePath.replace("mp4","mp3");
          transcode(myFilePath, myNewFile)
          .then(() =>{
              console.log(myNewFile)
               resolve(myNewFile)  
            }).catch((err)=>{
                console.log(err)
                reject(err)    
            })
               
       })
   }


export  function stopRecorder(){
       return new Promise((resolve,reject)=>{
         if(audioRecorderPlayer._isRecording){
            audioRecorderPlayer.stopRecorder().then((val)=>{
                resolve(val)
              }).catch((err)=>{
                  reject(err.message)
              })
         }else{
             resolve(false)
         }
       })    
}


export function AppStatus(){
    return new Promise((resolve,reject)=>{
        const ref = firebase.firestore().collection('AppState').doc("state");
        ref.get().then((snapshot)=>{
            let data = snapshot.data();
            if(data.runing){
                resolve(true)
            }else{
                resolve(false)
            }
        }).catch((err)=>{
            reject(err.message)
        })
    })
}


export function getLastCallAudio(){
    return new Promise((resolve,reject)=>{
        let patientId = firebase.auth().currentUser.uid;
        let path =  RNFS.ExternalStorageDirectoryPath+"/Call/"+patientId+"call.mp4";
        RNFS.exists(path).then((val)=>{
            if(path){
                resolve(path);
            }else{
                reject('No such file or directory')
            }
        }).catch((err)=>{
            reject("error checking file path")
        })

    })
}