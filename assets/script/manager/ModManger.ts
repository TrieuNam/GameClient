import { LogError } from "core/Debugger";
import { Singleton } from "core/Singleton";

export class ModManger extends Singleton {
    private modkeyToTable: any[];
    private modToView: Map<any, Function>;
    private viewKeyToMod: Map<string, number | { [key: string]: number }>;

    constructor() {
        super();
        this.modkeyToTable = [];
        this.modToView = new Map<any, Function>();
        this.viewKeyToMod = new Map<string, number | { [key: string]: number }>();
    }

    public RegisterView<T extends Function>(modkey: number | { [key: string]: number } = {}, vClass: T) {
        this.modToView.set(modkey, vClass)
        this.viewKeyToMod.set(vClass.name, modkey)
    }

    public IsView(modkey: number | { [key: string]: number } = {}) {
        return this.modToView.has(modkey);
    }
    public GetView(modkey: number | { [key: string]: number } = {}) {
        return this.modToView.get(modkey);
    }
    public HasMod(key:string){
        return this.viewKeyToMod.has(key)
    }
    public GetMod(key:string){
        return this.viewKeyToMod.get(key)
    }

    //mod_tab = Mod.XX
    public ReigsterModkeyToModTab(mod_tab: { [key: string]: number } = {}) {
        Object.getOwnPropertyNames(mod_tab).forEach((value) => {
            let modkey = mod_tab[value];
            if (this.modkeyToTable[modkey] != undefined) {
                LogError(`重复注册ModTabKey!=== ${modkey}`)
            }
            else {
                this.modkeyToTable[modkey] = mod_tab;
            }
        })
    }

    private ModtableByModkey(modkey: number) {
        if (this.modkeyToTable[modkey] == undefined) {
            return undefined;
        }
        return this.modkeyToTable[modkey];
    }

    public ParseKey(modkey: number | string) {
        if (typeof (modkey) == "string") {
            modkey = parseInt(modkey);
        }
        let mod_tab = this.ModtableByModkey(modkey);
        let key: any = modkey;
        if (mod_tab != undefined) {
            key = mod_tab;
        }
        let param_t = { modkey: modkey };
        return { key: key, param_t: param_t };
    }

    //注册可由策划配表打开的界面
    /* 
        传 Mod.XX 例如 Mod.Bag
    */
    public static DeclareView<T extends Function>(modkey: number | { [key: string]: number } = {}, vClass: T,): void {
        if (typeof (modkey) != "number") {
            ModManger.Inst().ReigsterModkeyToModTab(modkey);
        }
        ModManger.Inst().RegisterView(modkey, vClass);
    }

    //modkey转换成组，用来检测红点组
    private static tableMod: { [key: number]: any } = {};
    public static TabMod(modkey: number) {
        ModManger.tableMod[modkey] = ModManger.tableMod[modkey] ?? { modkey };
        return ModManger.tableMod[modkey];
    }

}