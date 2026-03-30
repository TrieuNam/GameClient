import { HandleBase, HandleCollector } from "core/HandleCollector";
import { Singleton } from "core/Singleton";
import { SMDHandle } from "data/HandleCollectorCfg";
import { Looper } from "manager/Looper";
import { ModManger } from "manager/ModManger";
import { Mod} from "../common/ModuleDefine"

class RemindVo {
    private handleCollector: HandleCollector;
    private key_index = 0;

    private modkey: number = 0;
    private handle_list: Map<any, { key: number, check_func: Function }>;
    private remind_frame_list: number[];

    constructor(modkey: number) {
        this.modkey = modkey;

        this.handleCollector = HandleCollector.Create();
        this.handle_list = new Map<any, { key: number, check_func: Function }>();
        this.remind_frame_list = [];
    }

    public Register(origin: any, check_func: Function, ...keys: any[]): HandleBase {
        let vo = { key: this.key_index, check_func: check_func, num: 0 };
        let handle = SMDHandle.Create(origin, this.UpdateRemind.bind(this, vo), ...keys)
        this.handle_list.set(handle, vo);
        this.handleCollector.KeyAdd(this.key_index.toString(), handle)
        this.key_index += 1;
        return handle
    }
    public UnRegister(handle: HandleBase) {
        if (this.handle_list.has(handle)) {
            this.handleCollector.KeyRemove(handle.key);
            this.handle_list.delete(handle);
        }
    }

    private UpdateRemind(vo: any) {
        //减少重复调用
        let frameCount = this.remind_frame_list[vo.key] ?? 0;
        if (Looper.Inst().FrameCount - frameCount > 5) {
            this.remind_frame_list[vo.key] = Looper.Inst().FrameCount;
            setTimeout(this.CheckRemind.bind(this, vo), 100);
        }
    }

    private CheckRemind(vo: any) {
        let num = 0;
        //判断功能开启
        num = vo.check_func();
        if (num != vo.num) {
            vo.num = num;
            RemindCtrl.Inst().UpdateGroupRemind(this.modkey);
        }
    }

    get Num(): number {
        let num = 0;
        this.handle_list.forEach((vo: any) => {
            num += vo.num;
        })
        return num;
    }
}

class RemindGroupVo {
    group_id: any[];
    nums: number[];
    update_funcs: Map<any, Function> = new Map<any, Function>();

    constructor(group_id: any) {
        this.group_id = group_id;
    }

    public Register(func: Function) {
        this.update_funcs.set(func, func);
    }
    public UnRegister(func: Function) {
        this.update_funcs.delete(func);
    }
    public UpdateFunc() {
        this.update_funcs.forEach((func: Function) => {
            func();
        });
    }
    public get Size() {
        return this.update_funcs.size;
    }
}

export class RemindCtrl extends Singleton {
    private remind_vo_list: { [key: number]: RemindVo } = {};
    private group_vo_list: Map<any, RemindGroupVo> = new Map<any, RemindGroupVo>();

    //注册红点
    // modkey: modkey
    // origin==smdata(刷新源)
    // check_func==返回0或者1的方法
    // ...监听的key
    public Register(modkey: number, origin: any, check_func: Function, ...keys: any[]): HandleBase {
        if (this.remind_vo_list[modkey] == undefined) {
            this.remind_vo_list[modkey] = new RemindVo(modkey);
        }
        return this.remind_vo_list[modkey].Register(origin, check_func, ...keys);
    }

    //handle:Register()注册时返回值
    public UnRegister(modkey: number, handle: any) {
        if (this.remind_vo_list[modkey] != undefined) {
            this.remind_vo_list[modkey].UnRegister(handle);
        }
    }

    //注册红点组监听
    public RegisterGroup(group_id: any, func: Function, init_call: boolean): any {
        if (!this.group_vo_list.has(group_id)) {
            this.group_vo_list.set(group_id, new RemindGroupVo(group_id));
        }
        this.group_vo_list.get(group_id).Register(func);
        if (init_call)
            func();
        return func;
    }
    
    //handle:RegisterGroup()注册时返回值
    public UnRegisterGroup(group_id: any, handle: any) {
        if (!this.group_vo_list.has(group_id))
            return;
        let group = this.group_vo_list.get(group_id)
        group.UnRegister(handle);
        if (group.Size == 0) {
            this.group_vo_list.delete(group_id);
        }
    }

    //获取红点数量
    public GetRemindNum(modkey: number) {
        if (!this.remind_vo_list[modkey]) {
            //console.error(`未注册红点modkey: ${modkey}`)
            return 0;
        }
        return this.remind_vo_list[modkey].Num;
    }

    //获取组红点数量
    public GetGroupNum(group_id: any) {
        let num = 0;
        if (group_id == null || !this.group_vo_list.has(group_id)) return num;
        Object.getOwnPropertyNames(group_id).forEach((key) => {

            num += this.GetRemindNum(group_id[key]);
        })
        return num;
    }

    private UpdateOneGroup(group_id: any) {
        if (!this.group_vo_list.has(group_id))
            return;
        this.group_vo_list.get(group_id).UpdateFunc();
    }

    public UpdateGroupRemind(modkey: number) {
        let allGroupKeys = Object.getOwnPropertyNames(Mod);
        for (let index = 0; index < allGroupKeys.length; index++) {
            let groupList = Mod[allGroupKeys[index]];
            let allKeys = Object.getOwnPropertyNames(groupList);
            //modkey可能存在多个组里。不Break
            for (let index2 = 0; index2 < allKeys.length; index2++) {
                if (groupList[allKeys[index2]] == modkey) {
                    this.UpdateOneGroup(groupList);
                    break;
                }
            }
        }
        var tabgroup = ModManger.TabMod(modkey);
        this.UpdateOneGroup(tabgroup);
    }

}
