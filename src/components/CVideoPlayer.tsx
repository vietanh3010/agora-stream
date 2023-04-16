import { AgoraVideoPlayer } from "agora-rtc-react";
import AgoraRTC, { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { memo, useEffect, useRef, useState } from "react";
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import { MediaPipeFaceMeshTfjsModelConfig } from "@tensorflow-models/face-landmarks-detection";
import backend from '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
type CVideoPlayerProps = {
    track: ICameraVideoTrack | IRemoteVideoTrack;
}

const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
const detectorConfig: MediaPipeFaceMeshTfjsModelConfig = {
    // runtime: 'mediapipe', // or 'tfjs'
    // solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
    runtime: 'tfjs',
    maxFaces: 1,
    // detectorModelUrl: '',
    // landmarkModelUrl: '',
    refineLandmarks: true
    
}
const CVideoPlayer = ({
    track
}: CVideoPlayerProps): JSX.Element => {
    const streamVideoRef = useRef<HTMLVideoElement | null>(null);
    const streamCanvasImageRef = useRef<HTMLCanvasElement | null>(null);
    const streamCanvasFaceRef = useRef<HTMLCanvasElement | null>(null);
    const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);

    useEffect(() => {
        async function createDetector() {
            const newDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
            setDetector(newDetector)
        }
        createDetector();
    }, [])

    useEffect(() => {
      
        async function drawFrame() {
            if(!streamVideoRef.current || !streamCanvasImageRef.current || !streamCanvasFaceRef.current || !detector) return;
            const ctx = streamCanvasImageRef.current.getContext('2d');
            const ctx2 = streamCanvasFaceRef.current.getContext('2d');
            if(!ctx || !ctx2) return;

            ctx.drawImage(streamVideoRef.current, 0, 0, streamCanvasImageRef.current.width, streamCanvasImageRef.current.height);
            const faces = await detector.estimateFaces(streamCanvasImageRef.current);
            ctx2.clearRect(0 , 0, streamCanvasImageRef.current.width, streamCanvasImageRef.current.height)
            if(faces[0]) {
                const {box} = faces[0];
                const {xMin, xMax, yMin, yMax, width, height} = box;
                
                ctx2.beginPath();
                ctx2.rect(xMin, yMin, width, height);
                ctx2.stroke();
            }
           
            requestAnimationFrame(drawFrame);
        }
        async function initStream() {
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            // const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            // const mediaStream = new MediaStream([videoTrack.getMediaStreamTrack(), audioTrack.getMediaStreamTrack()]); // js
            const mediaStream = new MediaStream([track.getMediaStreamTrack()]); // js
            console.log(mediaStream)
            // await client.publish(mediaStream as any);
    
            if(!streamVideoRef.current || !streamCanvasImageRef.current || !streamCanvasFaceRef.current || !detector) return;
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

    return (
        <div className="relative">
            <AgoraVideoPlayer
                style={{height: '500px', width: '600px'}}
                className="z-10 invisible absolute" 
                videoTrack={track}/>
            <video className="absolute object-cover invisible" muted autoPlay playsInline controls ref={streamVideoRef} width="500px" height="600px" style={{height: '500px', width: '600px'}}/>
            <canvas className="absolute z-20 scale-x-[-1]" width="500px" height="600px" ref={streamCanvasImageRef} style={{border: '1px solid',height: '500px', width: '600px'}}/>
            <canvas className="absolute z-30 scale-x-[-1]" width="500px" height="600px" ref={streamCanvasFaceRef} style={{border: '1px solid',height: '500px', width: '600px'}}/>
        </div>
      );
} 

export default memo(CVideoPlayer);