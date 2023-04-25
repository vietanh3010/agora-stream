import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { MediaPipeFaceMeshMediaPipeModelConfig } from "@tensorflow-models/face-landmarks-detection";
import '@tensorflow/tfjs-backend-webgl';
import { AgoraVideoPlayer } from "agora-rtc-react";
import AgoraRTC, { IAgoraRTCRemoteUser, ICameraVideoTrack, IRemoteVideoTrack, LiveStreamingTranscodingConfig } from "agora-rtc-sdk-ng";
import { Peer } from "peerjs";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import useAgoraClient from '../hooks/useAgoraClient';
import axios from 'axios';
import { io } from 'socket.io-client';
type CVideoPlayerProps = {
    track: ICameraVideoTrack | IRemoteVideoTrack;
    users?: IAgoraRTCRemoteUser[];
}
// `rtmp://localhost:1935/live`
const RTMP_YOUTUBE = 'rtmp://103.176.146.113:1935/live/stream_haihh'//`rtmp://live.twitch.tv/app/live_52316409_nQGSooj1Nq0tMqxc9QQILMJWCJhMYq`//`rtmp://a.rtmp.youtube.com/live2/dxrw-pzwa-sjsd-cr00-3622`;
// const socket = io();
const SOCKET_ADDRESS = 'http://localhost:4000';
const socketOptions = { 
    secure: true, 
    reconnection: true, 
    reconnectionDelay: 1000, 
    timeout: 15000, 
    pingTimeout: 15000, 
    pingInterval: 45000, 
    query: { 
        framespersecond: 30, 
        audioBitrate: 22050 
    } };
// const socket = io(SOCKET_ADDRESS, socketOptions);
// function connectServer() {
//     socket.on('connect_timeout', (timeout) => {
//         console.warn("state on connection timeout= " + timeout);
//     });
//     socket.on('error', (error) => {
//         console.warn("state on connection error= " + error);
//     });

//     socket.on('connect_error', function () {
//         console.warn("state on connection error= ");
//     });

//     socket.on('message', function (m) {
//         // console.log('SERVER:' + m);
//     });

//     socket.on('fatal', function (m) {
//         console.warn("fatal socket error!!", m);
//     });

//     socket.on('ffmpeg_stderr', function (m) {
//         //this is the ffmpeg output for each frame
//         // console.log('FFMPEG:' + m);
//     });

//     socket.on('disconnect', function (reason) {
//         // console.log('ERROR: server disconnected!' + reason);
//         connectServer();
//     });
// }

// function startStream(stream: MediaStream) {
//         socket.emit('config_rtmpDestination', `rtmp://localhost:1935/live`);
//         socket.emit('start', 'start');
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorder.start(30);
//         mediaRecorder.onstop = function (e) {
//             console.log("stopped!");
//             // console.log(e);
//         }
//         mediaRecorder.onpause = function (e) {
//             console.log("media recorder paused!!");
//             // console.log(e);
//         }

//         mediaRecorder.onerror = function (event: any) {
//             let error = event.error;
//             // console.log("error", error.name);
//         };

//         mediaRecorder.ondataavailable = function (e) {
//             socket.emit("binarystream", e.data);
//         }
// }

const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;

const detectorConfig: MediaPipeFaceMeshMediaPipeModelConfig = {
    runtime: 'mediapipe', // or 'tfjs'
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
    maxFaces: 1,
    refineLandmarks: true,
}

