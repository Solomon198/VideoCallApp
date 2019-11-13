
    
import React, {Component, PureComponent} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,      
    Dimensions,
    Modal,NativeModules,AsyncStorage,Alert,StatusBar
} from 'react-native';
import TimerCountdown from 'react-native-timer-countdown';
import {StopSound, PlaySoundRepeat, PlaySoundMusicVolume } from 'react-native-play-sound';
import {Button,Text,Icon,H3} from 'native-base'
import {RtcEngine, AgoraView} from 'react-native-agora';
import MaterialCommunityIcons from '../icons/materialComunity';
import Feather from '../icons/feather'
import { startRecorder,stopRecorder ,deleteDirectory} from '../../Utils/functions';
import {toast} from '../toast'
import { Colors, Typography } from '../../styles';
import firebase from 'react-native-firebase';


const storage = AsyncStorage
const {Agora} = NativeModules;

const {
    FPS30,
    FixedLandscape,
    Host,
    AudioProfileDefault,
    AudioScenarioDefault,
  } = Agora;
const {width,height} = Dimensions.get('window');
let start11 = new Date().toLocaleString();
let end11 = new Date().toLocaleString();
let totalDuration = 0;




export default class VideoView extends Component {

    constructor(props) {
        super(props);
        
    }

    state = {
        remotes: "",
        isJoinSuccess: false,
        isSpeaker: true,
        isMute: false,
        isCameraTorch: false,
        disableVideo: true,
        isHideButtons: true,
        visible: false,
        selectUid: undefined,
        isTimerStart: false,
        maxVolume:0.4,
        timerTime:1000*180,
        secondsRemaining:0,
        start:false
    };

    secondsRemaining = 1000*180;
    duration = 0;


    componentWillMount() {
        //初始化Agora
        storage.setItem('active',JSON.stringify(1));
        const options = {
            appid: '3288bfad25a94ed8a9de397c876884e1',
            channelProfile: 1,      
            videoProfile: 40, 
            clientRole: 1,
            swapWidthAndHeight: true,
            videoEncoderConfig: {
                width: 360,
                height: 480,
                bitrate: 1,
                frameRate: FPS30,
                orientationMode: FixedLandscape,
              },
              clientRole: Host,
              audioProfile: AudioProfileDefault,
              audioScenario: AudioScenarioDefault
        
        };
        RtcEngine.init(options);

         
                 
    }



    confirmEndingCall(){
        Alert.alert(
            '',
            'Are you sure you want to end call ?',
            [
              {
                text: 'No',
                onPress: () => '',
                style: 'cancel',
              },
              {text: 'Yes', onPress: () => this.handlerCancel()},
            ],
            {cancelable: false},
          );
    }


        // if(this.state.start)return false;
        // this.setState({
        //     start:true
        // },()=>{
        //     ScreenRecorderManager.start();
        //     toast('Video will be recorded')
        // })   
       
      
      stop() {
    //     SoundRecorder.stop()
    // .then(function(result) {
    //     console.log('stopped recording, audio file saved at: ' + result.path);
    //     storage.setItem('recordPath',result.path)
    // });
      }


     
  
      stopRecording(){
        stopRecorder().then((val)=>{
          toast(val);
        }).catch((err)=>{
          toast(err)
        })
      }


