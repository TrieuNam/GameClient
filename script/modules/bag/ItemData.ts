import { Color } from "cc";
import { CfgBlockItemData } from "config/CfgBlockItem";
import { CfgBlockModelItemData } from "config/CfgBlockModelItem";
import { CfgAttrUp } from "config/CfgCommon";
import { CfgDebrisData } from "config/CfgDebris";
import { CfgEquipData } from "config/CfgEquip";
import { CfgEquipAngleData, CfgEquipAngleItemData } from "config/CfgEquipmentAngle";
import { CfgEquipShiLianData, _CfgEquipShiLianData } from "config/CfgEquipmentShiLian";
import { CfgFashion } from "config/CfgFashion";
import { CfgGemData } from "config/CfgGem";
import { CfgGemDrawData } from "config/CfgGemDraw";
import { CfgGiftData } from "config/CfgGift";
import { CfgHarnessData } from "config/CfgHarness";
import { CfgInscriptionItemData } from "config/CfgInscriptionItem";
import { CfgOtherData } from "config/CfgOther";
import { CfgPetItemData } from "config/CfgPetItem";
import { CfgScrollItemData } from "config/CfgScrollItem";
import { CfgTitleItemData } from "config/CfgTitleItem";
import { CfgWaBaoData } from "config/CfgWaBao";
import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { DataBase } from "data/DataBase";
import { BoxData } from "modules/box/BoxData";
import { QualityColor, QualityColorOL, QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { ExtraItemIcon, ITEM_BIG_TYPE, ItemColor } from "modules/common/CommonEnum";
import { AttrListName, EquipName, EquipQuality, Language } from "modules/common/Language";
import { CellClicks } from "modules/extends/ItemCellFuncs";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { BagData } from "./BagData";

class ItemPool extends ObjectPool { }

export class ItemCache {
    public static Create(type: number, vo: any, is?: any) {
        let re;
        switch (type) {
            case ITEM_BIG_TYPE.EQUIP:
                re = ItemPool.Get(Equip);
                vo = Equip.CreateEquipData(vo);
                break;
            case ITEM_BIG_TYPE.EQUIP_ANGEL:
                re = ItemPool.Get(Equip);
                break;
            case ITEM_BIG_TYPE.EQUIP_SHILIAN:
                re = ItemPool.Get(EquipShiLian);
                break;
            default:
                re = ItemPool.Get(Item);
        }
        re.init(vo, is);
        return re;
    }
    public static Destory(collector: Item) {
        ItemPool.Push(collector);
    }
}

export class Item implements IPoolObject {
    protected vo: any = null;
    protected item_id: number = 0;
    protected is_bind: boolean = false;
    protected num: number | string = 0;

    protected is_gray: boolean = false;
    protected black_icon: boolean = false;
    protected mask_icon: boolean = false;
    // 需填写在UI上面 如{"is_click":false}
    protected is_click: boolean = true;
    protected is_num: boolean = false;
    protected eff: number = 0;

    constructor() {
    }
    onPoolReset(): void {
    }

    public init(vo: any, is?: any): void {
        this.vo = vo;
        if (vo) {
            this.item_id = vo.item_id ?? vo.itemId ?? 0;
            this.is_bind = vo.is_bind ?? false;
            this.num = vo.num ?? vo.itemNum ?? 0;
        } else {
            this.item_id = vo.item_id ?? vo.itemId ?? 0;
            this.is_bind = vo.is_bind ?? false;
            this.num = vo.num ?? vo.itemNum ?? 0;
        }
        this.CheckSet(is ?? {});
    }

    protected CheckSet(is: any): void {
        this.is_gray = is.is_gray ?? false;
        this.black_icon = is.black_icon ?? false;
        this.mask_icon = is.mask_icon ?? false;
        //下面不建议使用 需填写在UI上面 如{"is_num":false}
        this.is_click = is.is_click ?? true;
        this.is_num = is.is_num ?? false;
        this.eff = is.eff ?? 0;
    }

    //静态方法 创建item
    public static Create(vo: any, is?: any) {
        let item_id = vo.item_id ?? vo.itemId;
        if (vo) {
            item_id = vo.itemId;
        }
        return ItemCache.Create(Item.GetBigType(item_id), vo ?? {}, is ?? {})
    }

    //返回表里配的itemlist转换create之后的数组，is默认，可自传
    public static DefaultCreateListItem(list: any[], is = { is_gray: false, is_click: true, is_num: true, eff: 0 }) {
        let list_data = [];
        for (let i = 0; i < list.length; i++) {
            let item_id = list[i].itemId ?? list[i].item_id;
            list_data.push(ItemCache.Create(Item.GetBigType(item_id), list[i], is ?? {}))
        }
        return list_data;
    }

    /**item根据数量显示图标 */
    public static CheckIconByIdNum(item_id: number, num: number) {
        if (ExtraItemIcon[item_id]) {
            for (let i = 0; i < ExtraItemIcon[item_id].length; i++) {
                if (num >= ExtraItemIcon[item_id][i].min && (num < ExtraItemIcon[item_id][i].max || ExtraItemIcon[item_id][i].max == 0))
                    return ExtraItemIcon[item_id][i].icon;
            }
        }
        return null;
    }

    // public Init(item_id:number,num?:number,is?:any){
    //     let vo = {
    //         item_id : item_id ?? 0,
    //         num : num ?? 1,
    //     };
    //     return Item.Create(vo,is)
    // }

    public ItemId(): number {
        return this.item_id;
    }

    public IsClick(): boolean {
        return this.is_click;
    }

    public IsNum(): boolean {
        return this.is_num;
    }

    public Vo() {
        return this.vo;
    }

    public Config() {
        return Item.GetConfig(this.item_id);
    }

    public BigType() {
        return Item.GetBigType(this.item_id);
    }

    public Name(): string {
        return Item.GetName(this.item_id);
    }

    public Num(): number | string {
        return this.num;
    }

    public Desc(): string {
        return Item.GetDesc(this.item_id);
    }

    public IconId(): number {
        return Item.GetIconId(this.item_id);
    }

    public Level(): number {
        return Item.GetLevel(this.item_id);
    }

    public Color(): number {
        return Item.GetColor(this.item_id);
    }

    public IconTxt(): string {
        return Item.GetIconTxt(this.item_id);
    }

    public Kuang(): string {
        return Item.GetKuang(this.item_id);
    }

    // 是否浅色背景
    public QuaName(shallow?: boolean) {
        let color = shallow ? QualityColorStr[this.Color()] : QualityColorStr[this.Color()];
        return TextHelper.ColorStr(this.Name(), color);
    }

    // 描边长度
    public QuaNameOL(width?: number, shallow?: boolean, name?: string) {
        let color = shallow ? QualityColorStr[this.Color()] : QualityColorStr[this.Color()];
        let color_ol = shallow ? QualityColorOLStr[this.Color()] : QualityColorOLStr[this.Color()];
        return TextHelper.RichTextOutLine(TextHelper.ColorStr(name ? name : this.Name(), color), color_ol, width);
    }

    public QuaColor(shallow?: boolean) {
        return shallow ? QualityColorStr[this.Color()] : QualityColorStr[this.Color()];
    }

    public QuaColorOL(shallow?: boolean) {
        return shallow ? QualityColorOLStr[this.Color()] : QualityColorOLStr[this.Color()];
    }

    public static QuaColorById(item_id: number): Color {
        let c = Item.GetColor(item_id)
        return QualityColor[c]
    }

    public static QuaColorOLById(item_id: number): Color {
        let c = Item.GetColor(item_id)
        return QualityColorOL[c]
    }

    public static GetConfig(item_id: number) {
        return ItemData.Inst().GetConfig(item_id);
    }

    public static GetBigType(item_id: number) {
        return ItemData.Inst().GetBigType(item_id);
    }

    public static GetShowType(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? co.show_type : 0;
    }

    public static GetGiftlist(item_id: number) {
        const co = Item.GetConfig(item_id);
        return co ? co.gift : [];
    }

    public static QuaNameOL(item_id: number, width?: number, shallow?: boolean) {
        let color = Item.GetColor(item_id);
        let quality_color = shallow ? QualityColorStr[color] : QualityColorStr[color];
        let quality_color_ol = shallow ? QualityColorOLStr[color] : QualityColorOLStr[color];
        return TextHelper.RichTextOutLine(TextHelper.ColorStr(Item.GetName(item_id), quality_color), quality_color_ol, width);
    }

    public static QuaColor(item_id: number) {
        let color = Item.GetColor(item_id);
        let quality_color = QualityColor[color];
        return quality_color;
    }

    public static QuaColorOL(item_id: number) {
        let color = Item.GetColor(item_id);
        let quality_color_ol = QualityColorOL[color];
        return quality_color_ol;
    }

    public static GetName(item_id: number): string {
        let name = "";
        const co = Item.GetConfig(item_id);
        if (this.GetBigType(item_id) == ITEM_BIG_TYPE.EQUIP) {
            name = EquipQuality[co.quality] + EquipName[co.part];
        } else if (co) {
            name = co.name;
        }
        return name;
    }

    public static GetNum(item_id: number): number {
        return BagData.Inst().getItemNum(item_id);
    }

    public static GetDesc(item_id: number): string {
        const co = Item.GetConfig(item_id);
        return co ? co.description : "";
    }

    public static GetColor(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? (co.quality ? co.quality : co.color) : ItemColor.None;
    }

    public static GetQuality(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? (co.quality ? co.quality : co.color) : ItemColor.None;
    }

    public static GetIconId(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? (co.icon_id ? co.icon_id : co.color) : 0;
    }

    public static GetLevel(item_id: number): number {
        const co = Item.GetConfig(item_id);
        let level = co ? co.level : 0;
        if (!level)
            level = co ? co.item_level : 0;
        return level;
    }

    public static GetParam(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? (co.param ? co.param : 0) : 0;
    }

    public static GetGetGemLevel(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? (co.gem_level ? co.gem_level : 0) : 0;
    }

    public static GetSfbPrice(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? co.sfb_price : 0;
    }

    public static GetWaBaoType(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? co.wabao_type : 0;
    }

    public static GetIntegrityMax(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? co.integrity_max : 1;
    }

    public static GetTitleAttr(item_id: number) {
        const co = Item.GetConfig(item_id);
        return co ? co.title_att : [];
    }

    public static GetIconTxt(item_id: number) {
        const co = Item.GetConfig(item_id);
        return co && co.show_icon_txt ? co.show_icon_txt : "";
    }

    public static GetSpecialEffects(item_id: number) {
        const co = Item.GetConfig(item_id);
        return co ? (IsEmpty(co.special_effects) ? 0 : co.special_effects) : 0;
    }

    public static OnItemInfo(item_data: any) {
        let big_type = Item.GetBigType(item_data.item_id);
        if (CellClicks[big_type]) {
            CellClicks[big_type](item_data);
        } else {
            CellClicks[-1](item_data)
        }
    }

    public static GetKuang(item_id: number) {
        if (item_id >= 40201 && item_id <= 40211) {
            return "TeShuBaoShiBianKuang";
        }
        return null;
    }

    public static GetBlockRange(item_id: number) {
        const co = Item.GetConfig(item_id);
        return co && co.block_range ? co.block_range.split("|") : []
    }
}

export class Equip extends Item {
    // protected is_show_icon : boolean = true;
    // protected is_show_open : boolean = false;

    // public CheckSet(is:any): void {
    //     super.CheckSet(is);

    //     this.is_show_icon = is.is_show_icon ?? true;
    //     this.is_show_open = is.is_show_open ?? true;
    // }

    // public IsShowIcon():boolean{
    //     return this.is_show_icon;
    // }

    // public IsShowOpen():boolean{
    //     return this.is_show_open;
    // }

    public Cap(isCover?: boolean): number {
        isCover = isCover ? isCover : false
        return this.vo ? AttrHelper.GetPower(this.GetAttrList(), isCover) : 0
    }

    public GetAttrList() {
        switch (this.BigType()) {
            case ITEM_BIG_TYPE.EQUIP:
                return AttrHelper.EquipAttrToAttrUp(this.vo);
            case ITEM_BIG_TYPE.EQUIP_ANGEL:
                return (<CfgEquipAngleItemData>Item.GetConfig(this.ItemId())).stage_att;
        }
        return [];
    }

    public GetAttrBaseAddList(): { base_list: CfgAttrUp[], add_list: CfgAttrUp[] } {
        return AttrHelper.GetAttrBaseAddList(this.GetAttrList());
    }

    /**特殊装备 生成装备数据 */
    public static CreateEquipData(vo: any) {
        if (vo instanceof PB_EquipData) {
            return vo;
        } else {
            let item_id = vo.item_id ?? vo.itemId ?? 0;
            let cfg = Item.GetConfig(item_id);
            if (cfg && cfg.is_special) {
                let equip_data = new PB_EquipData();
                equip_data.equipType = cfg.part;
                equip_data.itemId = item_id;
                equip_data.hp = cfg.hp_max;
                equip_data.attack = cfg.att_max;
                equip_data.defend = cfg.def_max;
                equip_data.speed = cfg.speed_max;
                let cfg_color_att = BoxData.Inst().GetEquipColorAttrCfg();
                let att_group1 = cfg_color_att[cfg.frist_att];
                equip_data.attrType1 = att_group1[att_group1.length - 1].att_type;
                equip_data.attrValue1 = att_group1[att_group1.length - 1].att_num_max;
                let att_group2 = cfg_color_att[cfg.second_att];
                equip_data.attrType2 = att_group2[att_group2.length - 1].att_type;
                equip_data.attrValue2 = att_group2[att_group2.length - 1].att_num_max;
                return equip_data;
            }
            return vo;
        }
    }

    public ItemCompare(): number {
        let vo = this.vo
        return +`${vo.itemId}${vo.hp}${vo.attack}${vo.defend}${vo.speed}${vo.attrType1}${vo.attrType2}${vo.attrValue1}${vo.attrValue2}`
    }
}

export class EquipShiLian extends Item {
    public Cap(isCover?: boolean): number {
        isCover = isCover ? isCover : false
        return AttrHelper.GetPower(this.GetAttrList(), isCover)
    }

    public GetAttrList() {
        return (<_CfgEquipShiLianData>Item.GetConfig(this.ItemId())).stage_att;
    }

    public GetDescShow() {
        let attrs = this.GetAttrList()
        let attr = attrs[0]
        return TextHelper.Format(Language.Trial.TrialTower.ItemShiLianDescShow, AttrHelper.Percent(attr.type, attr.add), AttrListName[attr.type])
    }

    public GetDescShow2() {
        let attrs = this.GetAttrList()
        let attr = attrs[0]
        let num = BagData.Inst().getItemNum(this.item_id)
        return TextHelper.Format(Language.Trial.TrialTower.ItemShiLianDescShow2, num, AttrHelper.Percent(attr.type, attr.add * num), AttrListName[attr.type])
    }

    public GetLevel(item_id: number): number {
        const co = Item.GetConfig(item_id);
        return co ? co.level : 0;
    }

    public Level(): number {
        return +this.num;
    }
}


export class ItemData extends DataBase {
    private item_info_data: any = null;

    private all_item_config: any[] = [
        CfgEquipData,
        CfgOtherData,
        CfgEquipShiLianData,
        CfgEquipAngleData,
        CfgGiftData,
        CfgGemData,
        CfgGemDrawData,
        CfgWaBaoData,
        CfgTitleItemData,
        CfgDebrisData,
        CfgPetItemData,
        CfgInscriptionItemData,
        CfgFashion,
        CfgHarnessData,
        CfgScrollItemData,
        CfgBlockModelItemData,
        CfgBlockItemData,
    ]

    public GetConfig(item_id: number) {
        for (let i = 0; i < this.all_item_config.length; i++) {
            if (this.all_item_config[i][item_id]) {
                return this.all_item_config[i][item_id];
            }
        }
        return null;
    }

    public GetBigType(item_id: number) {
        for (let i = 0; i < this.all_item_config.length; i++) {
            if (this.all_item_config[i][item_id]) {
                return i;
            }
        }
        return null;
    }

    public SetItemInfoData(data: any) {
        this.item_info_data = data;
    }

    public GetItemInfoData(): any {
        return this.item_info_data;
    }
}    