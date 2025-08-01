import { DEBUG, BUILD } from "cc/env";
import { PackageData } from "preload/PkgData";


const _keyKeys = "_SmDataKeys";//存在constructor里
const _keyParent = "_SmDataPar";//存在实例里
const _keyDefaultVal = "_SmDataDV";//存在实例里
const _keyRouterEnable = "_SmDataRouterEnable";//存在实例里
const _keySMDFlag = "_SmDataFlag";      //用于判断对象不是smartdata


export function smartdata(target: any, propertyKey: string) {
    let keySet: Set<string> = target.constructor[_keyKeys];
    if (!keySet) {
        keySet = new Set<string>();
        target.constructor[_keyKeys] = keySet;
    }
    keySet.add(propertyKey);
}

let dataCache: Map<Function, Set<any>> = new Map<Function, Set<any>>();

export function CreateSMD<T>(cons: new () => T): T {
    let r: any = null;
    if (dataCache.has(cons)) {
        let dataSet = dataCache.get(cons);
        if (dataSet.size > 0) {
            for (let d of dataSet) {
                r = d;
                dataSet.delete(d);
                break;
            }
        }
    }
    if (r === null) {
        r = new cons();
        let rDv: any = {};
        r[_keySMDFlag] = true;
        r[_keyDefaultVal] = rDv;
        // console.error(`CreateSMData,name=${cons.name},keys=${(<any>r)._SmDataKeys}`)
        let _smdataKeys: Set<string> = (<any>cons)[_keyKeys];
        if (_smdataKeys) {
            for (let key of _smdataKeys) {
                let value = r[key];
                rDv[key] = value;
                if (value instanceof Object && IsSMD(value)) {
                    value[_keyParent] = { d: r, k: key };
                }
                Object.defineProperty(r, key, {
                    get: function () {
                        // console.log(`Getter for ${key} returned ${value}`);
                        return value;
                    },
                    set: function (newVal: any) {
                        // console.log(`Set ${key} to ${newVal}`);
                        if (value !== newVal) {
                            let parCache = null;
                            if (value instanceof Object && IsSMD(value)) {
                                parCache = value[_keyParent];
                                ReleaseSMD(value);
                            }
                            if (newVal instanceof Object && IsSMD(newVal)) {
                                if (!parCache) {
                                    parCache = { d: r, k: key };
                                }
                                newVal[_keyParent] = parCache;
                            }
                            value = newVal;

                            if (isRouterEnabled(r)) {
                                SmartDatRouter.OnValueChange(r, key);
                                if (IsSMD(r)) {
                                    let rp = r[_keyParent]
                                    while (rp) {
                                        SmartDatRouter.OnValueChange(rp.d, rp.k);
                                        rp = rp.d[_keyParent];
                                    }
                                }
                            }
                        }
                    },
                    enumerable: true,
                    configurable: true
                })
            }
        }
    }
    routerEnable(r, false);
    if (r.OnSMDCreate) {
        r.OnSMDCreate();
    }
    routerEnable(r, true);
    return r;
}

function isRouterEnabled(data: any) {
    return data[_keyRouterEnable];
}

function routerEnable(data: any, enable: boolean) {
    data[_keyRouterEnable] = enable;
}

export function IsSMD(data: Object) {
    return (<any>data)[_keySMDFlag];
}

export function ReleaseSMD(data: any) {
    routerEnable(data, false);
    SmartDatRouter.RemoveCareByData(data);
    if (data.OnSMDRelease) {
        data.OnSMDRelease();
    }
    data[_keyParent] = null;
    let dv = data[_keyDefaultVal];
    for (let key in dv) {
        data[key] = dv[key];
    }

    let set: Set<any> = null;
    if (dataCache.has(data.constructor)) {
        set = dataCache.get(data.constructor);
    }
    else {
        set = new Set<any>();
        dataCache.set(data.constructor, set);
    }
    set.add(data);
}

export function CleanSMDCache() {
    dataCache.clear();
    SmartDatRouter.Clear();
}

export function SMDTriggerNotify(data: any, key?: string) {
    if (!IsSMD(data)) {
        return;
    }
    if (!isRouterEnabled(data)) {
        return;
    }
    SmartDatRouter.OnValueChange(data, key);
    let rp = data[_keyParent]
    while (rp) {
        SmartDatRouter.OnValueChange(rp.d, rp.k);
        rp = rp.d[_keyParent];
    }
}


