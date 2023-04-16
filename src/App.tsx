import React, { useEffect, useRef, useState } from "react";
import AgoraRTC, {
  AgoraVideoPlayer,
  createClient,
  createMicrophoneAndCameraTracks,
  ClientConfig,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-react";

const config: ClientConfig = { 
  mode: "rtc", codec: "vp8",
};
AgoraRTC.setLogLevel(4);

const appId: string = "78362308677b4d78a2438206fb6563a7"; //ENTER APP ID HERE
const token: string | null = "007eJxTYNgSNFfzXEi2Rc7X1c8zrX9dnqqst/nI+30uYfuzlN1zQ7gUGMwtjM2MjA0szMzNk0xSzC0SjUyMLYwMzNKSzEzNjBPN95wxT2kIZGQ4xaPOysgAgSA+G0NZYnxKahkDAwB8bh8w";

const App = () => {
  const [inCall, setInCall] = useState(false);
  const [channelName, setChannelName] = useState("va_dev");
  return (
    <div>
      <h1 className="heading">Agora RTC NG SDK React Wrapper</h1>
      {inCall ? (
        <VideoCall setInCall={setInCall} channelName={channelName} />
      ) : (
        <ChannelForm setInCall={setInCall} setChannelName={setChannelName} />
      )}
    </div>
  );
};

// the create methods in the wrapper return a hook
// the create method should be called outside the parent component
// this hook can be used the get the client/stream in any component
const useClient = createClient(config);
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const VideoCall = (props: {
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
  channelName: string;
}) => {
  const { setInCall, channelName } = props;
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [start, setStart] = useState<boolean>(false);
  // using the hook to get access to the client object
  const client = useClient();
  // ready is a state variable, which returns true when the local tracks are initialized, untill then tracks variable is null
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  useEffect(() => {
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

  }, [channelName, client, ready, tracks]);

  const streamVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
      
    function drawFrame() {
        if(!streamVideoRef.current || !streamCanvasRef.current) return;
        const ctx = streamCanvasRef.current.getContext('2d');
        if(!ctx) return;
        ctx.drawImage(streamVideoRef.current, 0, 0, streamCanvasRef.current.width, streamCanvasRef.current.height);
        requestAnimationFrame(drawFrame);
    }
    async function initStream() {
        const videoTrack = await AgoraRTC.createCameraVideoTrack(); // agroa
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        
        const mediaStream = new MediaStream([videoTrack.getMediaStreamTrack(), audioTrack.getMediaStreamTrack()]); // js
        console.log(mediaStream)
        // await client.publish(mediaStream as any);

        console.log(streamVideoRef.current, streamCanvasRef.current)
        if(!streamVideoRef.current || !streamCanvasRef.current) return;
        console.log('sett')
        streamVideoRef.current.srcObject = mediaStream;
        streamVideoRef.current.onloadedmetadata = () => {
            if(!streamVideoRef.current || !streamCanvasRef.current) return;
            // Video dimensions are available
            streamCanvasRef.current.width = streamVideoRef.current.videoWidth;
            streamCanvasRef.current.height = streamVideoRef.current.videoHeight;
            drawFrame()
        }
    }
    initStream()
  }, [streamVideoRef.current, streamCanvasRef.current])
  

  return (
    <div>
      {ready && tracks && (
        <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} />
      )}
      {start && tracks && <Videos users={users} tracks={tracks} />}

      <div>
          <span>stream</span>
          <video muted autoPlay playsInline controls ref={streamVideoRef} width="500px" height="300px"/>
          <canvas ref={streamCanvasRef} style={{border: '1px solid'}}/>
      </div>
    </div>
  );
};

const Videos = (props: {
  users: IAgoraRTCRemoteUser[];
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
}) => {
  const { users, tracks } = props;
  
  return (
    <div>
      <div>
        {/* AgoraVideoPlayer component takes in the video track to render the stream,
            you can pass in other props that get passed to the rendered div */}
        <AgoraVideoPlayer style={{height: '500px', width: '600px'}} className='vid' videoTrack={tracks[1]}/>
        {users.length > 0 &&
          users.map((user) => {
            if (user.videoTrack) {
              return (
                <div>   
                    <div>user id: {user.uid}</div>
                    <AgoraVideoPlayer style={{height: '500px', width: '600px'}} className='vid' videoTrack={user.videoTrack} key={user.uid} />
                </div>
              );
            } else return null;
          })}
      </div>
    </div>
  );
};

export const Controls = (props: {
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
  setStart: React.Dispatch<React.SetStateAction<boolean>>;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const client = useClient();
  const { tracks, setStart, setInCall } = props;
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

const ChannelForm = (props: {
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
  setChannelName: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { setInCall, setChannelName } = props;

  return (
    <form className="join">
      {appId === '' && <p style={{color: 'red'}}>Please enter your Agora App ID in App.tsx and refresh the page</p>}
      <input type="text"
        placeholder="Enter Channel Name (va_dev)"
        onChange={(e) => setChannelName(e.target.value)}
      />
      <button onClick={(e) => {
        e.preventDefault();
        setInCall(true);
      }}>
        Join
      </button>
    </form>
  );
};

export default App;