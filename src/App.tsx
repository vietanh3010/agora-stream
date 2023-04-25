import React, { useState } from "react";
import VideoViewContainer from "./components/VideoViewContainer";
import "./index.css"
import "./app.scss";
import ChannelForm from "./components/ChannelForm";

const App = () => {
  const [inCall, setInCall] = useState(false);
  const [channelName, setChannelName] = useState("va_dev");

  return (
    <div>
      {inCall ? (
        <VideoViewContainer setInCall={setInCall} channelName={channelName} />
      ) : (
        <ChannelForm setInCall={setInCall}/>
      )}
    </div>
  );
};


// const ChannelForm = (props: {
//   setInCall: React.Dispatch<React.SetStateAction<boolean>>;
//   setChannelName: React.Dispatch<React.SetStateAction<string>>;
// }) => {
//   const { setInCall, setChannelName } = props;

//   return (
//     <div>
//       {/* {appId === '' && <p style={{color: 'red'}}>Please enter your Agora App ID in App.tsx and refresh the page</p>} */}
//       {/* <input type="text"
//         placeholder="Enter Channel Name (va_dev)"
//         onChange={(e) => setChannelName(e.target.value)}
//       /> */}
//       <button 
//             className="btn"
//             onClick={(e) => {
//                 e.preventDefault();
//                 setInCall(true);
//             }}>
//             Join
//       </button>
//     </div>
//   );
// };

export default App;