import { sys } from "cc";
import { GetCfgValue } from "config/CfgCommon";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItemGL } from "modules/common/BaseItem";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { LoginData } from "modules/login/LoginData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { UserProtocolData } from "./UserProtocolData";

@BaseView.registView
export class UserProtocolView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "UserProtocol",
        ViewName: "UserProtocolView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        // Desc: <fgui.GLabel>null,
        TagList: <fgui.GList>null,
        DescList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "TitleTagBtn", ExtendsClass: AnnTitleTag2 },
        { ResName: "UserProtocolText", ExtendsClass: UserProtocolText },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(UserProtocolView));
        this.viewNode.TagList.on(fgui.Event.CLICK_ITEM,this.OnClickTagItem,this);
        this.viewNode.DescList.setVirtual();
        // let user_data = LoginData.Inst().GetLoginUserProtocol()
        // let user_text = UserProtocolData.ToRichTxt(user_data.user_agree_url);
        // let privacy_text = UserProtocolData.ToRichTxt(user_data.privacy_url);
        // let desc = TextHelper.Format(user_data.content);
        // desc=desc.replace("{format_sign;}", user_text);
        // desc=desc.replace("{format_sign;}", privacy_text);
        // UH.SetText(this.viewNode.Desc, user_data.content);
        // this.viewNode.Desc.getTextField().on(fgui.Event.LINK, this.onClickDesc, this)
        let list = []
        list.push({title:Language.UserProtocol.Title1})
        list.push({title:Language.UserProtocol.Title2})
        this.viewNode.TagList.SetData(list, this.OnClickTagItem.bind(this))
    }

    private onClickDesc(url:string){
        sys.openURL(url)
    }

    private OnClickTagItem(){
        let user_data = LoginData.Inst().GetLoginUserProtocol()
        // UH.SetText(this.viewNode.Desc, 0 == this.viewNode.TagList.selectedIndex ? GetCfgValue(user_data, "user_agree_content") : user_data.content);
        this.viewNode.DescList.SetData((0 == this.viewNode.TagList.selectedIndex ? GetCfgValue(user_data, "user_agree_content") : user_data.content).toString().split("\n"))
    }
}

class AnnTitleTag2 extends fgui.GButton {
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

export class CommonTipData {
    title: string;
    desc: string;
    confirm_func: Function;
    constructor(title: string, desc: string, confirm_func: Function) {
        this.title = title;
        this.desc = desc;
        this.confirm_func = confirm_func;
    }
}

export class UserProtocolText extends BaseItemGL {
    protected viewNode = {
        title: <fgui.GTextField>null,
    };
    public SetData(data: any) {
        this.viewNode.title.text = data
    }
}