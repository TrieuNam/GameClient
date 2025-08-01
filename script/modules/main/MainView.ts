
import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer, viewRegcfg } from 'modules/common/BaseView';
import { PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";
import { AutoBoxItem } from './AutoBoxItem';
import { ButtonAct, MainActItem } from './MainActItem';
import { MainAngelButton } from './MainAngelButton';
import { MainBottom, MainButtonMod, MainButtonModJJC, MainButtonModR, MainFlyIcon } from './MainBottom';
import { MainBoxAutoButton } from './MainBoxAutoButton';
import { MainBoxShow } from './MainBoxShow';
import { MainBtnTodayShare } from './MainBtnTodayShare';
import { MainAttrItem1, MainAttrItem2, MainAttrItem3, MainCenter, MainExtraEnter } from './MainCenter';
import { MainDailyAdButton, RoleAvatarItem } from './MainItems';
import { MainMountButton } from './MainMountButton';
import { MainTaskItem, TaskIconItem } from './MainTaskItem';
import { MainTop } from './MainTop';

@BaseView.registView
export class MainView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Main",
        ViewName: "MainView",
        LayerType: ViewLayer.ButtomMain,
    };
    protected viewNode = {
        BottomInfo: <MainBottom>null,
        CenterInfo: <MainCenter>null,
        TopInfo: <MainTop>null,
        // rich: <fgui.GRichTextField>null,
        // SceneElems: <MainViewScene>null,
        Bg: <fgui.GImage>null,
        // BgUp : <fgui.GImage>null,
    };

    DoOpenWaitHandle() {
        this.viewNode.Bg.width = 1125 * (fgui.GRoot.inst.height / 1500);
    }

    // WindowSizeChange() {
    //     this.viewNode.Bg.width = 1125 * (fgui.GRoot.inst.height / 1500);
    // }

    protected extendsCfg = [
        { ResName: "Top", ExtendsClass: MainTop },
        { ResName: "Center", ExtendsClass: MainCenter },
        { ResName: "Bottom", ExtendsClass: MainBottom },

        { ResName: "AttrItem", ExtendsClass: MainAttrItem1 },
        { ResName: "AttrItem2", ExtendsClass: MainAttrItem2 },
        { ResName: "AttrItem3", ExtendsClass: MainAttrItem3 },
        { ResName: "ButtonMod", ExtendsClass: MainButtonMod },
        { ResName: "ButtonModC", ExtendsClass: MainButtonMod },
        { ResName: "ButtonModR", ExtendsClass: MainButtonModR },
        { ResName: "ButtonModJJC", ExtendsClass: MainButtonModJJC },
        { ResName: "BoxShow", ExtendsClass: MainBoxShow },
        { ResName: "TaskItem", ExtendsClass: MainTaskItem },
        { ResName: "ButtonBoxAuto", ExtendsClass: MainBoxAutoButton },
        { ResName: "MainActItem", ExtendsClass: MainActItem },
        { ResName: "ButtonAct", ExtendsClass: ButtonAct },
        { ResName: "BtnActRight", ExtendsClass: ButtonAct },
        { ResName: "MainActRightItem", ExtendsClass: MainActItem },

        { ResName: "MainExtraEnter", ExtendsClass: MainExtraEnter },
        { ResName: "RoleAvatar", ExtendsClass: RoleAvatarItem },
        { ResName: "ButtonAngel", ExtendsClass: MainAngelButton },
        { ResName: "ButtonMount", ExtendsClass: MainMountButton },
        { ResName: "FlyIcon", ExtendsClass: MainFlyIcon },
        { ResName: "BtnTodayShare", ExtendsClass: MainBtnTodayShare },
        { ResName: "AutoBoxItem", ExtendsClass: AutoBoxItem },
        { ResName: "ButtonDailyAd", ExtendsClass: MainDailyAdButton },
        { ResName: "TaskIconItem", ExtendsClass: TaskIconItem },
    ];

    InitData() {
        this.viewNode.TopInfo.InitData();
        this.viewNode.CenterInfo.InitData();
        this.viewNode.BottomInfo.InitData();
    }

    InitUI() {

    }
    OpenCallBack(): void {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10260, Report2Type.par_12());
    }

}
