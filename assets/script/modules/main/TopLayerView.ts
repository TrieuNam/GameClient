import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BoxData } from "modules/box/BoxData";
import { BoxEquipView } from "modules/box/BoxEquipView";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, viewRegcfg, ViewLayer } from "modules/common/BaseView";
import { GMCmdConfig } from "modules/gm_command/GMCmdConfig";
import { GMCmdCtrl } from "modules/gm_command/GMCmdCtrl";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { Timer } from "modules/time/Timer";
import { PackageData } from "preload/PkgData";
import { IS_EDITOR } from "../../GameStart";
import { UH } from "../../helpers/UIHelper";
import { FloatingTextDate } from "./FloatingTextData";


@BaseView.registView
export class TopLayerView extends BaseView {
    private role_cap: number = 0;
    private role_level: number = 0;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TopLayer",
        ViewName: "TopLayerView",
        LayerType: ViewLayer.Top - 1,
    };
    protected viewNode = {
        // RoleCapacityItem:<RoleCapacityItem>null,
        // RoleUpgradeItem:<RoleUpgradeItem>null,
        FloatingText: <FloatingText>null,
        CapShow: <TopLayerViewCapShowItem>null,
    };
    protected extendsCfg = [
        { ResName: "FloatingTextItem", ExtendsClass: FloatingTextItem },
        { ResName: "FloatingTextFadeItem", ExtendsClass: FloatingTextFadeItem },
        // {ResName: "RoleCapacityItem", ExtendsClass: RoleCapacityItem},
        // {ResName: "RoleUpgradeItem", ExtendsClass: RoleUpgradeItem},
        { ResName: "FloatingText", ExtendsClass: FloatingText },

        { ResName: "GMCmdItem", ExtendsClass: GMCmdItem },
        { ResName: "GMItem", ExtendsClass: GMItem },
        { ResName: "GMParamItem", ExtendsClass: GMParamItem },
        { ResName: "CapShowItem", ExtendsClass: TopLayerViewCapShowItem },
    ];
    InitData() {
        this.AddSmartDataCare(FloatingTextDate.Inst().resultData, this.FlushLabelView.bind(this), "val");
        // this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushRoleCapabilityView.bind(this),"capability");
        // this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushRoleLevelView.bind(this),"level");

        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushRoleCapShow.bind(this), "roleCap");
    }
    InitUI() {
    }
    private FlushLabelView() {
        this.viewNode.FloatingText.Init();
    }
    private FlushRoleCapabilityView() {
        // this.viewNode.RoleCapacityItem.Init();
    }
    private FlushRoleLevelView() {
        // this.viewNode.RoleUpgradeItem.Init();
    }

    private FlushRoleCapShow() {
        // this.viewNode.RoleUpgradeItem.Init();
        let role_cap = RoleData.Inst().GetCapability();
        let role_level = RoleData.Inst().GetRoleLevel();


        if (!ViewManager.Inst().IsOpen(BoxEquipView) && !BoxData.Inst().ShowEquipEff && this.role_cap > 0 && role_cap > this.role_cap && role_level == this.role_level) {
            this.viewNode.CapShow.SetData({ cur: role_cap, pre: this.role_cap })
        }
        this.role_cap = role_cap;
        this.role_level = role_level;
    }
}

export class FloatingTextItem extends fgui.GComponent {
    private viewNode = {
        title: <fgui.GTextField>null,
        arrow: <fgui.GLoader>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        UH.SetText(this.viewNode.title, data.desc);

        let show_arrow = undefined != data.arrow
        this.viewNode.arrow.visible = show_arrow
        if (show_arrow) {
            UH.SpriteName(this.viewNode.arrow, "CommonAtlas", data.arrow > 0 ? "JianTouLv" : "JianTouHong2")
        }
    }
}

