import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { memo, useState } from "react";
import useAgoraClient from "../hooks/useAgoraClient";

type VideoControlProps = {
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
    setStart: React.Dispatch<React.SetStateAction<boolean>>;
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoControl = ({
    tracks,
    setStart,
    setInCall
}: VideoControlProps): JSX.Element => {
    const {client} = useAgoraClient();
    const [trackState, setTrackState] = useState({ video: true, audio: true });
  
    const mute = async (type: "audio" | "video") => {
      if (type === "audio") {
        await tracks[0].setEnabled(!trackState.audio);
        setTrackState((ps) => {
          return { ...ps, audio: !ps.audio };
        });
      } else if (type === "video") {
        await tracks[1].setEnabled(!trackState.video);
        setTrackState((ps) => {
          return { ...ps, video: !ps.video };
        });
      }
    };
  
    const leaveChannel = async () => {
      await client.leave();
      client.removeAllListeners();
      // we close the tracks to perform cleanup
      tracks[0].close();
      tracks[1].close();
      setStart(false);
      setInCall(false);
    };
  
    return (
      <div className="controls">
        <button className={trackState.audio ? "on" : ""}
          onClick={() => mute("audio")}>
          {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
        </button>
        <button className={trackState.video ? "on" : ""}
          onClick={() => mute("video")}>
          {trackState.video ? "MuteVideo" : "UnmuteVideo"}
        </button>
        {<button onClick={() => leaveChannel()}>Leave</button>}
      </div>
    );
  };


  export default memo(VideoControl)