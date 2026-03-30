import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { TransformByTarget } from "core/TransformByTarget";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, WaitHandle } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { AvatarCell } from "modules/extends/AvatarCell";
import { EGLoader } from "modules/extends/EGLoader";
import { RedPoint } from "modules/extends/RedPoint";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { MainTop } from "modules/main/MainTop";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TYPE_TIMER, Timer } from "modules/time/Timer";
import { Format } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";
import { EscortBoat } from "./EscortBoat";
import { EscortCtrl } from "./EscortCtrl";
import { EscortData, ESCORT_OPER_TYPE } from "./EscortData";
import { EscortGhostRewardItem, EscortGhostBoatItem, EscortGhostRewardCell, GhostTimer } from "./EscortGhostBoat";
import { EscortIntercept } from "./EscortIntercept";
import { EscortRankView } from "./EscortRankView";
import { EscortRecording } from "./EscortRecording";
import { EscortReward } from "./EscortReward";
import { InterceptRecording } from "./InterceptRecording";

@BaseView.registView
export class EscortView extends BaseView {
    private timer_handle: any = null;
    data = EscortData.Inst()
    guide_tag: string[] = []
    loaded_bg = true;
    protected viewRegcfg = {
        UIPackName: "Escort,EscortMap",
        ViewName: "EscortView",
        LayerType: ViewLayer.Buttom,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        // TopInfo: <MainTop>null,
        BtnClose: <fgui.GButton>null,
        BtnRecording: <fgui.GButton>null,
        BtnIntercept: <fgui.GButton>null,
        BtnEscort: <fgui.GButton>null,
        BtnReward: <fgui.GButton>null,
        BtnRank: <fgui.GButton>null,
        EscortBoatInfo: <EscortBoatInfo>null,
        BoatMap: <EscortBoatMap>null,
        RedPoint: <RedPoint>null,
        RedPoint2: <RedPoint>null,
        GhostRewardItem: <EscortGhostRewardItem>null,
        GhostBoatItem: <EscortGhostBoatItem>null,
    };
    //主界面已经拓展过了不需要重复拓展
    protected extendsCfg = [
        { ResName: "BoatInfo", ExtendsClass: EscortBoatInfo },
        { ResName: "BoatMap", ExtendsClass: EscortBoatMap },
        { ResName: "BoatFrame", ExtendsClass: EscortBoatFrame },
        { ResName: "BoatItem", ExtendsClass: EscortBoatItem },
        { ResName: "GhostRewardItem", ExtendsClass: EscortGhostRewardItem },
        { ResName: "GhostBoatItem", ExtendsClass: EscortGhostBoatItem },
        { ResName: "GhostRewardCell", ExtendsClass: EscortGhostRewardCell },
        { ResName: "BoatName", ExtendsClass: EscortBoatName },
        { ResName: "GhostTimer", ExtendsClass: GhostTimer },
        { ResName: "MapItem", ExtendsClass: EscortMapItem },
        { ResName: "BoatTimeItem", ExtendsClass: BoatTimeItem },

    ];

