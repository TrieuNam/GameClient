import { _decorator, Prefab, NodePool, instantiate, CCString, macro, Node } from "cc";
import { DEBUG } from "cc/env";
import { ResManager } from "manager/ResManager";
import { Debugger, LogError } from "./Debugger";
import { SingletonCom } from "./SingletonCom";

const { ccclass, property } = _decorator;

type _CompleteFunc = (obj: Node | null) => void;

//time=s
type Strategy = {
    cacheReleaseTime: number,  //0表示不做间隔，达到条件直接销毁
    cacheMinCount: number,     //0表示一个都不留，小于0(-1)表示一个都不销毁
    poolReleaseTime: number,   //0表示引用数为0时立即销毁，小于0(-1)表示池子永远不销毁
};

let defaultStrategy: Strategy = {
    cacheReleaseTime: 1000,
    cacheMinCount: 10,
    poolReleaseTime: 40000
}

class Pool {
    private path;
    private original: Prefab;
    private ccPool: NodePool;
    private state: "none" | "loading" | "loaded" | "error" | "release" = "none";
    private waitLoadingFuncs: Set<_CompleteFunc> = null;
    private strategy: Strategy = defaultStrategy;

    private lastReleaseCacheTime: number = 0;  //最后一次释放单个cache的时间
    private refNullTime: number = 0;           //外部引用数置0的时间
    private refCount: number = 0;

    constructor(path: string) {
        // this.strategy
        this.ccPool = new NodePool();
        this.state = "loading";
        this.path = path;
        ResManager.Inst().Load<Prefab>(path, (err, prefab) => {
            if (this.state == "loading") {
                if (err != null || prefab == null) {
                    this.state = "error";
                }
                this.original = prefab;
                this.state = "loaded";
                // this.strategy = defaultStrategy;
                if (this.waitLoadingFuncs != null) {
                    this.waitLoadingFuncs.forEach((com) => {
                        this.Get(com);
                    });
                    this.waitLoadingFuncs.clear();
                    this.waitLoadingFuncs = null;
                }
            }
            else if (this.state == "release") {
                if (this.waitLoadingFuncs != null) {
                    this.waitLoadingFuncs.forEach((com) => {
                        com(null);
                    });
                    this.waitLoadingFuncs.clear();
                    this.waitLoadingFuncs = null;
                }
            }
        });
    }

    public IsLoaded(): boolean {
        return this.state == "loaded";
    }

    Get(onCom: _CompleteFunc) {
        if (this.state == "loaded") {
            onCom(this.GetSync());
        }
        else if (this.state == "loading") {
            ++this.refCount;
            if (this.waitLoadingFuncs == null) {
                this.waitLoadingFuncs = new Set<_CompleteFunc>();
            }
            this.waitLoadingFuncs.add(onCom);
        }
        else if (this.state == "release") {
            onCom(null);
        }
    }

    GetSync(): Node {
        if (this.state == "loaded") {
            ++this.refCount;
            let reObj: Node;
            if (this.ccPool.size() > 0) {
                reObj = this.ccPool.get();
            }
            else {
                if (this.original) {
                    reObj = instantiate(this.original);
                }
            }
            return reObj;
        }
        return null;
    }

    Put(obj: Node) {
        this.ccPool.put(obj);
        if (this.refCount > 0) {
            if (--this.refCount == 0) {
                this.lastReleaseCacheTime = Date.now();
            }
        }
    }

    //return 是否需要释放池子
    Check(now: number): boolean {
        if (this.refCount == 0) {
            if ((now - this.lastReleaseCacheTime) >= this.strategy.poolReleaseTime) {
                return true;
            }
        }
        if (this.ccPool.size() > this.strategy.cacheMinCount) {
            let obj = this.ccPool.get();
            obj.destroy();
            this.lastReleaseCacheTime = now;
        }
        return false;
    }

    Release() {
        if (this.refCount != 0) {
            Debugger.LogError(`Call release but ref is not 0!refCount=${this.refCount}`, this);
        }
        this.original = null;
        this.ccPool.clear();
        this.ccPool = null;
        this.state = "release";
    }
}

@ccclass('NodePools')
export class NodePools extends SingletonCom {

    @property({ type: [CCString] })
    ResidentRes: string[] = [];

    private pools: Map<string, Pool> = new Map<string, Pool>();

    private objToPool: Map<Node, Pool> = new Map<Node, Pool>();

    private initCom: () => void = null;

    onLoad() {
        super.onLoad();
        let now = Date.now();
        this.schedule(() => {
            this.pools.forEach((pool, key, map) => {
                if (pool.Check(now)) {
                    pool.Release();
                    this.pools.delete(key);
                }
            });
        }, 10, macro.REPEAT_FOREVER);
    }

    public Get(path: string, onCom: _CompleteFunc) {
        let pool: Pool = null;
        if (this.pools.has(path)) {
            pool = this.pools.get(path);
        }
        else {
            pool = new Pool(path);
            this.pools.set(path, pool);
        }

        pool.Get((obj) => {
            if (obj) {
                this.objToPool.set(obj, pool);
                onCom(obj);
            } else {
                LogError("！！！注意！！！无法找到资源：" + path, "位置：" + onCom.toString())
            }
        });
    }

    public GetSync(path: string, par?: Node): Node {
        if (this.pools.has(path)) {
            let pool = this.pools.get(path);
            let obj = pool.GetSync();
            if (par) {
                obj.setParent(par);
            }
            // else{}
            // let scene = director.getScene();
            // (<BaseNode>obj).setParent(scene);
            this.objToPool.set(obj, pool);
            return obj;
        }
        return null;
    }

    public Put(obj: Node, destory: boolean = true) {
        if (!obj) {
            return
        }
        if (this.objToPool.has(obj)) {
            this.objToPool.get(obj).Put(obj);
            this.objToPool.delete(obj);
        }
        else if (destory) {
            Debugger.LogError(`Cant find put pool|obj=${obj}`, this);
            obj.destroy();
        }
    }

    public Init(onCom: () => void) {
        this.initCom = onCom;
        this.ResidentRes.forEach((path, idx, arr) => {
            this.registerResidentRes(path);
        })

    }


    update() {
        if (this.initCom !== null) {
            let allCom = true;
            for (let path of this.ResidentRes) {
                let pool = this.pools.get(path);
                if (pool.IsLoaded() == false) {
                    allCom = false;
                    break;
                }
            }
            if (allCom) {
                this.initCom();
                this.initCom = null;
            }
        }
    }


    private registerResidentRes(path: string) {
        let pool = new Pool(path);
        this.pools.set(path, pool);
    }

    // public Release(path:string){
    //     if(this.pools.has(path)){
    //         let pool = this.pools.get(path);
    //         pool.Release();
    //         this.pools.delete(path);
    //     }
    //     else{
    //         Debugger.LogError(`Cant find release pool|path=${path}`,this);
    //     }
    // }


} 