    initAgoraSdk(){
        RtcEngine.getSdkVersion((version) => {
            // console.log("Agora version: " + version);
        });

        // RtcEngine.disableVideo()d
        // RtcEngine.enableAudio();
        RtcEngine.enableVideo();
          
        RtcEngine.setEnableSpeakerphone(true)
   
        //加入房间
        RtcEngine.joinChannel(this.props.channel);  

        // 启用说话者音量提示         
        RtcEngine.enableAudioVolumeIndication(500,3);



        RtcEngine.on('firstRemoteVideoDecoded', (data) => {
            // console.log("TTT Agora Start TIMER: " + new Date().toLocaleString());
                // start11 = new Date().toLocaleString(); 
                // start11 = moment(start11, "HH:mm:ss a");
                // console.log(data);
                // console.log("Agora onFirstRemoteVideoDecoded data: " + data);
                // Have remote video join Back to important uid AgoraView set remoteUid value according to uid
                // const {remotes} = this.state;          
                // const newRemotes = [...remotes];
                
            
                StopSound();

                // There is a case where the network rec onnection causes the callback to be repeated multiple times, 
                //sdf and the added remote video is not added repeatedly.
                // if (!remotes.find(uid => uid === data.uid)) {
                //     newRemotes.push(data.uid);
                // }
                this.setState({remotes: data.uid,isHideButtons:false});
          });


          RtcEngine.on('userJoined', (data) => {
            this.setState({
                isTimerStart: true,   
                remotes:data.uid,
                isHideButtons:false
            }); 
            StopSound();
          });


          RtcEngine.on('userOffline', (data) => {
            const {remotes, isTimerStart} = this.state;
            // const newRemotes = remotes.filter(uid => uid !== data.uid);

            if (isTimerStart) {
                this.setState({ isTimerStart: false });
            }
            this.setState({remotes: ""});

            RtcEngine.leaveChannel();
            RtcEngine.destroy();

            this.handlerCancel();
          });

          
          RtcEngine.on('joinChannelSuccess', (data) => {
            RtcEngine.startPreview();

            this.setState({    
                isJoinSuccess: true,
            },()=>{    
                if(this.props.showAdd == false){
                    PlaySoundRepeat('dial_tone');
                    PlaySoundMusicVolume(0.05)    
                }
            }); 
          });
          

          RtcEngine.on('audioVolumeIndication', (data) => {


        });


          RtcEngine.on('clientRoleChanged', (data) => {

        })


          RtcEngine.on('error', (data) => {
            if (data.err === 17) {
                RtcEngine.leaveChannel();
                RtcEngine.destroy();      
            }
            
          })

    }

                

  async  componentDidMount() {   
        const uid = firebase.auth().currentUser.uid;
       
        this.initAgoraSdk()
        // startRecorder(uid).then((val)=>{
        //     toast("recorder started");
            
        //   }).catch((err)=>{
        //     this.initAgoraSdk()
        //     toast("Error starting recorder")
        //   })
    }

    componentWillUnmount() {
      RtcEngine.leaveChannel();
      RtcEngine.removeAllListeners();
      RtcEngine.destroy();
    }
     

            

    addTime(){
        this.secondsRemaining = this.secondsRemaining + (60*1000)
        this.setState({timerTime:(1000 * 60)+this.secondsRemaining},()=>{//not useful but just for reRendering purpose to update the timer with the latest seconds  
            this.props.addPatientTime();
        })
    }    


    onTimerElapsed(){
            this.handlerCancel();
    }

    handlerCancel = () => {
         this.props.onCallFinished(this.duration);
        // //this handler stops the destroy the session when time is up
        // // console.log("TTT Agora Stop TIMER: " + new Date().toLocaleString());
        // // this.stop()
        // StopSound()
     };            


    
    handlerSwitchCamera = () => {
        RtcEngine.switchCamera();
    };

    handlerMuteAllRemoteAudioStreams = () => {
        //because we are touching stat we set the time again
        //this would not hapen if redux is integrated
        this.setState({
            isMute: !this.state.isMute,    
            timerTime:this.secondsRemaining
        }, () => {
            RtcEngine.muteAllRemoteAudioStreams(this.state.isMute);
        })
    };

    handlerSetEnableSpeakerphone = () => {
        this.setState({
            isSpeaker: !this.state.isSpeaker
        }, () => {
            RtcEngine.setDefaultAudioRouteToSpeakerphone(this.state.isSpeaker);
        });
    };

    handlerChangeCameraTorch = () => {
        this.setState({
            isCameraTorch: !this.state.isCameraTorch
        }, () => {
            RtcEngine.setCameraTorchOn(this.state.isCameraTorch);
        });
    };

    handlerChangeVideo = () => {
        this.setState({
            disableVideo: !this.state.disableVideo
        }, () => {
            this.state.disableVideo ? RtcEngine.enableVideo() : RtcEngine.disableVideo()
        })
    };

    handlerHideButtons = () => {
        this.setState({
            isHideButtons: !this.state.isHideButtons   
        })
    };


    onPressVideo = (uid) => {
        // console.log("Agora onPressVideo uid: " + uid);

        this.setState({
            selectUid: uid,

        }, () => {
            this.setState({
                visible: true,
            })
        })
    };

