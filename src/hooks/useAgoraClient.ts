import AgoraRTC, { ClientConfig, createClient, IAgoraRTCClient } from "agora-rtc-react";
import useAppStore from "../zustand/app.slice";


const config: ClientConfig = {
    mode: "live", codec: "h264",
};
AgoraRTC.setLogLevel(4);

// const appId: string = "fc5652b73e874187946947d7c1139a6e";
// const token: string | null = `007eJxTYJhfcv30a9cc351bJ2++zFh46KXolRPtcQoyU1unKMhFHgtQYEhLNjUzNUoyN061MDcxtDC3NDGzNDFPMU82NDS2TDRLneXvntIQyMiwpJOflZEBAkF8NoayxPiU1DIGBgC8vR/G`;

const useClient = createClient(config);
const client = useClient();
client.setClientRole('host');
type ResultAgoraClient = {
    client: IAgoraRTCClient,
    clientConfig: {
        appId: string,
        token: string | null,
        customerKey: string,
        customerSecret: string,
        channelName: string,
    }
}
export default function useAgoraClient(): ResultAgoraClient {
    const { channelInfo } = useAppStore();

    return {
        client,
        clientConfig: channelInfo,
    };
}