export class FloatingTextFadeItem extends fgui.GComponent {
    private viewNode = {
        title: <fgui.GTextField>null,
        arrow: <fgui.GLoader>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        UH.SetText(this.viewNode.title, data.desc);

        let show_arrow = undefined != data.arrow
        this.viewNode.arrow.visible = show_arrow
        if (show_arrow) {
            UH.SpriteName(this.viewNode.arrow, "CommonAtlas", data.arrow > 0 ? "JianTouLv" : "JianTouHong2")
        }
    }
}

// export class RoleCapacityItem extends fgui.GComponent {
//     private viewNode = {
//         Capacity: <fgui.GTextField> null,
//         AddCapacity: <fgui.GTextField> null,
//         View: <fgui.GObject> null,
//         Image: <fgui.GObject> null,

//     };
//     private curr_capacity: number = RoleData.Inst().GetCapability();
//     protected onConstruct() {
//         ViewManager.Inst().RegNodeIofo(this.viewNode,this);
//     }
//     public Init(){
//         let capacity = RoleData.Inst().GetCapability();
//         if (this.curr_capacity != 0 && this.curr_capacity != capacity){
//             this.viewNode.View.visible = true;
//             let add_capacity = capacity - this.curr_capacity;
//             if (add_capacity > 0){
//                 this.getTransition("t0").play(() => {
//                     this.viewNode.View.visible = false;
//                 });
//                 UH.SetText(this.viewNode.Capacity,capacity);
//                 UH.SetText(this.viewNode.AddCapacity,"+" + add_capacity);
//                 this.FlushImgSizeView(capacity);
//             }
//         }
//         else{
//             this.viewNode.View.visible = false;
//         }
//         this.curr_capacity = capacity;
//     }
//     private FlushImgSizeView(capacity:number){
//         if (capacity >= 10000000){
//             this.viewNode.Image.setSize(265+this.viewNode.Capacity._width,170);
//         }
//     }
// }

// export class RoleUpgradeItem extends fgui.GComponent {
//     private viewNode = {
//         View: <fgui.GObject> null,
//     };
//     private curr_level: number = RoleData.Inst().GetRoleLevel();
//     protected onConstruct() {
//         ViewManager.Inst().RegNodeIofo(this.viewNode,this);
//     }
//     public Init(){
//         let level = RoleData.Inst().GetRoleLevel();
//         if (this.curr_level != 0 && level > this.curr_level){
//             this.viewNode.View.visible = true;
//             this.getTransition("t0").play(() => {
//                 this.viewNode.View.visible = false;
//             });
//         }
//         else{
//             this.viewNode.View.visible = false;
//         }
//         this.curr_level = level;
//     }
// }

export class GMCmdItem extends fgui.GComponent {
    protected viewNode = {
        Btn: <fgui.GButton>null,
        BtnSend: <fgui.GButton>null,
        BtnTest: <fgui.GButton>null,
        Param: <fgui.GTextInput>null,
        Panel: <fgui.GGroup>null,
        List: <fgui.GList>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        if (this.viewNode.Btn) {
            this.viewNode.Btn.visible = false;
            this.viewNode.BtnTest.visible = false;
        }
        if (IS_EDITOR || (PackageData.Inst().getIsDebug())) {
            this.viewNode.Btn.onClick(this.OnClick, this);
            this.viewNode.BtnSend.onClick(this.OnClickSend, this);
            this.viewNode.BtnTest.onClick(this.OnClickTest, this);
            this.viewNode.List.SetData(GMCmdConfig.List);
            this.viewNode.Btn.visible = true;
            this.viewNode.BtnTest.visible = true;
        }
    }
    private OnClick() {
        this.viewNode.Panel.visible = !this.viewNode.Panel.visible;
    }
    private OnClickSend() {
        if (this.viewNode.Param.text != "") {
            let params_list = this.viewNode.Param.text.split(":");
            GMCmdCtrl.Inst().SendGMCommand(params_list[0], params_list[1] ?? "");
        }
    }
    private OnClickTest() {
        GMCmdCtrl.Inst().TestFunction(this.viewNode.Param.text);
    }
}