    InitData() {
        // this.viewNode.TopInfo.InitData();
        this.viewNode.EscortBoatInfo.InitData(this.viewNode.BoatMap.scrollPane, this.viewNode.BoatMap.viewNode.BoatFrame);
        this.viewNode.BoatMap.InitData();
        this.AddSmartDataCare(this.data.FlushData, this.OnRoleInfoChange.bind(this), "flush_role_info")
        this.AddSmartDataCare(this.data.FlushData, this.OnShipListChange.bind(this), "flush_ship_list")
        this.AddSmartDataCare(this.data.FlushData, this.FlushGhostView.bind(this), "flush_ghost")
        this.AddSmartDataCare(this.data.FlushData, this.FlushGhostRewardIndex.bind(this), "flush_ghost_reward_index")
        this.AddSmartDataCare(this.data.FlushData, this.FlushGhostShow.bind(this), "is_ghost_open")

        Timer.Inst().CancelTimer(this.timer_handle)
        this.timer_handle = Timer.Inst().AddRunFrameTimer(() => {
            EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.RETCH_REWARD)
            EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.SHIP_LIST_INFO_REQ)
        }, 3, 1, false)
    }

    OnRoleInfoChange() {
        this.viewNode.EscortBoatInfo.OnRoleInfoChange()
        this.viewNode.RedPoint.SetNum(this.data.GetEscortRedPoint())
        this.viewNode.RedPoint2.SetNum(this.data.new_report ? 1 : 0)
    }
    OnShipListChange() {
        // if (this.loaded_bg == true) {
        // }
        this.viewNode.BoatMap.OnShipListChange()
        this.viewNode.EscortBoatInfo.OnShipListChange()
        this.viewNode.RedPoint.SetNum(this.data.GetEscortRedPoint())
        this.viewNode.RedPoint2.SetNum(this.data.new_report ? 1 : 0)
    }

    InitUI() {
        this.viewNode.BtnClose.onClick(this.OnClickClose, this)
        this.viewNode.BtnRecording.onClick(this.OnClickRecording, this)
        this.viewNode.BtnIntercept.onClick(this.OnClickIntercept, this)
        this.viewNode.BtnEscort.onClick(this.OnClickEscort, this)
        this.viewNode.BtnReward.onClick(this.OnClickReward, this)
        this.viewNode.BtnRank.onClick(this.OnClickRank, this)
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("EscortBoatBtn", this.viewNode.BtnEscort))
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("EscortBtnIntercept", this.viewNode.BtnIntercept))

    }
    //排行预览
    OnClickRank() {
        ViewManager.Inst().OpenView(EscortRankView)
    }
    //奖励预览
    OnClickReward() {
        ViewManager.Inst().OpenView(EscortReward)
    }
    //护送船只
    OnClickEscort() {

        /* if (this.data.MyShip.length == 1) {
            PublicPopupCtrl.Inst().Center(Language.Escort.EscortTip)
            return
        } */
        ViewManager.Inst().OpenView(EscortBoat)
        //console.log(fgui.GRoot.inst.touchTarget.name);
    }
    //拦截列表
    OnClickIntercept() {
        ViewManager.Inst().OpenView(InterceptRecording)
        //ViewManager.Inst().OpenView(EscortIntercept)
    }
    //护送记录
    OnClickRecording() {
        ViewManager.Inst().OpenView(EscortRecording)
        this.data.new_report = false
        this.data.FlushData.flush_role_info = !this.data.FlushData.flush_role_info
    }
    //关闭
    OnClickClose() {
        ViewManager.Inst().CloseView(EscortView)
    }

    /* DoOpenWaitHandle() {
        let self = this;
        let waitHandle = self.createWaitHandle("loadBG")
        self.AddWaitHandle(waitHandle);
        this.viewNode.BoatMap.LoadBg(waitHandle, this)
    } */

    OpenCallBack() {
        this.viewNode.EscortBoatInfo.OpenCallBack();
        this.FlushGhostShow();
        this.viewNode.BoatMap.InitUI();
        ViewManager.Inst().registParent(MainTop, this.view);
    }

    CloseCallBack() {
        ViewManager.Inst().returnParent(MainTop);
        GuideCtrl.Inst().ForceStop()
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
        Timer.Inst().CancelTimer(this.timer_handle);
        ChannelAgent.Inst().OnMessage(GameToChannel.view_c_Escort);
    }

    private FlushGhostView() {
        let is_open = this.data.FlushData.is_ghost_open;
        if (is_open) {
            this.viewNode.GhostRewardItem.FlushList();
        }
    }

    private FlushGhostShow() {
        let is_open = this.data.FlushData.is_ghost_open;
        this.viewNode.GhostBoatItem.visible = this.viewNode.GhostRewardItem.visible = is_open;
        if (is_open) {
            this.FlushGhostView();
            this.FlushGhostRewardIndex();
            this.viewNode.GhostBoatItem.FlushTime();
        }
    }

    private FlushGhostRewardIndex() {
        this.viewNode.GhostRewardItem.FlushScrPoY();
        this.viewNode.GhostBoatItem.SetRed();
    }
}