const CVideoPlayer = ({
    track,
    users = [],
}: CVideoPlayerProps): JSX.Element => {
    const streamVideoRef = useRef<HTMLVideoElement | null>(null);
    const streamCanvasImageRef = useRef<HTMLCanvasElement | null>(null);
    const streamCanvasFaceRef = useRef<HTMLCanvasElement | null>(null);
    const refTestVideo = useRef<HTMLVideoElement | null>(null);
    const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
    const {client, clientConfig} = useAgoraClient();
    const [imgSrc, setImgSrc] = useState<string>('');
    const startTranscoding = useCallback(async () => {
        // const liveTranscoding: any = {
        //     width: 1280,
        //     height: 720,
        //     videoBitrate: 1130,
        //     videoFrameRate: 24,
        //     lowLatency: false,
        //     audioSampleRate: 48000,
        //     audioBitrate: 48,
        //     audioChannels: 1,
        //     videoGop: 30,
        //     videoCodecProfile: 100 ,
        //     userCount: 3,
        //     backgroundColor: 0x000000,
        //     watermark: {
        //         url: 'https://picsum.photos/200/300',
        //         x: 10,
        //         y: 10,
        //         width: 200,
        //         height: 70,
        //     },
        //     transcodingUsers: [{
        //         uid: client.uid!,
        //         alpha: 1,
        //         width: 1280 / 2,
        //         height: 720,
        //         zOrder: 1,
        //         x: 0,
        //         y: 0
        //     }],
        // }

        // await client.setLiveTranscoding(liveTranscoding);
        // // Adds a URL to which the host pushes a stream. Set the transcodingEnabled parameter as true to enable the transcoding service. Once transcoding is enabled, you need to set the live transcoding configurations by calling the setLiveTranscoding method. Agora does not recommend transcoding in the case of a single host.
        // await client.startLiveStreaming("rtmp://localhost:1935/live", liveTranscoding)

        const region = 'ap'; 
        const appId = clientConfig.appId;
        const regionHintIp = RTMP_YOUTUBE//'rtmp://localhost:1935/live';
        const customerKey = "a74c2d4e7f634ac6af6761f7ebe4d329";
        const customerSecret = "3cbd4759b526423e805da398156572a8";
        const plainCredential = `${customerKey}:${customerSecret}`;
        const encodedCredential = btoa(plainCredential)//Buffer.from(plainCredential).toString('base64')
        const authorizationField = "Basic " + encodedCredential;

        const rtcStreamUids = users.map(v => v.uid);
        const layout = users.map(v => ( {
                "rtcStreamUid": v.uid,
                "region": {
                    "xPos": 0,
                    "yPos": 320,
                    "zIndex": 1,
                    "width": 360,
                    "height": 320
                }
            }))

        const res = await axios.post(
            `https://api.agora.io/${region}/v1/projects/${appId}/rtmp-converters?regionHintIp=${regionHintIp}`,
            {
                "converter": {
                    "name": "show68_vertical",
                    "transcodeOptions": {
                        "rtcChannel": "va_dev",
                        "audioOptions": {
                            "codecProfile": "HE-AAC",
                            "sampleRate": 48000,
                            "bitrate": 128,
                            "audioChannels": 1,
                            "rtcStreamUids": rtcStreamUids,
                        },
                        "videoOptions": {
                            "canvas": {
                                "width": 1368,
                                "height": 720,
                                "color": 0
                            },
                            "layout": layout,
                            "codec": "H.264",
                            "codecProfile": "baseline",
                            "frameRate": 15,
                            "gop": 30,
                            "bitrate": 900,
                            "layoutType": 1,
                            "vertical": {
                                // "maxResolutionUid": 201,
                                "fillMode": "fit",
                                "refreshIntervalSec": 4
                            },
                            "defaultPlaceholderImageUrl": "http://example/host_placeholder.jpg",
                            // "seiOptions": {
                            //     "source": {
                            //         "metadata": true,
                            //         "datastream": true,
                            //         "customized": {
                            //             "payload": "example"
                            //         }
                            //     },
                            //     "sink": {
                            //         "type": 100
                            //     }
                            // }
                        }
                    },
                    "rtmpUrl": `${RTMP_YOUTUBE}`,
                    "idleTimeout": 300,
                    "jitterBufferSizeMs": 1,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorizationField,
                    'X-Request-ID': new Date().getTime(),
                }
            }
        )
        console.log(res)
    }, [users])

    const destroyConverter = async () => {
        const region = 'ap'; 
        const appId = clientConfig.appId;
        const regionHintIp = RTMP_YOUTUBE//'rtmp://localhost:1935/live';
        const customerKey = "c945f583e6ee485bad3b576d38caba5f";
        const customerSecret = "f9d0f18c220748b4962d2de0d3f173b8";
        const plainCredential = `${customerKey}:${customerSecret}`;
        const encodedCredential = btoa(plainCredential)//Buffer.from(plainCredential).toString('base64')
        const authorizationField = "Basic " + encodedCredential

        const listAllConverter = await axios.get(
            `https://api.agora.io/v1/projects/${appId}/channels/${"va_dev"}/rtmp-converters`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorizationField,
                    'X-Request-ID': 'abcd1234',
                }
            }
        )
        listAllConverter.data.data.members.forEach(async (mem: any) => {
            const {converterId} = mem;
            console.log(mem)
            const res = await axios.delete(
                `https://api.agora.io/${region}/v1/projects/${appId}/rtmp-converters/${converterId}`,
                {
                    headers: {
                        'Authorization': authorizationField,
                        'X-Request-ID': 'abcd1234',
                    }
                }
            )
        })
    }
    
    useEffect(() => {
        // connectServer();
    }, [])
    
    useEffect(() => {
        async function createDetector() {
            try {
                const newDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
                setDetector(newDetector)
            }
            catch(e) {
                console.warn(e)
            }
        }
        createDetector();

    }, [])

    useEffect(() => {
      
        async function drawFrame() {
            if(!streamVideoRef.current || !streamCanvasImageRef.current || !streamCanvasFaceRef.current) return;
            const ctx = streamCanvasImageRef.current.getContext('2d');
            const ctx2 = streamCanvasFaceRef.current.getContext('2d');
            if(!ctx || !ctx2) return;

            ctx.drawImage(streamVideoRef.current, 0, 0, streamCanvasImageRef.current.width, streamCanvasImageRef.current.height);
            if(detector) {
                const faces = await detector.estimateFaces(streamCanvasImageRef.current);
                ctx2.clearRect(0 , 0, streamCanvasImageRef.current.width, streamCanvasImageRef.current.height)
                if(faces[0]) {
                    const {box} = faces[0];
                    const {xMin, xMax, yMin, yMax, width, height} = box;
                    
                    ctx2.beginPath();
                    ctx2.rect(xMin, yMin, width, height);
                    ctx2.stroke();
                }
            }
           
            requestAnimationFrame(drawFrame);
        }

        async function initStream() {
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            // const mediaStream2 = new MediaStream([videoTrack.getMediaStreamTrack(), audioTrack.getMediaStreamTrack()]); // js
            const mediaStream = new MediaStream([track.getMediaStreamTrack()]); // js
            // await client.publish(mediaStream as any);

            // startStream(mediaStream)

            // sendStream(mediaStream)
    
            if(!streamVideoRef.current || !streamCanvasImageRef.current || !streamCanvasFaceRef.current) return;
            streamVideoRef.current.srcObject = mediaStream;
            streamVideoRef.current.onloadedmetadata = () => {
                if(!streamVideoRef.current || !streamCanvasImageRef.current || !streamCanvasFaceRef.current) return;
                // Video dimensions are available
                streamCanvasImageRef.current.width = streamVideoRef.current.videoWidth;
                streamCanvasImageRef.current.height = streamVideoRef.current.videoHeight;

                streamCanvasFaceRef.current.width = streamVideoRef.current.videoWidth;
                streamCanvasFaceRef.current.height = streamVideoRef.current.videoHeight;
                drawFrame()
            }
        }
        initStream()
      }, [streamVideoRef.current, streamCanvasImageRef.current, track, streamCanvasFaceRef.current, detector])
      let deviceId = ''
      useEffect(() => {
            function runStream() {
                navigator.mediaDevices.getUserMedia({
                    audio: {
                        sampleRate: 22050,
                        echoCancellation: true
                    },
                    video: {
                        width: { min: 100, ideal: 500, max: 1920 },
                        height: { min: 100, ideal: 500, max: 1080 },
                        frameRate: { ideal: 30 },
                    },
                }).then(async function (stream) {
                    const videoTrack = await AgoraRTC.createCameraVideoTrack();
                    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                    const mediaStream2 = new MediaStream([videoTrack.getMediaStreamTrack(), audioTrack.getMediaStreamTrack()]);
                    if(refTestVideo.current) {
                        refTestVideo.current.srcObject = mediaStream2;
                        refTestVideo.current.play();
                        // startStream(mediaStream2)
                    }
                })
            }
            // runStream();
      }, [])
      
      useEffect(() => {
        // socket.on('stream_buffer', (buffer: any) => {
        //     setImgSrc(buffer)
        // })
      }, [])

      useEffect(() => {
      
        return () => {
            destroyConverter()
        }
      }, [])
      
      

    return (
        <div>
            <div className="relative h-[500px] w-[600px]">
                <AgoraVideoPlayer
                    style={{height: '500px', width: '600px'}}
                    className="z-10 invisible absolute" 
                    videoTrack={track}/>
                <video className="absolute object-cover invisible" muted autoPlay playsInline controls ref={streamVideoRef} width="500px" height="600px" style={{height: '500px', width: '600px'}}/>
                <canvas className="absolute z-20 scale-x-[-1] visible" width="500px" height="600px" ref={streamCanvasImageRef} style={{border: '1px solid',height: '500px', width: '600px'}}/>
                <canvas className="absolute z-30 scale-x-[-1]" width="500px" height="600px" ref={streamCanvasFaceRef} style={{border: '1px solid',height: '500px', width: '600px'}}/>
            </div>
            <div className='flex space-x-2 py-1'>
                <button
                    className='border border-black btn btn-sm btn-info'
                    onClick={() => {
                        startTranscoding()
                    }}
                    >
                        Start Streaming
                    </button>
                <button
                    className='border border-black btn btn-sm btn-error'
                    onClick={() => {
                        destroyConverter()
                    }}
                    >
                        Stop Streaming
                </button>
            </div>
            
            <div className="flex space-x-4">
                <span className='font-bold text-gray-9'>RTMP link:</span>
                <span className='font-normal text-gray-9'>{RTMP_YOUTUBE}</span>
            </div>


            <video 
                muted
                playsInline
                controlsList="nodownload noplaybackrate nodownload" 
                disablePictureInPicture
                autoPlay ref={refTestVideo}/>
            <img src={imgSrc}/>

        </div>
      );
} 

export default memo(CVideoPlayer);