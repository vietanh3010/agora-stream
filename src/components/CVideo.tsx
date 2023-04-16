import { AgoraVideoPlayer } from "agora-rtc-react";
import { IAgoraRTCRemoteUser, IMicrophoneAudioTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";
import { memo } from "react"

type CVideoProps = {
    track: ICameraVideoTrack;
}

const CVideo = ({
    track
}: CVideoProps): JSX.Element => {

    return (
        <AgoraVideoPlayer 
            style={{height: '500px', width: '600px'}} 
            videoTrack={track}/>
      );
} 

export default memo(CVideo);