export class EscortBoatInfo extends fgui.GComponent {
    _data = EscortData.Inst()
    handle_list: any = [];
    times: any = []
    mapScorll: fgui.ScrollPane;
    boatFrame: EscortBoatFrame
    private viewNode = {
        BeiJing: <fgui.GImage>null,
        Count1: <fgui.GTextField>null,//剩余拦截次数
        Count2: <fgui.GTextField>null,//剩余护送次数
        Count3: <fgui.GTextField>null,//已被攻击次数
        List: <fgui.GList>null,
        // Time1: <fgui.GTextField>null,//船1护送倒计时
        // Time2: <fgui.GTextField>null,
        // Time3: <fgui.GTextField>null,
        // Button1: <fgui.GButton>null,
        // Button2: <fgui.GButton>null,
        // Button3: <fgui.GButton>null,
        // LevelShow: <fgui.GTextField>null,
        // ExpShow: <fgui.GProgressBar>null,
        // CapShow: <MainCapItem>null,
        // Currency1: <Currency>null,
        // Currency2: <Currency>null,
        // ActItem: <MainActItem>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    InitData(scrollPane: fgui.ScrollPane, boatFrame: EscortBoatFrame) {
        // this.times[0] = this.viewNode.Time1
        // this.times[1] = this.viewNode.Time2
        // this.times[2] = this.viewNode.Time3
        // this.viewNode.Button1.onClick(this.OnClickBoat1, this)
        // this.viewNode.Button2.onClick(this.OnClickBoat2, this)
        // this.viewNode.Button3.onClick(this.OnClickBoat3, this)
        this.mapScorll = scrollPane;
        this.boatFrame = boatFrame;
        this.boatFrame.InitData()
        //背景往下+33
    }
    OnClickBoat1() {
        // console.log("111111111111");
        // this.boatFrame.OnCickTest()

        let boat = this._data.MyShip[0]
        if (boat) {
            let x = this.boatFrame.my_ship.localToGlobal().x
            //全局坐标 x 视窗坐标
            //一开始是0 也就是 scroll x坐标
            //为了吧 全局坐标X 移动到  400这个位置
            if (x > 400) {
                //在右边
                this.mapScorll.setPosX(this.mapScorll.posX + Math.abs(400 - x))
            } else {
                this.mapScorll.setPosX(this.mapScorll.posX - Math.abs(400 - x))
            }
            EscortData.Inst().FlushData.click_posion = !EscortData.Inst().FlushData.click_posion
        }
    }
    OnClickBoat2() {
        let boat = this._data.MyShip[1]
        if (boat) {
            let x = this.boatFrame.ship_list[boat.shipKey].x
            if (x - 400 > 0) {
                this.mapScorll.setPosX(x - 320)
            } else {
                this.mapScorll.setPosX(0)
            }
        }
    }
    OnClickBoat3() {
        let boat = this._data.MyShip[2]
        if (boat) {
            let x = this.boatFrame.ship_list[boat.shipKey].x
            if (x - 400 > 0) {
                this.mapScorll.setPosX(x - 320)
            } else {
                this.mapScorll.setPosX(0)
            }
        }
    }
    OpenCallBack() {
        this.OnRoleInfoChange();
    }
    OnRoleInfoChange() {
        UH.SetText(this.viewNode.Count1, Format(Language.Escort.Count, this._data.GetInterceptTime() - this._data.RoleData.interceptCount, this._data.GetInterceptTime()))
        UH.SetText(this.viewNode.Count2, Format(Language.Escort.Count, this._data.GetEscortTime() - this._data.RoleData.escortCount, this._data.GetEscortTime()))
        UH.SetText(this.viewNode.Count3, Format(Language.Escort.Count, this._data.RoleData.helpCount, this._data.GetHelpTime()))
    }
    OnShipListChange() {
        //船只刷新 显示前3个倒计时
        this.viewNode.List.SetData(this._data.MyShip)
        this.viewNode.BeiJing.height = 159 + (this._data.MyShip.length * 33)
        /* let ship = this._data.MyShip
        for (let index = 0; index < 3; index++) {
            if (ship[index]) {
                Timer.Inst().CancelTimer(this.handle_list[index])
                this.handle_list[index] = Timer.Inst().AddCountDownCT(this.updateBoat0.bind(this, index), this.completeBoat0.bind(this, index), ship[index].overTime, 1, true);
            } else {
                UH.SetText(this.times[index], "-:-")
            }
        } */
    }
    updateBoat0(seq: number) {
        let total_time = this._data.MyShip[seq].overTime
        let times = TimeHelper.FormatDHMS(total_time - TimeCtrl.Inst().ServerTime)
        UH.SetText(this.times[seq], Format(Language.Escort.Time2, times.minute, times.second))
    }
    completeBoat0(seq: number) {
        UH.SetText(this.times[seq], "-:-")
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.RETCH_REWARD)
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.SHIP_LIST_INFO_REQ)
    }
    onDestroy() {
        for (let index = 0; index < this.handle_list.length; index++) {
            Timer.Inst().CancelTimer(this.handle_list[index])
        }
    }
}
export class EscortBoatMap extends fgui.GComponent {
    public viewNode = {
        BeiJing: <EGLoader>null,
        BoatFrame: <EscortBoatFrame>null,
        UIEffectShow: <UIEffectShow>null,
        BoatName: <EscortBoatName>null,
        MapList: <fgui.GList>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.UIEffectShow.PlayEff(4164058)
    }
    InitData() {
        //显示船只列表
        //this.onClick(this.OnClickBeiJing, this)

        // console.log(this.viewNode.List1.viewHeight)
        // console.log(this.viewNode.List1.viewWidth)
        // this.viewNode.List1.resizeToFit()
        // console.log("=======================")
        // console.log(this.viewNode.List1.viewHeight)
        // console.log(this.viewNode.List1.viewWidth)
        //this.viewNode.List.onClick(this.OnClickBeiJing, this)
    }
    InitUI() {
        let maps = []
        for (let index = 0; index < 100; index++) {
            maps[index] = index + 1;
        }
        //console.log(maps);

        // this.viewNode.MapList.setVirtual()
        this.viewNode.MapList.SetData(maps)
    }
    /* loadbg_time: number = 0
    LoadBg(waitHandle: WaitHandle, view: EscortView) {
        //this.loadbg_time = TimeCtrl.Inst().ClientTime
        //LogError("start load bg ", this.loadbg_time)
        this.viewNode.BeiJing.SetIcon("loader/escort/BeiJing", () => {
            waitHandle.complete = true;
            //LogError("end load bg ", TimeCtrl.Inst().ClientTime)
            //LogError("cost time ", TimeCtrl.Inst().ClientTime - this.loadbg_time)
            if (this.viewNode.BeiJing != undefined) {
                this.viewNode.BeiJing.width = 1626
            }
            view.loaded_bg = true
            this.OnShipListChange()
        })
    } */
    protected onDestroy(): void {
        this.viewNode.BeiJing.icon = null
    }
    OnShipListChange() {
        this.viewNode.BoatFrame.OnShipListChange(this)
    }
    OnClickBeiJing() {
        // console.log(fgui.GRoot.inst.touchTarget.name);
        // console.log(fgui.GRoot.inst.getTouchPosition());
    }
}
export class EscortBoatFrame extends fgui.GComponent {
    data: EscortData = EscortData.Inst()
    ship_list: EscortBoatItem[] = []
    cache_list: EscortBoatItem[] = []
    tweener: fgui.GTweener | null = null;
    my_ship: EscortBoatItem = null;
    my_ship_list: EscortBoatItem[] = []
    my_ship_names: EscortBoatName[] = []
    private viewNode = {
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    InitData() {
        this.ship_list = []
        this.cache_list = []
    }
    protected onDestroy(): void {
        this.my_ship = null;
        if (this.tweener) {
            this.tweener.kill();
            this.tweener = null
        }
        this.ship_list.forEach(element => {
            element = undefined
        });
    }
    OnShipListChange(viewParent: EscortBoatMap) {
        // console.log("船只变化");
        // console.log(this.data.MyShip);

        // console.log(this.data.ShipList);

        // this.ship_list.forEach(element => {
        //     element.dispose()
        // });
        // this.ship_list = []
        // for (let index = 0; index < this.data.MyShip.length; index++) {
        //     const element = this.data.MyShip[index];
        //     if (this.ship_list[element.shipKey] == null) {
        //         let boat = <EscortBoatItem>fgui.UIPackage.createObject("Escort", "BoatItem", EscortBoatItem)
        //         this.ship_list[element.shipKey] = boat;
        //         boat.SetData(element)
        //         this.addChild(boat)
        //     }
        // }

        //console.log("刷新船只");
        if (this.tweener) {
            this.tweener.kill();
            this.tweener = null
        }
        /* if (this.my_ship) {
            this.my_ship.visible = false
            boatName.visible = false
        } */
        this.my_ship_list.forEach(element => {
            if (element) {
                element.visible = false
                //this.my_ship.visible = false
                //boatName.visible = false
            }
        });
        this.my_ship_names.forEach(element => {
            if (element) {
                element.visible = false
                //this.my_ship.visible = false
                //boatName.visible = false
            }
        });
        /* let tfb = boatName.node.getComponent(TransformByTarget)
        if (!tfb) {
            tfb = boatName.node.addComponent(TransformByTarget);
        } */
        //console.error(this.data.MyShip);

        for (let index = 0; index < this.data.MyShip.length; index++) {
            const element = this.data.MyShip[index];
            if (this.my_ship_list[index] == null) {
                let boat = <EscortBoatItem>fgui.UIPackage.createObject("Escort", "BoatItem", EscortBoatItem)
                let nameItem = <EscortBoatName>fgui.UIPackage.createObject("Escort", "BoatName", EscortBoatName)
                this.my_ship_list[index] = boat
                this.my_ship_names[index] = nameItem
                let tfb = nameItem.node.getComponent(TransformByTarget)
                if (!tfb) {
                    tfb = nameItem.node.addComponent(TransformByTarget);
                }
                viewParent.addChild(nameItem)
                //this.my_ship = boat
                tfb.target = boat.node
                let key = element.ship + 1
                if (key == 1) {
                    tfb.setDis(0, -50)
                } else if (key == 2) {
                    tfb.setDis(0, -43)
                } else if (key == 5 || key == 6) {
                    tfb.setDis(0, 8)
                }
                tfb.node.active = true
                nameItem.SetData()
                //nameItem.rotation = 30
                boat.visible = true
                boat.SetData(element, nameItem)
                this.addChild(boat)
            } else {
                let boat = this.my_ship_list[index]//this.my_ship
                let nameItem = this.my_ship_names[index]
                boat.visible = true
                boat.SetData(element)
                nameItem.visible = true
                nameItem.SetData()
                //this.addChild(boat)
            }
        }

        //console.log(this.data.ShipList.length);

        let count = 0
        let total_count = this.data.ShipList.length
        //console.log("data ship count ", total_count);

        let step_count = 1
        let ship_count = this.ship_list.length
        //console.log("ship count ", this.ship_list.length);
        let cache_count = 0
        // console.log("offset count ", (total_count - ship_count))
        // console.log("cache count ", this.cache_list.length);


        // 顺序存，然后我要用的不关 
        this.ship_list.forEach(element => {
            cache_count = cache_count + 1
            if (total_count > ship_count) {
                if (cache_count < (total_count - ship_count)) {
                    //console.log("");
                    element.visible = false
                }
            }
            this.cache_list.push(element);
        });
        //console.log("cache count ", this.cache_list.length);        

        this.tweener = fgui.GTween.to(0, 100, 100).onUpdate((tweener: fgui.GTweener) => {
            //console.log("step start");
            if (count == 0) {
                this.ship_list = []
            }
            for (let index = 0; index < step_count; index++) {
                //console.log(count);
                let data = this.data.ShipList[count]
                if (data) {
                    let boat = this.cache_list.pop()
                    if (boat == null) {
                        boat = <EscortBoatItem>fgui.UIPackage.createObject("Escort", "BoatItem", EscortBoatItem)
                    }
                    if (boat.visible == false) {
                        boat.visible = true
                    }
                    boat.SetData(data)
                    this.addChild(boat)
                    this.ship_list.push(boat);
                }
                count = count + 1
            }
            total_count = total_count - step_count
            if (total_count <= 0) {
                // console.log("new ship count  ", this.ship_list.length);
                // console.log("new cache ship count  ", this.cache_list.length);
                this.cache_list.forEach(element => {
                    element.visible = false
                });

                if (this.tweener) {
                    this.tweener.kill();
                    this.tweener = null
                }
            }
        }).setDelay(0.1)

        /* for (let index = 0; index < this.data.ShipList.length; index++) {
            const element = this.data.ShipList[index];
            if (this.ship_list[index + this.data.MyShip.length] == null) {
                let boat = <EscortBoatItem>fgui.UIPackage.createObject("Escort", "BoatItem", EscortBoatItem)
                this.ship_list[index + this.data.MyShip.length] = boat;
                boat.SetData(element)
                this.addChild(boat)
            } else {
                let boat = this.ship_list[index + this.data.MyShip.length]
                boat.SetData(element)
                this.addChild(boat)
            }
        } */

        // for (let index = 0; index < this.data.ShipList.length; index++) {
        //     const element = this.data.ShipList[index];
        //     if (this.ship_list[element.shipKey] == null) {
        //         let boat = <EscortBoatItem>fgui.UIPackage.createObject("Escort", "BoatItem", EscortBoatItem)
        //         this.ship_list[element.shipKey] = boat;
        //         boat.SetData(element)
        //         this.addChild(boat)
        //     }
        // }
        //console.log(this.ship_list);

        //创建对应船只并进行位置摆放
        /* let boat = fgui.UIPackage.createObject("Escort","BoatItem", EscortBoatItem)
        console.log(boat.name);
        boat.name = "new Boat"
        this.addChild(boat); */
    }
}
export class EscortBoatName extends fgui.GComponent {
    private viewNode = {
        Mine: <fgui.GImage>null,
        Name: <fgui.GTextField>null,
        AvatarCell: <AvatarCell>null
    }
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    SetData() {
        this.viewNode.AvatarCell.DefaultShow()
        this.viewNode.Name.text = RoleData.Inst().GetRoleName()
    }
    ShowMine(flag: boolean) {
        this.viewNode.Mine.visible = flag
    }
}
export class EscortBoatItem extends fgui.GComponent {
    escort_data = EscortData.Inst()
    _data: IPB_SCEscortShipData;
    protected handleCollector: HandleCollector;
    handle: any;
    handle2: any;
    _boatName: EscortBoatName = null;
    private viewNode = {
        ShipSp: <fgui.GLoader>null,
        EffectShow: <UIEffectShow>null,
        Desc: <fgui.GTextField>null,
        //Mine: <fgui.GImage>null,

        // NameBg: <fgui.GImage>null,

        //Name: <fgui.GTextField>null,
        //AvatarCell: <AvatarCell>null,
        //Top: <fgui.GGroup>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.handleCollector = HandleCollector.Create();
    }
    SetData(data: IPB_SCEscortShipData, boatName: EscortBoatName = null) {
        this._data = data
        this._boatName = boatName;
        //console.log(data);
        let s = 200//350
        let i = 12//5
        let d = 80//160
        let ys = 200//140
        let ye = 1100
        this.name = "Boat" + data.shipKey
        this.rotation = 30
        let row = (data.shipKey - 1) % i
        row = this.escort_data.board_road[row]
        this.x = s + (row * d)
        UH.SpriteName(this.viewNode.ShipSp, "Escort", "ChuanDa" + (data.ship + 1))
        let boat_data = this.escort_data.GetBoatData(data.ship)
        let total_time = boat_data.time * 60
        //data.overTime
        UH.SetText(this.viewNode.Desc, "key:" + data.shipKey + " count:" + data.beIntercept)
        let sur_time = data.overTime - TimeCtrl.Inst().ServerTime
        this.y = (1 - (sur_time / total_time)) * (ye - ys) + ys
        this.onClick(this.OnClickBoat, this)
        // console.log(data);
        // console.log(boat_data);
        if (data.beIntercept >= boat_data.intercept_num) {
            if (data.isHelp == 0) {
                this.viewNode.EffectShow.PlayEff(4164012)
            } else {
                this.viewNode.EffectShow.StopEff(4164012)
            }
        } else {
            this.viewNode.EffectShow.StopEff(4164012)
        }
        //this.viewNode.Mine.visible = false
        this.AddSmartDataCare(this.escort_data.FlushData, this.OnClickPositon.bind(this), "click_posion")

        /* if (this._data.uid == RoleData.Inst().GetRoleId()) {
            //this.viewNode.Top.visible = true
            let key = data.ship + 1
            if (key == 5 || key == 6) {
                this.viewNode.Top.y = -128
            } else if (key == 4) {
                this.viewNode.Top.y = -113
            } else {
                this.viewNode.Top.y = -70
            }
            //-128
            // this.viewNode.AvatarCell.visible = true
            // this.viewNode.NameBg.visible = true
            // this.viewNode.Name.visible = true
            this.viewNode.AvatarCell.DefaultShow()
            this.viewNode.Name.text = RoleData.Inst().GetRoleName()
        } else {
            // this.viewNode.Top.visible = false
            // this.viewNode.AvatarCell.visible = false
            // this.viewNode.NameBg.visible = false
            // this.viewNode.Name.visible = false
        } */
    }
    OnClickPositon() {
        if (this._data.uid == RoleData.Inst().GetRoleId()) {
            //this.viewNode.Mine.visible = true
            if (this._boatName != null) {
                this._boatName.ShowMine(true)
            }
            if (this.handle == null) {
                this.handle = Timer.Inst().AddRunTimer(this.HideMine.bind(this), 5, 1, false)
            }
        }
    }
    HideMine() {
        //this.viewNode.Mine.visible = false
        if (this._boatName != null) {
            this._boatName.ShowMine(false)
        }
        this.handle = null
    }
    OnClickBoat() {
        console.log(this._data.shipKey);
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.SHIP_INFO_REQ, this._data.shipKey)
        fgui.GTween.to(0, 1, 0.1).onComplete(() => {
            let info = this.escort_data.GetShipInfo(this._data.shipKey)
            let boat_data = this.escort_data.GetBoatData(this._data.ship)
            if (info != null) {
                if (this._data.beIntercept >= boat_data.intercept_num) {
                    //console.log("救火");
                    if (this._data.isHelp == 0) {
                        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.HELP, this._data.shipKey)
                    } else {
                        if (this._data.uid == RoleData.Inst().GetRoleId()) {
                            PublicPopupCtrl.Inst().Center(Language.Escort.MySelf)
                            return
                        }
                    }
                } else {
                    if (this._data.uid == RoleData.Inst().GetRoleId()) {
                        PublicPopupCtrl.Inst().Center(Language.Escort.MySelf)
                        return
                    }
                    //console.log("拦截");
                    ViewManager.Inst().OpenView(EscortIntercept, info)
                }
            } else {
                if (this._data.uid == RoleData.Inst().GetRoleId()) {
                    PublicPopupCtrl.Inst().Center(Language.Escort.MySelf)
                }
            }
        })

    }
    public AddSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    public RemoveSmartDataCare() {
        let self = this;
        HandleCollector.Destory(self.handleCollector);
        self.handleCollector = null;
    }
    onDestroy() {
        this.RemoveSmartDataCare()
        if (this.handle) {
            Timer.Inst().CancelTimer(this.handle)
            this.handle = null
        }
    }
}

