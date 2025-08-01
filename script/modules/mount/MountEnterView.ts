import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from 'modules/common/CommonEnum';
import { AttrListName, Language } from 'modules/common/Language';
import { MountConfigQuaBgName } from "modules/mount/MountConfig";
import { MountData } from "modules/mount/MountData";
import { MountMainView } from "modules/mount/MountMainView";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class MountEnterView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountMain",
        ViewName: "MountEnter",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "MountEnterShow", ExtendsClass: MountEnterShow },
        { ResName: "MountEnterAttr", ExtendsClass: MountEnterAttr },
    ];

    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        MountLevel: <fgui.GLabel>null,
        MountName: <fgui.GLabel>null,
        BtnEnter: <fgui.GButton>null,
        MountShow: <MountEnterShow>null,
        attr_3_list: <fgui.GList>null,
    }
    InitData() {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));

        let param = MountData.Inst().GetEnterParam();
        UH.SetText(this.viewNode.MountLevel, Language.Mount.LvTitle + param.level);
        UH.SetText(this.viewNode.MountName, param.name);
        this.viewNode.MountShow.SetData({ color: param.color, mount_id: param.mount_id })
        this.viewNode.attr_3_list.SetData(param.attr_list)

        this.viewNode.BtnEnter.onClick(this.BtnEnterMain.bind(this));

        // GuideCtrl.Inst().AddGuideUi("MountEnterBtnEnter", this.viewNode.BtnEnter);
    }

    private CloseView() {
        ViewManager.Inst().CloseView(MountEnterView)
    }

    private BtnEnterMain() {
        this.CloseView()
        ViewManager.Inst().OpenView(MountMainView);
    }
}


export class MountEnterShow extends fgui.GComponent {
    private viewNode = {
        QuaImage: <fgui.GLoader>null,
        MountPic: <fgui.GLoader>null,
        // CostImage : <fgui.GLoader>null,
        // Cost: <fgui.GGroup>null,
        // Name : <fgui.GLabel>null,
        // Num : <fgui.GLabel>null,
        // YiJiBai: <fgui.GImage> null,
        // BtnFreeMop: <fgui.GButton> null,
        // BtnMop: <fgui.GButton> null,
        // BtnChallenge: <fgui.GButton> null,
        // LastNum : <fgui.GLabel>null,
        // RewardList : <fgui.GList>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.viewNode.BtnChallenge.onClick(this.ClickChallenge.bind(this));
        // this.viewNode.BtnFreeMop.onClick(this.ClickMop.bind(this));
        // this.viewNode.BtnMop.onClick(this.ClickMop.bind(this));
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SpriteName(this.viewNode.QuaImage, "CommonAtlas", MountConfigQuaBgName[data.color]);
        var cfg = MountData.Inst().GetHeChengCfg(data.mount_id);
        UH.SetIcon(this.viewNode.MountPic, cfg.hecheng_item_id, ICON_TYPE.ITEM)
        // UH.SpriteName(this.viewNode.CostImage,"Dungeon","jkj");
        // UH.SetText(this.viewNode.Num, data.cost_num);

        // UH.SetText(this.viewNode.Name, data.name);

        // this.viewNode.RewardList.itemRenderer = this.onRenderRewardItem.bind(this);
        // this.viewNode.RewardList.numItems = data.reward_show.length;
        // this.viewNode.YiJiBai.visible = data.is_complete && data.last_num == 0
        // UH.SetText(this.viewNode.LastNum,
        //     TextHelper.Format(Language.Dungeon.LastTime, TextHelper.ColorStr(data.last_num, data.last_color)));

        // this.viewNode.LastNum.visible = data.is_complete;
        // this.viewNode.Cost.visible = !data.is_free && data.is_complete;
        // this.viewNode.BtnFreeMop.visible = data.is_free && data.is_complete;
        // this.viewNode.BtnMop.visible = !data.is_free && data.is_complete;
        // this.viewNode.BtnChallenge.visible = !data.is_complete;

        // this.viewNode.BtnChallenge.grayed = !data.is_canchallenge

    }

    // private onRenderRewardItem(index: number, item: ItemCell) {

    //     item.SetData(Item.Create({item_id:this.data.reward_show[index].item_id,num:this.data.reward_show[index].num}));//);
    // }

    // private ClickMop(){
    // ViewManager.Inst().OpenView(ChiefDungeonMopView,{
    //     item_list : this.data.reward_show,
    //     last_time : this.data.last_num,
    //     is_free : this.data.is_free,
    //     cost_num : this.data.cost_num,
    //     param_seq : this.data.seq,
    //     is_quick : false,
    //     name : TextHelper.Format(Language.Dungeon.MopSureTitle,this.data.name),
    // })
    // // DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Mop,this.data.seq)
    // }

    // private ClickChallenge(){
    //     if (RoleData.Inst().GetRoleLevel() < this.data.unlock_level){
    //         PublicPopupCtrl.Inst().Center(Language.Dungeon.LevelLack);
    //         return 
    //     }
    //     DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Fight,this.data.seq)
    // }
}

export class MountEnterAttr extends fgui.GComponent {
    private viewNode = {
        attr_name_1: <fgui.GLabel>null,
        attr_name_2: <fgui.GLabel>null,
        attr_name_3: <fgui.GLabel>null,
        attr_value_1: <fgui.GLabel>null,
        attr_value_2: <fgui.GLabel>null,
        attr_value_3: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;

        this.viewNode.attr_name_1.visible = data[0] != null
        this.viewNode.attr_value_1.visible = data[0] != null
        if (data[0] != null) {
            UH.SetText(this.viewNode.attr_name_1, AttrListName[data[0].type]);
            UH.SetText(this.viewNode.attr_value_1, AttrHelper.Percent(data[0].type, data[0].add));
        }

        this.viewNode.attr_name_2.visible = data[1] != null
        this.viewNode.attr_value_2.visible = data[1] != null
        if (data[1] != null) {
            UH.SetText(this.viewNode.attr_name_2, AttrListName[data[1].type]);
            UH.SetText(this.viewNode.attr_value_2, AttrHelper.Percent(data[1].type, data[1].add));
        }

        this.viewNode.attr_name_3.visible = data[2] != null
        this.viewNode.attr_value_3.visible = data[2] != null
        if (data[2] != null) {
            UH.SetText(this.viewNode.attr_name_3, AttrListName[data[2].type]);
            UH.SetText(this.viewNode.attr_value_3, AttrHelper.Percent(data[2].type, data[2].add));
        }
    }
}