type Handle = {
    data: any,
    func: Function,
    propertykeys: string[]
};
export class SmartDatRouter {
    private static allKeys = "_allSmartDataCare";
    private static routerHandles: Set<Handle> = new Set<Handle>();
    private static lookupHandles: Map<any, Map<string, Set<Handle>>> = new Map<any, Map<string, Set<Handle>>>();
    public static Update: Function;
    private check = false;
    public static AddDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        if (keys.length === 0) {
            keys = [self.allKeys];
        }
        let handle: Handle = {
            data: smdata,
            func: callback,
            propertykeys: keys
        };
        if (self.lookupHandles.has(smdata)) {
            let k_map = self.lookupHandles.get(smdata);
            for (let key of keys) {
                if (k_map.has(key)) {
                    let s_datas = k_map.get(key);
                    s_datas.add(handle);
                } else {
                    var _handle = new Set<Handle>();
                    _handle.add(handle);
                    k_map.set(key, _handle);
                }
            }

        } else {
            let k_map = new Map<string, Set<Handle>>();
            for (let key of keys) {
                if (k_map.has(key)) {
                    let s_datas = k_map.get(key);
                    s_datas.add(handle);
                } else {
                    var _handle = new Set<Handle>();
                    _handle.add(handle);
                    k_map.set(key, _handle);
                }
            }
            self.lookupHandles.set(smdata, k_map);
        }

        return handle
    }

    public static RemoveDataCare(handle: Handle) {
        let self = this;
        if (self.lookupHandles.has(handle.data)) {
            let lookupData = self.lookupHandles.get(handle.data);
            for (let key of handle.propertykeys) {
                if (lookupData.has(key)) {
                    let setHandle = lookupData.get(key);
                    setHandle.delete(handle);
                    if (setHandle.size === 0) {
                        lookupData.delete(key);
                    }
                }
            }
        }
        if (self.routerHandles.has(handle)) {
            self.routerHandles.delete(handle);
        }
    }

    public static OnValueChange(smdata: any, key?: string) {
        let self = this;
        if (!self.lookupHandles.has(smdata)) {
            return;
        }
        let lookupData = self.lookupHandles.get(smdata);
        if (key) {
            if (lookupData.has(self.allKeys)) {
                let handles = lookupData.get(self.allKeys);
                for (let handle of handles) {
                    self.routerHandles.add(handle);
                }
            }
            if (lookupData.has(key)) {
                let handles = lookupData.get(key);
                for (let handle of handles) {
                    self.routerHandles.add(handle);
                }
            }
        }
        else {
            for (let handles of lookupData.values()) {
                for (let handle of handles) {
                    self.routerHandles.add(handle);
                }
            }
        }


    }

    public static RemoveCareByData(smdata: any) {
        let self = this;
        if (!self.lookupHandles.has(smdata)) {
            return;
        }
        let handleLookup = self.lookupHandles.get(smdata);
        handleLookup.forEach((handleSet) => {
            for (let hand of handleSet) {
                self.routerHandles.delete(hand);
            }
        })
        self.lookupHandles.delete(smdata);
    }


    public static Init() {
        let self = this;
        if (PackageData.Inst().getCheckSMD()) {
            self.Update = self.Update_Editor_Check
        } else {
            if (DEBUG && !BUILD) {
                self.Update = self.Update_Editor
            } else {
                self.Update = self.Update_Publish
            }
        }
    }

    public static Update_Publish() {
        let self = this;
        let handles = self.routerHandles;
        for (let handle of handles) {
            handle.func();
        }
        self.routerHandles.clear();
    }

    public static lastHandle: Handle = undefined;

    public static Update_Editor() {
        let self = this;
        let handles = self.routerHandles;
        if (self.lastHandle != undefined) {
            console.error("!!!! smartData Update error stop to update")
            console.error("!!!!!!!!!!!!!!!!!!!!报错辣 严重报错辣  Update_Editor 已终止后续逻辑!!!!!!!!!!!!!!!!!!!! \n 如无法定位代码请开：PkgData checkSMD", "\n"
                , "代码位置:", "\n", self.lastHandle.func);
            window.confirm("error check Console");
            console.error("已自动开启 checkSMD 如需准确错误log 请重复刚才操作");
            self.Update = self.Update_Editor_Check
        } else {
            for (let handle of handles) {
                self.lastHandle = handle;
                handle.func();
            }
        }
        self.lastHandle = undefined;
        self.routerHandles.clear();
    }

    public static Update_Editor_Check() {
        let self = this;
        let handles = self.routerHandles;
        if (self.lastHandle != undefined) {
            console.error("!!!! smartData Update error stop to update", self.lastHandle.func)
        } else {
            for (let handle of handles) {
                self.lastHandle = handle;
                try {
                    handle.func();
                } catch (e) {
                    console.error("!!!!!!!!!!!!!!!!!!!!报错辣 严重报错辣  Update_Editor_Check 已终止后续逻辑!!!!!!!!!!!!!!!!!!!!", "\n"
                        , "捕捉到的错误:", "\n", e, "\n"
                        , "代码位置:", "\n", self.lastHandle.func);
                    window.confirm("error check Console");
                }
            }
        }
        self.lastHandle = undefined;
        self.routerHandles.clear();
    }

    public static Clear() {
        let self = this;
        self.routerHandles.clear();
        self.lookupHandles.clear();
    }

}