    render() {
        this.secondsRemaining = this.secondsRemaining + this.props.addedTime
        const {
            isMute,
            isSpeaker,
            isCameraTorch,
            disableVideo,
            isHideButtons,
            remotes,
            isJoinSuccess,
            visible,
            isTimerStart
            ,
        } = this.state;


        return (
            <View
                activeOpacity={1}
                style={styles.container}
            >
              <StatusBar backgroundColor="#00aff0"/>
                {
                    this.state.remotes?
                         <View style={{flex:1}}>
                             
                             <View style={{height:height,width:width,position:'absolute',top:0,bottom:0,left:0,right:0}}>
                                
                             <View style={styles.absView}>
                                 <AgoraView zOrderMediaOverlay={true} style={{flex:1}} mode={1} showLocalVideo={true}/>
                             </View>
                               
                                <AgoraView
                                mode={1}
                                style={{flex:1}}
                                zOrderMediaOverlay={false}
                                remoteUid={this.state.remotes}
                            />  
                             </View>
                            
                         </View>
                        
                     :<View style={styles.empty}>
                           <Feather name='phone-call' style={{fontSize:35,color:'#fff',marginBottom:10}}/>
                           <Text style={styles.emptyText}>Connecting .... </Text>
                     </View>

                }
                

                { isHideButtons == false ?
                    <View style={{ backgroundColor: 'transparent',position:'absolute',bottom:0,left:0,right:0 }}>
                        {    
                            isTimerStart       
                            ? (
                                <TimerCountdown
                                    initialSecondsRemaining={this.secondsRemaining}
                                    onTick={(secondsRemaining)=> {this.secondsRemaining = secondsRemaining;
                                      this.duration += 1}}
                                    onTimeElapsed={()=> this.onTimerElapsed()}
                                    allowFontScaling={true}
                                    style={{
                                        fontSize: 20,
                                        color: 'white',
                                        alignSelf: 'center',
                                        fontWeight:'600'
                                        // marginTop: 10,
                                    }}
                                />
                            ) : null     
                        }   
                        
                      
                        <View style={styles.bottomView}>
                            <OperateButton   
                                onPress={()=>this.handlerMuteAllRemoteAudioStreams()}
                                source={isMute ? require('../../images/icon_muted.png') : require('../../images/btn_mute.png')}
                            />
                            {this.props.showAdd?
                                <AddTimeForDoctorButton
                                onPress={()=>this.addTime()}
                            />
                            :null

                             }

                             {/* <OperateButton
                                onPress={()=>this.start()}
                                source={require('../images/btn_video.png')}
                        /> 
                         */}

                            <OperateButton
                                onPress={this.handlerSwitchCamera}
                                source={require('../../images/btn_switch_camera.png')}
                            />

                             
                        </View>
                       
                        
                        <OperateButton
                            style={{alignSelf: 'center',}}
                            onPress={()=>this.confirmEndingCall()}
                            imgStyle={{width: 60, height: 60,marginBottom:10}}
                            source={require('../../images/btn_endcall.png')}
                        />
                    </View>:null
                    }
            </View>
        );
    }          
}

class OperateButton extends PureComponent {
    render() {

        const {onPress, source, style, imgStyle = {width: 50, height: 50}} = this.props;

        return (
            <TouchableOpacity
                style={style}
                onPress={()=>onPress()}
                activeOpacity={.7}   
            >
                <Image
                    style={imgStyle}
                    source={source}
                />
            </TouchableOpacity>
        )
    }         
}     

class RecordComponent extends PureComponent {
    render() {

        const {onPress, source, style, imgStyle = {width: 50, height: 50}} = this.props;

        return (
            <TouchableOpacity
                style={style}
                onPress={()=>onPress()}
                activeOpacity={.7}   
            >
                <MaterialCommunityIcons name='record-rec' style={{fontSize:25,color:'#fff'}}/>
            </TouchableOpacity>
        )
    }         
}     


class AddTimeForDoctorButton extends PureComponent {
    render() {
                 

        return (
                
               <Button onPress={()=>this.props.onPress()} small light style={{borderRadius:2,marginTop:10}} >
                   <Text uppercase={false}>+ 1min</Text>
               </Button>
        )    
    }         
}         
          
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4'
    },          
    videoView:{
        flex:1,
    },
    absView: {
        position: 'absolute', 
        top:5,           
        left: 5,
        height:150,
        width:150,
        justifyContent: 'space-between',
    },      
    buttons:{
        position: 'absolute', 
        bottom:30,           
        left: 0,
        right:0,
        zIndex:100
    },  
    localView: {
        flex: 1 ,
        height:height   
    },
    remoteView: {              
        width: width,        
        height: height,          
    },
    bottomView: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    empty:{
        flex:1,
        justifyContent:'center',
        alignContent:"center",
        alignItems:'center',
        backgroundColor:"#00aff0",

    },
    emptyText:{
        color:Colors.white,
        fontSize:Typography.baseFontSize,
        fontWeight:"500"
    }
});
