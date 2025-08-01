
import { Asset, CCObject, Pool, SpriteFrame } from "cc";
export interface IPoolObject {
    reInit?(...param: any[]): void;
    onPoolReset(): void;
}
export enum ENUM_OBJ {
    AVATAR_WX = 0,
}
export class ObjectPool {
    private static caches: Map<any, Set<any>> = new Map<any, Set<any>>();
    public static Get<T extends IPoolObject, T2 extends any[]>(con: new (...param: T2) => T, ...param: T2): T {
        if (ObjectPool.caches.has(con)) {
            let cacheSet = this.caches.get(con);
            if (cacheSet.size > 0) {
                for (let re of cacheSet) {
                    cacheSet.delete(re);
                    re.reInit && re.reInit(...param)
                    return re;
                }
            }
            else {
                return new con(...param);
            }
        }
        else {
            return new con(...param);
        }
    }

    public static Push<T extends IPoolObject>(obj: T) {
        let cacheSet = null;
        if (ObjectPool.caches.has(obj.constructor)) {
            cacheSet = ObjectPool.caches.get(obj.constructor);
        }
        else {
            cacheSet = new Set<T>();
            ObjectPool.caches.set(obj.constructor, cacheSet);
        }
        obj.onPoolReset();
        cacheSet.add(obj);
    }


    private static cachesPool: { [key: number]: Pool<any> } = {}
    private static overSize = 10;

    public static GetObjByCCPool<T extends (CCObject | Asset)>(type: ENUM_OBJ, Obj: () => T) {
        let pool = ObjectPool.cachesPool[type];
        if (!pool) {
            try {
                pool = new Pool<T>(Obj, ObjectPool.overSize);
            }catch(e){
                console.log(e);
                
            }
        }
        return pool.alloc();
    }

    public static PushObjByCCPool<T>(type: ENUM_OBJ, Obj: any) {
        let pool = ObjectPool.cachesPool[type];
        if (!pool) {
            return
        }
        pool.free(Obj)
    }
}