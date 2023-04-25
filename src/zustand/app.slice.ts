import { create } from "zustand";
import { ChannelFormType } from "../types/types";

type AppState = {
    channelInfo: ChannelFormType,
}

type AppAction = {
    setChannelInfo: (channelInfo: ChannelFormType) => void,
}

const useAppStore = create<AppState & AppAction>((set) => ({
    channelInfo: { appId: '', token: '' },
    setChannelInfo: (channelInfo: ChannelFormType) => set(() => ({ channelInfo })),

}))

export default useAppStore;