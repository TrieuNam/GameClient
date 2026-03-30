import { sys } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItemGL } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { UserProtocolText } from "modules/UserProtocol/UserProtocolView";
import { UH } from "../../helpers/UIHelper";
import { AnnounceCtrl } from "./AnnounceCtrl";
import { PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";

@BaseView.registView
export class AnnounceView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Announce",
        ViewName: "AnnounceView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };
    protected viewNode: any = {
        TagList: <fgui.GList>null,
        title: <fgui.GLabel>null,
        BtnClose: <fgui.GButton>null,
        Info: <AnnInfo>null,
        DescList: <fgui.GList>null,
    }

    protected extendsCfg = [
        { ResName: "TitleTagBtn", ExtendsClass: AnnTitleTag },
        { ResName: "AnnInfo", ExtendsClass: AnnInfo },
        // { ResName: "AnnounceText", ExtendsClass: AnnounceText },
        { ResName: "UserProtocolText", ExtendsClass: UserProtocolText },
    ];

    InitData(param: { init_flag: boolean }) {
        this.viewNode.BtnClose.onClick(this.onClickBtnClose.bind(this));
        this.viewNode.TagList.on(fgui.Event.CLICK_ITEM, this.ClickTag, this);
        this.viewNode.DescList.setVirtual();

        let list = AnnounceCtrl.Inst().GetAnnounceInfo()
        this.viewNode.TagList.SetData(list)

        this.viewNode.TagList.selectedIndex = 0

        // this.viewNode.Info.SetData(list[0])
        this.viewNode.DescList.SetData(list[0].content.toString().split("\n"))
        if (list[0] != null && list[0].title != null) {
            UH.SetText(this.viewNode.title, list[0].title)
        }

        if (param && param.init_flag) {
            let last_time = 0
            for (var index in list) {
                if (list[index].add_time > last_time) {
                    last_time = list[index].add_time
                }
            }

            AnnounceCtrl.Inst().SendCSNoticeTimeReq(1, Number(last_time))
        }
    }

    private onClickBtnClose() {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10091, Report2Type.par_12());

        ViewManager.Inst().CloseView(AnnounceView)

        AnnounceCtrl.Inst().SendCSNoticeTimeReq(0, 0)
    }

    private ClickTag(item: AnnTitleTag) {
        // this.viewNode.Info.SetData(item.data)
        this.viewNode.DescList.SetData(item.data.content.toString().split("\n"))
        UH.SetText(this.viewNode.title, item.data.title)
    }
}

export class AnnTitleTag extends fgui.GButton {
    protected viewNode = {
        title: <fgui.GLabel>null,
        select_title: <fgui.GLabel>null,
    };

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SetText(this.viewNode.title, data.title);
        UH.SetText(this.viewNode.select_title, data.title);
    }
}


export class AnnInfo extends fgui.GComponent {
    private viewNode = {
        text: <fgui.GRichTextField>null,
        c_text: <fgui.GLabel>null,
    };

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.text.on(fgui.Event.LINK, this.onClickDesc, this)
        // this.viewNode.text.maxWidth = 10
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        // LogError("fjv",this.viewNode.text._richText,this.viewNode.text._richText.fontSize)
        // this.viewNode.text._richText.maxWidth = 530

        // let test_str = "尊敬的各位骑士：\n    为了给大家带来更好的游戏体验，我们将于1月17日6：00进行停服维护，具体维护完成时间视维护进度而有所提前或延迟，请您留意游戏时间，以免造成不必要的损失，祝您游戏愉快！\n【维护内容】\n1）优化主界面活动字体显示；\n2）优化竞技场界面显示；\n3）优化【远航】界面显示\n4）修复【考古】体力值恢复异常问题；\n5）修复【考古】界面显示异常问题；\n6）修复【试炼之塔】战利品格子重置异常问题；\n7）修复主线任务【获得宠物大尾狼】无法完成的问题"
        UH.SetText(this.viewNode.text, data.content)
    }

    private onClickDesc(url: string) {
        sys.openURL(url)
    }

}

// export class AnnounceText extends BaseItemGL {
//     protected viewNode = {
//         title: <fgui.GTextField>null,
//     };
//     public SetData(data: any) {
//         this.viewNode.title.text = data
//     }
// }