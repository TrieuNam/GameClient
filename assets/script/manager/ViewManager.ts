
import { Font, Vec2, js } from "cc";
import { EDITOR } from "cc/env";
import { GetCfgValue } from "config/CfgCommon";
import { LogError } from "core/Debugger";
import { Singleton } from "core/Singleton";
import * as fgui from "fairygui-cc";
import { BlockShow } from "modules/block/BlockItems";
import { CommonComboBox } from "modules/box/BoxTrustView";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { CommonContext } from "modules/common/CommonContext";
import { CommonEvent } from "modules/common/CommonEvent";
import { ConstValue } from "modules/common/ConstValue";
import { EventCtrl } from "modules/common/EventCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { WxVibrate } from "modules/common/WxVibrate";
import { CommonBoard2, CommonBoard2_2 } from "modules/common_board/CommonBoard2";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { CommonBoard5, CommonBoard5Tab } from "modules/common_board/CommonBoard5";
import { CommonBoard6, CommonBoard6Tab } from "modules/common_board/CommonBoard6";
import { CommonBoardCC, CoreCrisisBgShow, CoreCrisisNameShow } from "modules/common_board/CommonBoardCC";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { AttrAddItemCell, AttrItem, AttrItemCell, AttrTitleCell } from "modules/common_item/AttrItem";
import { RoleTitleItem1, RoleTitleItem2 } from "modules/common_item/RoleTitleItems";
import { ActItemCellName } from "modules/extends/ActItemCellName";
import { AvatarCell, AvatarGuildCell } from "modules/extends/AvatarCell";
import { CommonButton, CommonButtonHelp } from "modules/extends/CommonButton";
import { Currency, Currency2 } from "modules/extends/Currency";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell, ItemCellAngel, ItemCellBlock, ItemCellEquip, ItemCellFishCollect, ItemCellFishEquip, ItemCellShiLian } from "modules/extends/ItemCell";
import { PetAvatarCell } from "modules/extends/PetAvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { SkillCell } from "modules/extends/SkillCell";
import { TimeMeter } from "modules/extends/TimeMeter";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { GuideView } from "modules/guide/GuideView";
import { GetWayItem } from "modules/item_info/ItemInfoView";
import { WaitView } from "modules/login/WaitView";
import { MainCapBigItem, MainCapItem, MainCapNumBigItem, MainCapNumItem } from "modules/main/MainItems";
import { MainView } from "modules/main/MainView";
import { MaskView } from "modules/main/MaskView";
import { TopLayerView } from "modules/main/TopLayerView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { InputManager } from "./InputManager";
import { ModManger } from "./ModManger";
import { ResManager } from "./ResManager";
import { PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";


// import { EmptyTip } from "modules/extends/EmptyTip";


export type c_viewRegInfo = {
    viewClass: new (p?: any) => BaseView,
    view?: BaseView,
    key: string,
    param?: any,
    isOpenAready?: boolean,
    isNew?: boolean,
}

export let VIEW_NAME_STATIC: { [key: string]: boolean } = {
    ["GuideView"]: true,
    ["MaskView"]: true,
    ["TopLayerView"]: true,
    ["FillView"]: true,
}
export class ViewManager extends Singleton {

    private initCom: () => void = null;
    private sortOrder: { [layer: number]: number[] } = {};
    // private _views: { [key: string]: BaseView };
    private _views: Map<string, BaseView>;
    // private _uniqueId: { [key: string]: string };
    private _regesterInfo: { [key: string]: c_viewRegInfo } = BaseView._regesterInfo
    private _openStart: string[]; //开启中UI
    private _opens: string[]; //开启中UI
    private loadCount = 0;
    private needLoadCount = 2;
    public poolPackages: string[]; //fgui包池
    private _commonPkgLoaded = false;
    public get commonPkgLoaded() {
        return this._commonPkgLoaded;
    }

    public Init(onCom: () => void) {
        let self = this;
        self.ensureGListCompat();
        self._views = new Map();
        // self._regesterInfo = {};
        // self._uniqueId = {};
        self._opens = [];
        self._openStart = [];
        self.poolPackages = [];
        self.initCom = onCom;
        self.loadFont();
        //self.loadLocalization();
        // self.loadCommonPack();
        self.loadFirstShowCommonPack();
        fgui.GRoot.create();
        fgui.GRoot.inst.node.addComponent(InputManager);
        window.onresize = self.windowSizeChange.bind(self);
    }

    private ensureGListCompat() {
        const proto: any = (fgui as any).GList && (fgui as any).GList.prototype;
        const setDataEvent = (fgui.Event as any).SETDATA;
        if (!proto) {
            return;
        }

        if (typeof proto.SetData !== "function") {
            proto.SetData = function (data: any[], click?: Function, selectedIndex?: number) {
                data = data || [];
                this.itemRenderer = (index: number, item: any) => {
                    if (item && typeof item.SetData === "function") {
                        item.SetData(data[index]);
                    }
                };
                this.numItems = data.length;

                if (typeof click === "function") {
                    this.off(fgui.Event.CLICK_ITEM);
                    this.on(fgui.Event.CLICK_ITEM, click);
                }

                if (selectedIndex != null && selectedIndex >= 0 && typeof this.OnSelectedItem === "function") {
                    this.OnSelectedItem(selectedIndex);
                }

                if (setDataEvent) {
                    this.node?.emit?.(setDataEvent);
                }
            };
        }

        if (typeof proto.OnSelectedItem !== "function") {
            proto.OnSelectedItem = function (index: number) {
                if (index == null || index < 0) {
                    return;
                }
                this.selectedIndex = index;
                let item = this.getChildAt ? this.getChildAt(index) : null;
                if (!item && this.itemIndexToChildIndex) {
                    const childIndex = this.itemIndexToChildIndex(index);
                    item = this.getChildAt ? this.getChildAt(childIndex) : null;
                }
                if (item) {
                    this.node?.emit?.(fgui.Event.CLICK_ITEM, item);
                }
            };
        }
    }

    public windowSizeChange() {
        let self = this;
        for (let index = 0; index < self._opens.length; index++) {
            const key = self._opens[index];
            const openView = self._views.get(key);
            openView.ReSetWindowSize();
        }
    }

    public RegNodeIofo(val: any, view: any) {
        let self = this;
        let nodeInfo = val;
        let propNames = Object.getOwnPropertyNames(nodeInfo);
        const len = propNames.length;
        for (let index = 0; index < len; index++) {
            const key = propNames[index];
            var val_key = nodeInfo[key];
            if (val_key) {
                if (val_key.length != null) {
                    for (let i = 0; i < val_key.length; i++) {
                        val_key[i] = view.getChild(key + i);
                        if (val_key[i] == null) {
                            console.log(key + i);
                        }
                    }
                }
                // else {
                //     let com = view.getChild(key, fgui.GComponent);
                //     self.RegNodeIofo(val_key, com)
                // }
            } else {
                Object.defineProperty(nodeInfo, key, {
                    get: function () {
                        let node = view.getChild(key);
                        if (node == null) {
                            console.error("节点缺失请重新导出UI =====" + view.packageItem.name, key);
                            return;
                        }
                        Object.defineProperty(nodeInfo, key, { value: node, writable: true })
                        return node
                    },
                    set: function (val: any) {
                        Object.defineProperty(nodeInfo, key, { value: val, writable: true })
                    }
                })
            }
        }
        return nodeInfo
    }

    public OpenViewByKey(modkey: number | string, param?: any, dont_check?: Boolean): boolean {
        if (typeof (modkey) == "string") {
            modkey = parseInt(modkey);
        }
        if (dont_check == undefined || dont_check != true) {
            let open_t = FunOpen.Inst().GetFunIsOpen(modkey);
            if (!open_t.is_open) {
                PublicPopupCtrl.Inst().Center(open_t.content);
                return false;
            }
        }
        let { key, param_t } = ModManger.Inst().ParseKey(modkey);
        if (ModManger.Inst().IsView(key)) {
            let vClass = ModManger.Inst().GetView(key);
            if (this.IsOpen(vClass)) {
                this.selectTabbar(vClass, modkey);
                if (modkey == Mod.Main.View) {
                    this.ShowMain()
                }
            }
            else {
                this.OpenView(vClass, param ? param : param_t, true);
            }
        }
        return true;
    }

    private selectTabbar(vClass: any, modkey: number) {
        let info = this.getViewRegInfo(vClass)
        if (info && info.view) {
            info.view.SelectTabbar(modkey);
        }
    }

    /**
     * 打开页面
     * @param vCLass 页面类名
     * @param param 参数
     */
    public OpenView<T extends Function>(vClass: T | string, param?: any, dont_check = false): BaseView {
        let self = this;
        let info: c_viewRegInfo = self.getViewRegInfo(vClass);
        //console.log(ModManger.Inst().GetMod(info.key));
        //console.log(info.key);
        if (!dont_check) {
            let open_t = FunOpen.Inst().GetFunIsOpen(info.key);
            if (!open_t.is_open) {
                PublicPopupCtrl.Inst().Center(open_t.content);
                return;
            }
        }

        if (info) {
            info.param = param;
            let key = info.key;
            let view: BaseView = self._views.get(key);
            if (view) {
                console.error("界面已打开");
                return view;
            }
            view = info.view
            // let isCreat = false
            if (!view || !info.isNew) {
                // isCreat = true
                view = new info.viewClass(info);
                info.view = view;
            }
            view.name = key;
            self.addOpenStart(key);
            self._views.set(key, view);
            // self._uniqueId[view.id] = info.key;
            self.openViewEasy(info);
            let guide_cfg = GuideCtrl.Inst().CurStepCfg();
            if (guide_cfg && guide_cfg.step_param_2 != info.key) {
                GuideCtrl.Inst().ForceStop();
            }
            return view;
        }
    }

    public getViewRegInfo<T extends Function>(vClass: T | string | BaseView) {
        let vName = vClass as any;
        let key: string;
        let info: c_viewRegInfo;
        if (vName.name) {
            if (!EDITOR) {
                key = js.getClassName(vClass);
            } else
                key = vName.name
        } else {
            key = vName
        }
        info = this._regesterInfo[key];
        if (!info) {
            LogError("ViewManager getViewRegInfo undefined", key);
        }
        return info;
    }

    private openViewEasy(info: c_viewRegInfo) {
        let self = this;
        let key = info.key;
        let view = info.view;
        view.LoadResource(info, () => {
            view.InitData(info.param);
            view.InitUI();
        }, () => {
            self.addOpens(key);
            view.Open();
            if (view.ViewRegCfg().ViewMask && self.getMask()) {
                self.getMask().SetParentView(view);
            }
        })
    }

    private getMask() {
        return this._views.get(MaskView.prototype.name);
    }

    private addOpens(key: string, isTop: boolean = false): void {
        let index = this._opens.indexOf(key);
        if (index >= 0) {
            this._opens.splice(index, 1);
        }
        this._opens.push(key);
    }

    private addOpenStart(key: string, isTop: boolean = false): void {
        let index = this._openStart.indexOf(key);
        if (index >= 0) {
            this._openStart.splice(index, 1);
        }
        this._openStart.push(key);
    }

    public IsOpen(vClassOrObj: any) {
        let info: c_viewRegInfo = this.getViewRegInfo(vClassOrObj);
        if (info) {
            let key = info.key;
            let view: BaseView = this._views.get(key);
            if (view) {
                return true;
            }
        }
        return false;
    }
    //完成了openCallback的界面
    public IsOpened(vClassOrObj: any) {
        let info: c_viewRegInfo = this.getViewRegInfo(vClassOrObj);
        return this._opens.indexOf(info.key) >= 0;
    }

    public getView<T extends BaseView>(vClassOrObj: any): T {
        let info: c_viewRegInfo = this.getViewRegInfo(vClassOrObj);
        if (info) {
            let key = info.key;
            let view: BaseView = this._views.get(key);
            if (view) {
                return view as T;
            }
        }
        return;
    }

    public IsTopView(vClassOrObj: any, in_index?: number) {
        let info: c_viewRegInfo = this.getViewRegInfo(vClassOrObj);
        if (info) {
            let temp = this._openStart.filter((value: string) => {
                return value != this.getViewRegInfo(TopLayerView).key && value != this.getViewRegInfo(GuideView).key && value != this.getViewRegInfo(WaitView).key;
            })
            let key = info.key;
            let index = temp.length - 1
            if (in_index) {
                index -= in_index
            }
            return temp && temp[index] == key;
        }
        return false;
    }

    public CloseView<T extends Function>(vClass: T | string | BaseView) {
        let self = this;
        self.closeEasy(vClass);
    }

    public IsViewOpened(view_name: string) {
        return this._views.has(view_name);
    }
    //简单关闭一个窗口
    private closeEasy(vClass: any) {
        let self = this;
        let info: c_viewRegInfo = self.getViewRegInfo(vClass);
        if (!info) {
            return;
        }

        let key = info.key;
        let view: BaseView = info.view;
        if (view) {
            let viewIndex = self._opens.indexOf(key);
            if (viewIndex >= 0) {
                self._opens.splice(viewIndex, 1);
            }

            let viewIndex2 = self._openStart.indexOf(key);
            if (viewIndex >= 0) {
                self._openStart.splice(viewIndex2, 1);
            }
            self._views.delete(key);
            // delete self._views[key];
            // delete self._uniqueId[view.id];
            view.Close();
            EventCtrl.Inst().emit(CommonEvent.VIEW_CLOSE, key, info.viewClass)
            if (this.getMask()) {
                let viewMask = view.ViewRegCfg().ViewMask;
                if (viewMask == ViewMask.BgBlock || viewMask == ViewMask.BgBlockClose) {
                    this.getMask().ViewNode().BG.visible = false;
                }
                if (viewMask == ViewMask.BlockClose || viewMask == ViewMask.BgBlockClose) {
                    this.getMask().ViewNode().Block.visible = false;
                }
                //判断上一个界面是否有蒙版
                let lase_key = self._opens[self._opens.length - 1];
                if (lase_key && lase_key != undefined) {
                    let last_view = this._views.get(lase_key);
                    if (last_view && last_view != undefined) {
                        if (last_view.ViewRegCfg().ViewMask) {
                            self.getMask().SetParentView(last_view);
                        }
                    }
                }
            }
            if (!info.isNew) {
                info.view = undefined;
            }
        }
    }

    public MainViewVisible(visible: boolean, view_name?: string) {
        let show_main = visible
        for (let [key, value] of this._views) {
            if (value.ViewRegCfg().LayerType == ViewLayer.Buttom && (key != view_name) && (!GetCfgValue(VIEW_NAME_STATIC, key))) {
                show_main = false
                value.view.visible = visible
            } else {
                if (!visible && (key != view_name) && (!GetCfgValue(VIEW_NAME_STATIC, key)) && MainView.prototype.name != key) {
                    this.CloseView(key)
                }
            }
        }
        this._views.get(MainView.prototype.name).view.visible = show_main
    }

    public ShowMain() {
        for (let [key, value] of this._views) {
            if (key == MainView.prototype.name) {
                this._views.get(MainView.prototype.name).view.visible = true
            } else {
                if (!GetCfgValue(VIEW_NAME_STATIC, key)) {
                    this.CloseView(key)
                }
            }
        }
    }

    public IsMainViewActive() {
        if (this._views.get(MainView.prototype.name)) {
            return this._views.get(MainView.prototype.name).view.visible;
        }
        return false;
    }

    public AddOrder(layer: number) {
        let self = this;
        let order = 0;
        const orderStack = self.sortOrder[layer];
        if (orderStack == null || orderStack.length == 0) {
            order = layer * 10000;
            const stack: number[] = [];
            stack.push(order);
            self.sortOrder[layer] = stack;
        } else {
            order = orderStack[orderStack.length - 1] + 100;
            orderStack.push(order);
        }

        return order;
    }

    public RemoveOrder(order: number) {
        let self = this;
        const layer = Math.floor(order / 10000);
        const orderStack = self.sortOrder[layer];
        for (let i = 0; i < orderStack.length; ++i) {
            if (orderStack[i] == order) {
                orderStack.splice(i, 1);
                return;
            }
        }
    }

    private loadFont() {
        // ResManager.Inst().Load<Font>
        //     (`font/FZCSJT`,
        //         (err, font) => {
        //             if (err != null) {
        //                 console.error(err);
        //                 return;
        //             }
        //             fgui.registerFont("FZCSJT", font);
        //             this.loadCount++;
        //             this.loadComplete();
        //         }
        //     );

        ResManager.Inst().Load<Font>
            (`font/FZZHHJT`,
                (err, font) => {
                    if (err != null) {
                        console.error(err);
                        return;
                    }
                    fgui.registerFont("FZZHHJT", font);
                    this.loadCount++;
                    this.loadComplete();
                }
            );
    }

    private loadLocalization() {
        ResManager.Inst().Load('localization/Localization', (err, xml) => {
            if (err != null) {
                console.error(err);
                return;
            }
            fgui.UIPackage.setStringsSource(xml.toString());
        })


    }

    private loadFirstShowCommonPack() {
        const packNames = ConstValue.FirstShowPoolPackNames;
        let loadPackageCount = 0;
        for (let index = 0; index < packNames.length; index++) {
            const packName = packNames[index];
            const path = ResPath.UIPackage(packName);
            let poolPackages = ViewManager.Inst().poolPackages;
            const pIndex = poolPackages.indexOf(packName);
            if (pIndex === -1) {
                fgui.UIPackage.loadPackage(path, (error: any, pkg: fgui.UIPackage) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    loadPackageCount++;
                    const cIndex = ConstValue.PoolPackNames.indexOf(packName);
                    if (cIndex >= 0) {
                        poolPackages.push(packName);
                    }
                    if (loadPackageCount == packNames.length) {
                        this.loadCount++
                        this.firstSceneExtendsPackageItem();
                        // this.extendsPackageItem();
                        this.loadComplete();
                    }
                })
            }
        }
    }
    private firstSceneExtendsPackageItem() {
        fgui.UIObjectFactory.setLoaderExtension(EGLoader);
    }



    public LoadCommonPack(onCom: () => void) {
        if (this._commonPkgLoaded) {
            onCom();
            return;
        }
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10175, Report2Type.par_12());

        const packNames = ConstValue.PoolPackNames;
        let poolPackages = ViewManager.Inst().poolPackages;

        // Chỉ load các package CHƯA có trong pool
        const toLoad = packNames.filter(n => poolPackages.indexOf(n) === -1);

        if (toLoad.length === 0) {
            // Tất cả đã có trong pool → hoàn thành ngay
            this.extendsPackageItem();
            this._commonPkgLoaded = true;
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10176, Report2Type.par_12());
            onCom();
            return;
        }

        let loadPackageCount = 0;

        const onOneDone = (packName: string, success: boolean) => {
            if (success) {
                if (poolPackages.indexOf(packName) === -1) {
                    poolPackages.push(packName);
                }
            }
            loadPackageCount++;
            // ── KEY FIX: so sánh với toLoad.length (không phải packNames.length)
            // và tăng counter kể cả khi lỗi → onCom() LUÔN được gọi ──────────────
            if (loadPackageCount >= toLoad.length) {
                this.extendsPackageItem();
                this._commonPkgLoaded = true;
                PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10176, Report2Type.par_12());
                onCom();
            }
        };

        for (const packName of toLoad) {
            const path = ResPath.UIPackage(packName);
            fgui.UIPackage.loadPackage(path, (error: any, pkg: fgui.UIPackage) => {
                if (error) {
                    console.error(`[LoadCommonPack] "${packName}" load error:`, error);
                    onOneDone(packName, false);   // ← lỗi vẫn tính là "done"
                    return;
                }
                onOneDone(packName, true);
            });
        }

    }

    private extendsPackageItem() {
        let url = "";

        // //扩展BoardTwo组件
        // url = UIPackage.getItemURL("CommonBoard", "BoardTwo");
        // UIObjectFactory.setExtension(url, BoardTwo);

        // //扩展BoardThree组件
        // url = UIPackage.getItemURL("CommonBoard", "BoardThree");
        // UIObjectFactory.setExtension(url, BoardThree);

        //扩展Currency组件
        url = fgui.UIPackage.getItemURL("CommonCurrency", "Currency");
        fgui.UIObjectFactory.setExtension(url, Currency);

        //扩展Currency2组件
        url = fgui.UIPackage.getItemURL("CommonCurrency", "Currency2");
        fgui.UIObjectFactory.setExtension(url, Currency);

        //扩展Currency3组件
        url = fgui.UIPackage.getItemURL("CommonCurrency", "Currency3");
        fgui.UIObjectFactory.setExtension(url, Currency2);

        //扩展ItemCell组件
        url = fgui.UIPackage.getItemURL("CommonItem", "ItemCell");
        fgui.UIObjectFactory.setExtension(url, ItemCell);

        //扩展ItemCellEquip组件
        url = fgui.UIPackage.getItemURL("CommonItem", "ItemCellEquip");
        fgui.UIObjectFactory.setExtension(url, ItemCellEquip);

        //扩展ItemCellAngel组件
        url = fgui.UIPackage.getItemURL("CommonItem", "ItemCellAngel");
        fgui.UIObjectFactory.setExtension(url, ItemCellAngel);

        //扩展ItemCellShiLian组件
        url = fgui.UIPackage.getItemURL("CommonItem", "ItemCellShiLian");
        fgui.UIObjectFactory.setExtension(url, ItemCellShiLian);

        //扩展ItemCellFish组件
        url = fgui.UIPackage.getItemURL("CommonItem", "ItemCellFishCollect");
        fgui.UIObjectFactory.setExtension(url, ItemCellFishCollect);

        //扩展ItemCellBlock组件
        url = fgui.UIPackage.getItemURL("CommonItem", "ItemCellBlock");
        fgui.UIObjectFactory.setExtension(url, ItemCellBlock);

        //扩展ActItemCellName组件 活动用的带名字itemcell
        url = fgui.UIPackage.getItemURL("CommonItem", "ActItemCellName");
        fgui.UIObjectFactory.setExtension(url, ActItemCellName);

        url = fgui.UIPackage.getItemURL("CommonItem", "ItemCellFishEquip");
        fgui.UIObjectFactory.setExtension(url, ItemCellFishEquip);

        //扩展CapItem组件
        url = fgui.UIPackage.getItemURL("CommonItem", "CapItem");
        fgui.UIObjectFactory.setExtension(url, MainCapItem);

        //扩展CapBigItem组件
        url = fgui.UIPackage.getItemURL("CommonItem", "CapBigItem");
        fgui.UIObjectFactory.setExtension(url, MainCapBigItem);

        //扩展CapItem组件
        url = fgui.UIPackage.getItemURL("CommonItem", "CapItem3");
        fgui.UIObjectFactory.setExtension(url, MainCapItem);

        //扩展CapNumItem组件
        url = fgui.UIPackage.getItemURL("CommonItem", "CapNumItem");
        fgui.UIObjectFactory.setExtension(url, MainCapNumItem);

        //扩展CapNumBigItem组件
        url = fgui.UIPackage.getItemURL("CommonItem", "CapNumBigItem");
        fgui.UIObjectFactory.setExtension(url, MainCapNumBigItem);

        //扩展CommonComboBox组件
        url = fgui.UIPackage.getItemURL("CommonComboBox", "CommonComboBox");
        fgui.UIObjectFactory.setExtension(url, CommonComboBox);

        // //扩展EmptyTip组件
        // url = UIPackage.getItemURL("CommonTips", "EmptyTip");
        // UIObjectFactory.setExtension(url, EmptyTip);

        //拓展RedPoint组件
        url = fgui.UIPackage.getItemURL("CommonWidgets", "RedPoint");
        fgui.UIObjectFactory.setExtension(url, RedPoint);

        // //拓展CheckItem组件
        // url = UIPackage.getItemURL("CommonItem", "CheckItem");
        // UIObjectFactory.setExtension(url, CheckItem);

        //拓展TimeMeter组件
        url = fgui.UIPackage.getItemURL("CommonWidgets", "TimeMeter");
        fgui.UIObjectFactory.setExtension(url, TimeMeter);

        // //拓展AccordionList组件
        // url = UIPackage.getItemURL("CommonWidgets", "AccordionList");
        // UIObjectFactory.setExtension(url, AccordionList);

        // url = UIPackage.getItemURL("CommonWidgets", "AccordionItem");
        // UIObjectFactory.setExtension(url, AccordionItem);

        //拓展CommonButton
        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonReduceTime");
        fgui.UIObjectFactory.setExtension(url, CommonButton);

        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonHelp");
        fgui.UIObjectFactory.setExtension(url, CommonButtonHelp);

        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonBigGreen");
        fgui.UIObjectFactory.setExtension(url, CommonButtonBuy);

        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonBigYellow");
        fgui.UIObjectFactory.setExtension(url, CommonButtonBuy);

        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonMidGreen");
        fgui.UIObjectFactory.setExtension(url, CommonButtonBuy);

        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonMidYellow");
        fgui.UIObjectFactory.setExtension(url, CommonButtonBuy);

        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonSmallYellow");
        fgui.UIObjectFactory.setExtension(url, CommonButtonBuy);

        url = fgui.UIPackage.getItemURL("CommonButton", "ButtonSmallGreen");
        fgui.UIObjectFactory.setExtension(url, CommonButtonBuy);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard3");
        fgui.UIObjectFactory.setExtension(url, CommonBoard3);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard2");
        fgui.UIObjectFactory.setExtension(url, CommonBoard2);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard2_2");
        fgui.UIObjectFactory.setExtension(url, CommonBoard2_2);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard4");
        fgui.UIObjectFactory.setExtension(url, CommonBoard4);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard2_4");
        fgui.UIObjectFactory.setExtension(url, CommonBoard2);

        // 扩展Board5组件
        // url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard5");
        // fgui.UIObjectFactory.setExtension(url, CommonBoard5);
        url = fgui.UIPackage.getItemURL("CommonBoard", "ButtonTab");
        fgui.UIObjectFactory.setExtension(url, CommonBoard5Tab);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard2_3");
        fgui.UIObjectFactory.setExtension(url, CommonBoard5);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard2_5");
        fgui.UIObjectFactory.setExtension(url, CommonBoard5);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard2_cc");
        fgui.UIObjectFactory.setExtension(url, CommonBoardCC);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CCBgShow");
        fgui.UIObjectFactory.setExtension(url, CoreCrisisBgShow);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CCNameShow");
        fgui.UIObjectFactory.setExtension(url, CoreCrisisNameShow);

        url = fgui.UIPackage.getItemURL("CommonBoard", "ButtonTab3");
        fgui.UIObjectFactory.setExtension(url, CommonBoard5Tab);

        // 扩展Board6组件
        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard6");
        fgui.UIObjectFactory.setExtension(url, CommonBoard6);
        url = fgui.UIPackage.getItemURL("CommonBoard", "ButtonTab2");
        fgui.UIObjectFactory.setExtension(url, CommonBoard6Tab);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard7");
        fgui.UIObjectFactory.setExtension(url, CommonBoard3);

        url = fgui.UIPackage.getItemURL("CommonBoard", "CommonBoard8");
        fgui.UIObjectFactory.setExtension(url, CommonBoard3);

        url = fgui.UIPackage.getItemURL("CommonItem", "AttrItem");
        fgui.UIObjectFactory.setExtension(url, AttrItem);

        url = fgui.UIPackage.getItemURL("CommonItem", "AttrAddItemCell");
        fgui.UIObjectFactory.setExtension(url, AttrAddItemCell);

        url = fgui.UIPackage.getItemURL("CommonItem", "AttrItemCell");
        fgui.UIObjectFactory.setExtension(url, AttrItemCell);

        url = fgui.UIPackage.getItemURL("CommonItem", "UIModelShow");
        fgui.UIObjectFactory.setExtension(url, UIModelShow);

        url = fgui.UIPackage.getItemURL("CommonItem", "UIEffectShow");
        fgui.UIObjectFactory.setExtension(url, UIEffectShow);

        url = fgui.UIPackage.getItemURL("CommonItem", "AttrTitleCell");
        fgui.UIObjectFactory.setExtension(url, AttrTitleCell);

        url = fgui.UIPackage.getItemURL("CommonItem", "RoleTitleItemSmall");
        fgui.UIObjectFactory.setExtension(url, RoleTitleItem1);

        url = fgui.UIPackage.getItemURL("CommonItem", "RoleTitleItemBig");
        fgui.UIObjectFactory.setExtension(url, RoleTitleItem2);

        url = fgui.UIPackage.getItemURL("CommonItem", "AvatarCell");
        fgui.UIObjectFactory.setExtension(url, AvatarCell);

        url = fgui.UIPackage.getItemURL("CommonItem", "AvatarGuildCell");
        fgui.UIObjectFactory.setExtension(url, AvatarGuildCell);

        //扩展技能格子组件
        url = fgui.UIPackage.getItemURL("CommonItem", "SkillCell");
        fgui.UIObjectFactory.setExtension(url, SkillCell);

        url = fgui.UIPackage.getItemURL("CommonItem", "GetWayItem");
        fgui.UIObjectFactory.setExtension(url, GetWayItem);

        url = fgui.UIPackage.getItemURL("CommonItem", "PetAvatarCell");
        fgui.UIObjectFactory.setExtension(url, PetAvatarCell);

        url = fgui.UIPackage.getItemURL("CommonItem", "WxVibrate");
        fgui.UIObjectFactory.setExtension(url, WxVibrate);

        //拓展开放域绘制组件
        url = fgui.UIPackage.getItemURL("CommonContext", "CommonContext")
        fgui.UIObjectFactory.setExtension(url, CommonContext);

        //扩展BlockSmall组件
        url = fgui.UIPackage.getItemURL("CommonItem", "BlockSmall");
        fgui.UIObjectFactory.setExtension(url, BlockShow);
    }

    private loadComplete() {
        let self = this;
        if (self.loadCount === self.needLoadCount) {
            self.initCom();
            self.initCom = null;
            self.loadCount = 0;
        }
    }

    //获取显示屏幕全屏大小
    public GetShowScreenSize(): Vec2 {
        let vec2Cache = new Vec2();
        let width = fgui.GRoot.inst.width > 1125 ? 1125 : fgui.GRoot.inst.width;
        let height = fgui.GRoot.inst.height;
        vec2Cache.set(width, height);
        return vec2Cache
    }

    //获取显示屏幕全屏大小
    public GetLiuHaiScreenSize(): Vec2 {
        let vec2Cache = new Vec2();
        let width = fgui.GRoot.inst.width > 1125 ? 1125 : fgui.GRoot.inst.width;
        let offset = 0;
        let height = fgui.GRoot.inst.height - offset;
        vec2Cache.set(width, height);
        return vec2Cache
    }

    public SetExtension(pkgName: string, resName: string, view_class: any) {
        let url = fgui.UIPackage.getItemURL(pkgName, resName);
        fgui.UIObjectFactory.setExtension(url, view_class);
    }

    public GetPackageItem<T extends fgui.GComponent>(pkgName: string, resName: string, parent?: any) {
        let obj = <T>fgui.UIPackage.createObject(pkgName, resName).asCom;
        let child = parent.addChild(obj);
        child.setPosition(0, 0);
        return obj;
    }
    /**
     * name
     */
    public CurViewOnlyMain(): boolean {
        // this._opens.forEach(element => {
        //     console.log(element);
        // });
        // console.log(this._opens.length);
        return this._opens.length <= 5;
    }

    private _regList: { [key: string]: { comp?: fgui.GComponent, data?: { p: fgui.GComponent, index: number }[] } } = {};
    public registComp(vClass: new () => fgui.GComponent, obj: fgui.GComponent) {
        let data: { comp?: fgui.GComponent, data?: { p: fgui.GComponent, index: number }[] } = this._regList[vClass.name];
        if (!data) {
            data = this._regList[vClass.name] = {}
        }
        data.comp = obj;
    }
    public registParent(vClass: new () => fgui.GComponent, newP: fgui.GComponent, index?: number) {
        let data: { comp?: fgui.GComponent, data?: { p: fgui.GComponent, index: number }[] } = this._regList[vClass.name];
        if (!data) {
            return;
        }
        let obj = data.comp;
        let d_comp = data.data;
        if (!d_comp) {
            d_comp = data.data = [];
        }
        d_comp.push({ p: obj.parent, index: obj.node.getSiblingIndex() });
        if (index && !isNaN(index))
            newP.addChildAt(obj, index);
        else {
            newP.addChild(obj)
        }
    }

    public returnParent(vClass: new () => fgui.GComponent) {
        let data_comp: { comp?: fgui.GComponent, data?: { p: fgui.GComponent, index: number }[] } = this._regList[vClass.name];
        if (data_comp) {
            let d_comp = data_comp.data;
            if (d_comp && d_comp.length) {
                let data = data_comp.data.pop();
                let index = data.index;
                if (index && !isNaN(index))
                    data.p.addChildAt(data_comp.comp, index);
                else {
                    data.p.addChild(data_comp.comp)
                }
            }
        }
    }
}

//Debugger.ExportGlobalForDebug('fgui', fgui);