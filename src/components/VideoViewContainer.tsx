import { createMicrophoneAndCameraTracks } from "agora-rtc-react";
import AgoraRTC, { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { memo, useEffect, useRef, useState } from "react";
import useAgoraClient from "../hooks/useAgoraClient";
import VideoControl from "./VideoControl";
import VideoView from "./VideoView";


type VideoViewContainerProps = {
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
    channelName: string;
}

// the create methods in the wrapper return a hook
// the create method should be called outside the parent component
// this hook can be used the get the client/stream in any component
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const VideoViewContainer = ({
    setInCall,
    channelName
}: VideoViewContainerProps): JSX.Element => {
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [start, setStart] = useState<boolean>(false);
  // using the hook to get access to the client object
  const {client, clientConfig} = useAgoraClient();
  const {appId, token} = clientConfig;
  // ready is a state variable, which returns true when the local tracks are initialized, untill then tracks variable is null
  const { ready, tracks } = useMicrophoneAndCameraTracks();
 
  useEffect(() => {
      console.log(clientConfig)
      if(!appId || !token) return;
    // function to initialise the SDK
    let init = async (name: string) => {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        console.log("subscribe success");
        if (mediaType === "video") {
          setUsers((prevUsers) => {
            return [...prevUsers, user];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user, type) => {
        console.log("unpublished", user, type);
        if (type === "audio") {
          user.audioTrack?.stop();
        }
        if (type === "video") {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        }
      });

      client.on("user-left", (user) => {
        console.log("leaving", user);
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });

      await client.join(appId, name, token, null);

      if (tracks) await client.publish([tracks[0], tracks[1]]);
      setStart(true);

    };

    if (ready && tracks) {
      console.log("init ready");
      init(channelName);
    }

  }, [channelName, client, ready, tracks, appId, token]);

  return (
        <div>
            {ready && tracks && (
                <VideoControl tracks={tracks} setStart={setStart} setInCall={setInCall} />
            )}
            {start && tracks && <VideoView users={users} tracks={tracks} />}
        </div>
  );
}

export default memo(VideoViewContainer)