export class GMItem extends BaseItem {
    protected viewNode = {
        btn: <fgui.GButton>null,
        item: <GMParamItem[]>Array(3),
    };
    protected onConstruct() {
        super.onConstruct();
        this.viewNode.btn.onClick(this.OnClick, this);
    }
    public SetData(data: any) {
        this.viewNode.btn.title = data.name;
        for (let index = 0; index < this.viewNode.item.length; index++) {
            if (data.params[index]) {
                this.viewNode.item[index].SetData(data.params[index]);
            }
            this.viewNode.item[index].visible = data.params[index] != null;
        }
        this.data = data;
    }
    private OnClick() {
        if (this.IsCanGM()) {
            if (this.data.key == "Battle") {
                BattleCtrl.Inst().test(this.GetParams())
                return
            } else if (this.data.key == "Guide") {
                GuideCtrl.Inst().Start(+this.GetParams())
                return
            } else if (this.data.key == "StopGuide") {
                GuideCtrl.Inst().ForceStop()
                return
            } else if (this.data.key == "Name") {
                RoleCtrl.Inst().SendOutUserInfo(this.GetParams(), "");
                return
            }else if(this.data.key == "OpenViewByKey"){
                ViewManager.Inst().OpenViewByKey(this.GetParams())
                return
            }
            else if (this.data.key == "copyBattle") {

                return
            }
            GMCmdCtrl.Inst().SendGMCommand(this.data.key, this.GetParams());
        }
    }
    private GetParams() {
        let params = "";
        for (let index = 0; index < this.data.params.length; index++) {
            let param = this.viewNode.item[index].GetParam();
            params += (param != "" ? param : 0);
            if (index != this.viewNode.item.length - 1) {
                params += " ";
            }
        }
        return params;
    }
    private IsCanGM() {
        for (let index = 0; index < this.viewNode.item.length; index++) {
            if (this.viewNode.item[index].visible && this.viewNode.item[index].GetParam() == "") {
                return false;
            }
        }
        return true;
    }
}

export class GMParamItem extends BaseItem {
    protected viewNode = {
        name: <fgui.GTextField>null,
        param: <fgui.GTextInput>null,
    };
    public SetData(data: any) {
        let split = data.split(":");
        UH.SetText(this.viewNode.name, split[0]);
        UH.SetText(this.viewNode.param, split[1] ?? "");
    }
    public GetParam() {
        return this.viewNode.param.text;
    }
}

export class TopLayerViewCapShowItem extends BaseItem {
    private timer_handle: any = null;
    protected viewNode = {
        CapShow: <fgui.GTextField>null,
        CapAdd: <fgui.GTextInput>null,
        UIEffectShow: <UIEffectShow>null,
        GpShow: <fgui.GGroup>null,
    };
    public SetData(data: any) {
        if (data.cur > data.pre) {
            Timer.Inst().CancelTimer(this.timer_handle);
            this.viewNode.GpShow.visible = true
            this.viewNode.UIEffectShow.StopEff(4164073)
            this.viewNode.UIEffectShow.PlayEff(4164073)
            this.timer_handle = Timer.Inst().AddRunTimer(() => {
                UH.SetText(this.viewNode.CapShow, data.cur)
                UH.SetText(this.viewNode.CapAdd, `+${data.cur - data.pre}`)
                this.timer_handle = Timer.Inst().AddRunTimer(() => {
                    UH.SetText(this.viewNode.CapShow, "")
                    UH.SetText(this.viewNode.CapAdd, "")
                    this.viewNode.GpShow.visible = false
                }, 0.8, 1, false)
            }, 0.8, 1, false)
        }
    }
}

export class FloatingText extends fgui.GComponent {
    private index: number = 0;
    private count: number = 0;
    private float_list: any[] = [];
    private pool_list: any[] = [];
    private is_playing = false
    private cache = 0
    protected onConstruct() {
    }
    public Init() {
        // if (this.count == 0 && this.float_list.length == 0) {
        // this.CreateItem();
        // }
        // LogError("? Init fff",this.float_list.length)
        if (this.float_list.length == 0) {
            this.FixCreateItem()
        }
        else {
            this.cache = this.cache + 1
        }
    }
    // 取缓存
    private GetInPool() {
        return this.pool_list.pop()
    }
    // 塞入缓存
    private SetInPool(item: any) {
        this.pool_list.push(item)
    }

