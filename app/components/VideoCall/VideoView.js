
    
import React, {Component, PureComponent} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,      
    Dimensions,
    Modal,NativeModules,AsyncStorage,Alert
} from 'react-native';
import TimerCountdown from 'react-native-timer-countdown';
import {StopSound, PlaySoundRepeat, PlaySoundMusicVolume } from 'react-native-play-sound';
import {Button,Text,Icon,H3} from 'native-base'
import {RtcEngine, AgoraView} from 'react-native-agora';
import MaterialCommunityIcons from '../icons/materialComunity';
import { startRecorder,stopRecorder } from '../../Utils/functions';
import {toast} from '../toast'


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
        remotes: [],
        isJoinSuccess: false,
        isSpeaker: true,
        isMute: false,
        isCameraTorch: false,
        disableVideo: true,
        isHideButtons: false,
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

        // RtcEngine.disableVideo()
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
                const {remotes} = this.state;          
                const newRemotes = [...remotes];
                
            
                StopSound();

                // There is a case where the network rec onnection causes the callback to be repeated multiple times, 
                //sdf and the added remote video is not added repeatedly.
                if (!remotes.find(uid => uid === data.uid)) {
                    newRemotes.push(data.uid);
                }
                this.setState({remotes: newRemotes});
          });


          RtcEngine.on('userJoined', (data) => {
            this.setState({
                isTimerStart: true,   
            }); 
            StopSound();
          });


          RtcEngine.on('userOffline', (data) => {
            const {remotes, isTimerStart} = this.state;
            const newRemotes = remotes.filter(uid => uid !== data.uid);

            if (isTimerStart) {
                this.setState({ isTimerStart: false });
            }
            this.setState({remotes: newRemotes});

            RtcEngine.leaveChannel();
            RtcEngine.destroy();

            this.handlerCancel();
          });

          
          RtcEngine.on('joinChannelSuccess', (data) => {
            RtcEngine.startPreview();

            this.setState({    
                isJoinSuccess: true
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

                

    componentDidMount() {   
    
        startRecorder(this.props.patientId).then((val)=>{
            toast("recorder started");
            this.initAgoraSdk()
          }).catch((err)=>{
            this.initAgoraSdk()
            toast("Error starting recorder")
          })
   
       
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
        this.props.removeAppointment(this.duration);
        //this handler stops the destroy the session when time is up
        // console.log("TTT Agora Stop TIMER: " + new Date().toLocaleString());
        // this.stop()
        StopSound()
        this.stopRecording();
        RtcEngine.leaveChannel();
        RtcEngine.removeAllListeners();
        RtcEngine.destroy();


        const {onCancel, onFinish} = this.props;  
        // onCancel(this.duration);
        onFinish(this.duration);
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
            <TouchableOpacity
                activeOpacity={1}
                style={styles.container}
            >
                <AgoraView style={styles.localView} showLocalVideo={false}/>
                           
                {!isHideButtons ?
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
                            :<Text></Text>

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
                            imgStyle={{width: 60, height: 60}}
                            source={require('../../images/btn_endcall.png')}
                        />
                    </View>:null
                    }
                <View style={styles.absView}>
                    <View >
                            {!visible ?
                    <View style={styles.videoView}>         
                        {remotes.map((v, k) => {
                            return (
                                <TouchableOpacity   
                                    activeOpacity={1}
                                    onPress={() => this.onPressVideo(v)}
                                    key={k}       
                                >
                                    <AgoraView
                                        style={styles.remoteView}
                                        zOrderMediaOverlay={true}
                                        remoteUid={v}
                                    />
                                     </TouchableOpacity>
                            )
                        })}                       
                    </View> : <View style={styles.videoView}/>
                    }  
                    </View>
                </View>

                <Modal            
                    visible={visible}
                    presentationStyle={'fullScreen'}
                    animationType={'slide'}
                    onRequestClose={() => {}}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{flex: 1}}
                        onPress={() => this.setState({
                            visible: false,
                        })}
                    >
                        <AgoraView
                            style={{flex: 1}}
                            zOrderMediaOverlay={true}
                            remoteUid={this.state.selectUid}
                        />
                    </TouchableOpacity>
                </Modal>
            </TouchableOpacity>
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
    absView: {
        position: 'absolute', 
        top:0,           
        bottom: height/4,
        left: 0,
        right: 0,
        justifyContent: 'space-between',
    },          
    localView: {
        flex: 1 ,
        height:height   
    },
    remoteView: {              
        width: (width - 40) / 2,          
        height: (width - 40) / 2,          
        margin: 5
    },
    bottomView: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
});
