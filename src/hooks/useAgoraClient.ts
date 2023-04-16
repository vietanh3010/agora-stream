import AgoraRTC, { ClientConfig, createClient, IAgoraRTCClient } from "agora-rtc-react";


const config: ClientConfig = {
    mode: "rtc", codec: "vp8",
};
AgoraRTC.setLogLevel(4);

const appId: string = "78362308677b4d78a2438206fb6563a7";
const token: string | null = "007eJxTYPhz5ZGYkYOyYt4+ZnFuue7FiU/DDR5yLVX3/iQ57aJX8iYFBnMLYzMjYwMLM3PzJJMUc4tEIxNjCyMDs7QkM1Mz40TzK7o2KQ2BjAyPqtoZGRkgEMRnYyhLjE9JLWNgAACv7B1U";

const useClient = createClient(config);
const client = useClient();
type ResultAgoraClient = {
    client: IAgoraRTCClient,
    clientConfig: {
        appId: string,
        token: string | null
    }
}
export default function useAgoraClient(): ResultAgoraClient {
    const clientConfig = {
        appId,
        token,
    }

    return {
        client,
        clientConfig
    };
}