export class EscortMapItem extends fgui.GComponent {
    private _ht: TYPE_TIMER;
    private viewNode = {
        Icon: <fgui.GLoader>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    SetData(data: number) {
        let mod = data % 10
        if (mod > 5) {
            this._ht = Timer.Inst().AddRunTimer(() => {
                UH.SpriteName(this.viewNode.Icon, "EscortMap", "BeiJing_" + data)
                this._ht = undefined;
            }, 0.1 * mod, 1, false);
        } else {
            UH.SpriteName(this.viewNode.Icon, "EscortMap", "BeiJing_" + data)
        }
    }
    protected onDestroy(): void {
        if (this._ht) {
            Timer.Inst().CancelTimer(this._ht);
            this._ht = undefined;
        }
    }
}
class BoatTimeItem extends BaseItem {
    protected viewNode = {
        Time: <fgui.GTextField>null,
    };
    protected _data: any = null;
    handle: any = null
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: IPB_SCEscortShipData) {
        this._data = data;
        Timer.Inst().CancelTimer(this.handle)
        this.handle = Timer.Inst().AddCountDownCT(this.updateBoat0.bind(this), this.completeBoat0.bind(this), data.overTime, 1, true);
    }
    updateBoat0(seq: number) {
        let total_time = this._data.overTime
        let times = TimeHelper.FormatDHMS(total_time - TimeCtrl.Inst().ServerTime)
        UH.SetText(this.viewNode.Time, Format(Language.Escort.Time2, times.minute, times.second))
    }
    completeBoat0(seq: number) {
        UH.SetText(this.viewNode.Time, "-:-")
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.RETCH_REWARD)
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.SHIP_LIST_INFO_REQ)
    }
    onDestroy() {
        Timer.Inst().CancelTimer(this.handle)
    }
    public GetData() {
        return this._data;
    }
}