import { memo, useEffect } from "react"
import { Controller, useForm } from "react-hook-form";
import { ChannelFormType } from "../types/types";
import useAppStore from "../zustand/app.slice";

type ChannelFormProps = {
    setInCall: (inCall: boolean) => void
}


const FORM_DEFINE: Array<keyof ChannelFormType> = ['appId', 'token', 'channelName', 'customerKey', 'customerSecret']

const ChannelForm = ({
    setInCall
}: ChannelFormProps): JSX.Element => {
    const { handleSubmit, formState: { errors }, control, setValue } = useForm<ChannelFormType>();
    const {setChannelInfo}  = useAppStore();

    useEffect(() => {
        FORM_DEFINE.forEach(key => {
            setValue(key, localStorage.getItem(key) ?? '')
        })
    }, [])
    
    
    const onSubmit = (data: ChannelFormType) => {
        setInCall(true);
        setChannelInfo(data);
        FORM_DEFINE.forEach(key => {
            if(key in data) {
                localStorage.setItem(key, data[key]);
            }
        })
    }


    return (
        <div>
            <form 
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col space-y-2">
                {
                    FORM_DEFINE.map(key => 
                        <div key={key}>
                            <label className="label">
                                <span className="label-text">{key}</span>
                            </label>
                            <Controller
                                key={key}
                                name={key}
                                control={control}
                                rules={{ 
                                    required: {
                                        value: true, 
                                        message: `${key} is required`
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text" 
                                        key={key}
                                        placeholder={key}
                                        className="input input-bordered w-full max-w-lg input-sm" />
                                )}
                                />
                            {
                                errors[key]?.message && 
                                <span className="text-sm pl-2 text-danger-10 animate-fadedown">{`${errors[key]?.message}`}</span>
                            }
                        </div>
                    )
                }
                <div>
                    <span>Get Customer Key and Customer Secret from </span>
                    <a href="https://console.agora.io/restfulApi" target="_blank">https://console.agora.io/restfulApi</a>
                </div>
                <div>
                    <button
                        type="submit"
                        className="btn">
                        Join
                    </button>
                </div>
            </form>
        
            
        </div>
    )
}

export default memo(ChannelForm)