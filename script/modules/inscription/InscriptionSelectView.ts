import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { QualityColorStr } from "modules/common/ColorEnum";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { InscriptionCtrl, RUNE_REQ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";

@BaseView.registView
export class InscriptionSelectView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "InscriptionSelect",
        ViewName: "InscriptionSelectView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode: { [key: string]: any } = {
        Board: <CommonBoard2>null,
        list: <fgui.GList>null,
        EmptyShow: <fgui.GGroup>null,
    }
    private mark = 0
    protected extendsCfg = [
        { ResName: "SelectItem", ExtendsClass: InscriptionSelectItem },
    ]

    InitData() {
        this.viewNode.Board.SetData(new BoardData(InscriptionSelectView, Language.Inscription.SelectTitle, 23))

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoPanel.bind(this), "flushneed");

        this.viewNode.list.setVirtual()
        this.flushInfoPanel()
        this.mark = InscriptionData.Inst().GetBagPosFromOper()
    }
    CloseCallBack() {
        let check = InscriptionData.Inst().GetBagPosFromOper()
        if (this.mark != check && check > -1) {
            InscriptionData.Inst().MarkShowEff()
        }
    }

    public flushInfoPanel() {
        let param_list = InscriptionData.Inst().GetSelectList(-1)
        this.viewNode.list.SetData(param_list)

        this.viewNode.EmptyShow.visible = param_list.length == 0
    }
}

export class InscriptionSelectItem extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        ItemCell: <ItemCell>null,
        Name: <fgui.GLabel>null,
        AttrShow: <fgui.GLabel>null,
        BtnRemove: <fgui.GButton>null,
        BtnExchange: <fgui.GButton>null,

        Lock: <fgui.GLabel>null,
        with_attr: <fgui.GImage>null,
        item_level: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.BtnRemove.onClick(this.OnClickRemove.bind(this));
        this.viewNode.BtnExchange.onClick(this.OnClickExChange.bind(this));
        //BtnRemove
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SetText(this.viewNode.Name, TextHelper.ColorStr(data.name, QualityColorStr[data.color]));
        this.viewNode.ItemCell.SetData(Item.Create({ item_id: data.id }, { is_click: false }))
        UH.SetText(this.viewNode.AttrShow, data.attr_str)

        this.viewNode.with_attr.visible = data.with_same && !data.is_equiped
        this.viewNode.Lock.visible = !data.is_lock
        UH.SetText(this.viewNode.Lock, TextHelper.Format(Language.Inscription.AtlasNomalTowerTitle, data.unlock_level),)
        this.viewNode.BtnRemove.visible = data.is_equiped
        this.viewNode.BtnExchange.visible = !data.is_equiped && !data.with_same && data.is_lock

        let oper_bag = InscriptionData.Inst().GetKnapsackItem(InscriptionData.Inst().GetBagPosFromOper())
        this.viewNode.BtnExchange.title = oper_bag.id == 0 ? Language.Inscription.BtnSEquip : Language.Inscription.BtnSExchange

        UH.SetText(this.viewNode.item_level, Language.GemAtelier.LvShow + data.level)
    }

    private OnClickRemove() {
        InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.OFFRUNE, InscriptionData.Inst().GetOperPos(), 0, [], [])
        this.PopAttr(RUNE_REQ_TYPE.OFFRUNE)
    }

    private OnClickExChange() {
        InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.WEARRUNE, InscriptionData.Inst().GetOperPos(), this.data.index, [], [])
        this.PopAttr(RUNE_REQ_TYPE.WEARRUNE)
    }

    public PopAttr(type: RUNE_REQ_TYPE) {
        let atts = this.data.is_ts ? [] : this.data.atts

        let show_list = []

        if (type == RUNE_REQ_TYPE.OFFRUNE) {
            for (var i in atts) {
                let info = {
                    fuhao: "-",
                    type: 0,
                    att_type: atts[i].type,
                    att_add: atts[i].add,
                }

                show_list.push(info)
            }
        }
        else if (type == RUNE_REQ_TYPE.WEARRUNE) {
            let wearing = InscriptionData.Inst().GetCurSelectItem(InscriptionData.Inst().GetOperPos())
            if (wearing == null) {
                for (var i in atts) {
                    let info = {
                        fuhao: "+",
                        type: 1,
                        att_type: atts[i].type,
                        att_add: atts[i].add,
                    }

                    show_list.push(info)
                }
            }
            else {
                let marked = []
                // 如果是同属性的话就取相差值，如果是非同属性的话就你加我减
                for (var i in atts) {
                    let checked = false
                    for (var j in wearing.atts) {
                        if (wearing.atts[j].type == atts[i].type) {
                            checked = true
                            marked.push(atts[i].type)
                            let fix = atts[i].add - wearing.atts[j].add
                            let info = {
                                fuhao: fix > 0 ? "+" : "-",
                                type: fix > 0 ? 1 : 0,
                                att_type: atts[i].type,
                                att_add: Math.abs(fix),
                            }
                            show_list.push(info)
                        }
                    }

                    if (!checked) {
                        let info = {
                            fuhao: "+",
                            type: 1,
                            att_type: atts[i].type,
                            att_add: atts[i].add,
                        }

                        show_list.push(info)
                    }
                }

                for (var i in wearing.atts) {
                    let show = true
                    for (var j in marked) {
                        if (marked[j] == wearing.atts[i].type) {
                            show = false
                        }
                    }
                    if (show) {
                        let info = {
                            fuhao: "-",
                            type: 0,
                            att_type: wearing.atts[i].type,
                            att_add: wearing.atts[i].add,
                        }

                        show_list.push(info)
                    }

                }

            }

        }

        for (let i = 0; i < show_list.length; i++) {
            let att_type = show_list[i].att_type;
            let att_add = show_list[i].att_add

            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${show_list[i].fuhao}${AttrHelper.Percent(att_type, att_add)}`, show_list[i].type)
        }
    }
}