    private CreateItem() {
        if (this.count >= 5) {
            this.count = 0;
            this.index = 0;
            return;
        }
        let float_data = FloatingTextDate.Inst().GetFloatQuene();
        if (float_data == undefined) {
            this.count = 0;
            this.index = 0;
            return;
        }
        let FloatingTextItem = <FloatingTextItem>fgui.UIPackage.createObject("TopLayer", "FloatingTextItem").asCom;
        let child = this.addChild(FloatingTextItem);
        FloatingTextItem.SetData(float_data);
        child.setPosition(0, (0 - this.index) * FloatingTextItem.height)//this.index * FloatingTextItem.height);
        let trans = FloatingTextItem.getTransition("t0");
        trans.play(() => {
            this.removeChild(FloatingTextItem);
            this.float_list.pop();
            if (this.float_list.length == 0) {
                this.CreateItem()
            }
        });
        this.float_list.push(true);
        trans.setHook("next", () => {
            this.index++;
            this.count++;
            this.CreateItem();
        });
    }

    private WarnFloat() {
        let cheeck = false
        // 帧级计时
        fgui.GTween.to(0, 1, 2)
            .setEase(fgui.EaseType.Linear)
            .onUpdate((tweener: fgui.GTweener) => {
                if (!this.is_playing && this.cache > 0 && !cheeck) {
                    this.FixCreateItem()
                    cheeck = true
                }
            })
    }

    private FixCreateItem() {
        // LogError("?cur ",this.pool_list.length,this.float_list.length)

        let float_data = FloatingTextDate.Inst().GetFloatQuene();
        if (float_data == undefined) {
            this.WarnFloat()
            return;
        }

        let cache = this.GetInPool()
        if (cache == null) {
            let FloatingTextItem = <FloatingTextFadeItem>fgui.UIPackage.createObject("TopLayer", "FloatingTextFadeItem").asCom;
            let child = this.addChild(FloatingTextItem);
            cache = child
        }
        this.cache = 0
        cache.SetData(float_data);
        this.float_list.unshift(cache) // 往开头添加
        this.PlayFloatItem()
    }

    private PlayFloatItem() {
        let total = this.float_list.length - 1
        let offset = 3
        this.is_playing = true

        for (let i = total; i > -1; i--) {
            let height = this.float_list[i].height + offset
            let end_y = height * i * (-1)
            let start_y = end_y + height + (i == 0 ? 5 * height : 0)

            this.float_list[i].visible = true
            fgui.GTween.to(start_y, end_y, 0.3)
                .setEase(fgui.EaseType.Linear)
                .onUpdate((tweener: fgui.GTweener) => {
                    if (this.float_list[i] != null) {
                        this.float_list[i].y = tweener.value.x
                    }
                }).onComplete(() => {
                    if (i == 0) {
                        this.FixCreateItem()
                        this.is_playing = false
                    }
                })

            if (i == 0) {
                let trans = this.float_list[i].getTransition("t0");
                trans.play(() => {
                    // if(!this.is_playing){
                    //     if(this.cache == 0 ){
                    //         this.cache = this.float_list.length
                    //     }
                    //     else if(this.cache < this.float_list.length){
                    //         this.cache = this.float_list.length
                    //     }
                    //     else {
                    //         this.FixCreateItem()
                    //         this.cache = 0
                    //     }
                    // }
                    let item = this.float_list.pop() // 删除并取出最后一个
                    item.visible = false
                    LogError("??",this.float_list.length)
                    if(this.float_list.length == 0)
                    {
                        this.FixCreateItem()
                    }
                    this.SetInPool(item)
                })
            }
        }
    }
}