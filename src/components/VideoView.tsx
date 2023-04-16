import { IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import { memo } from "react"
import CVideoPlayer from "./CVideoPlayer"


type VideoViewProps = {
    users: IAgoraRTCRemoteUser[];
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
}

const VideoView = ({
    users,
    tracks
}: VideoViewProps): JSX.Element => {

    return (
        <div>
            <CVideoPlayer track={tracks[1]}/>
            {
                users?.filter(user => Boolean(user.videoTrack)).map((user) => 
                    <div>   
                        <div>user id: {user.uid}</div>
                        <CVideoPlayer track={user.videoTrack!} key={user.uid}/>
                    </div>
                )
            }
        </div>
    )
}

export default memo(VideoView)