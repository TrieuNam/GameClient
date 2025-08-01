export interface ILifecycle{
    onCreate() : void;
    onDestroy() : void;
}


export function LifecycleCreate<T extends ILifecycle>(con: new () => T) : T{
    let re = new con();
    re.onCreate();
    return re;
}

export function LifecycleDestroy<T extends ILifecycle>(obj : T){
    obj.onDestroy();
}
