import { SpriteFrame } from "cc";
import { ENUM_OBJ } from "core/ObjectPool";
import * as fgui from "fairygui-cc";
import { ResManager } from "manager/ResManager";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { ResPath } from "utils/ResPath";
import { DataHelper } from "../../helpers/DataHelper";
import { UH } from "../../helpers/UIHelper";
export class AvatarCell extends fgui.GComponent {
    static pool_avatarSp: { [key: string]: SpriteFrame } = {}

    private viewNode = {
        HeadFrame: <fgui.GLoader>null,
        Head: <fgui.GLoader>null,
        LevelShow: <fgui.GTextField>null,
        GpLevel: <fgui.GGroup>null,
    };

    protected onConstruct(): void {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public DefaultShow() {
        UH.SetIcon(this.viewNode.Head, "1", ICON_TYPE.Role)
    }

    public SetData(data: AvatarData) {
        if (data && data.level) {
            UH.SetText(this.viewNode.LevelShow, "LV." + data.level);
            this.viewNode.GpLevel.visible = true;
        } else {
            this.viewNode.GpLevel.visible = false;
        }
        if (data.avatarUrl && data.avatarUrl != "") {
            let sf = AvatarCell.pool_avatarSp[data.avatarUrl];
            if (!sf) {
                ResManager.Inst().LoadOutSprite(ENUM_OBJ.AVATAR_WX, ResPath.WxAvatar(data.avatarUrl), (spf: SpriteFrame) => {
                    this.SeSpriteFrame(spf);
                    AvatarCell.pool_avatarSp[data.avatarUrl] = spf
                })
            } else {
                this.SeSpriteFrame(sf);
            }
        } else {
            let pic_id = data.headPicId ? data.headPicId : "1";
            UH.SetIcon(this.viewNode.Head, pic_id, ICON_TYPE.Role);
        }
    }

    public SeSpriteFrame(sf: SpriteFrame) {
        if (sf && this.viewNode && this.viewNode.Head) {
            this.viewNode.Head.texture = sf
            // this.viewNode.Head.setSize(this.viewNode.Head.sourceWidth, this.viewNode.Head.sourceHeight)
        }
    }
}

export class AvatarData {
    headPicId: number;
    level?: number;
    avatarUrl: string;
    constructor(headPicId: number, level?: number, avatarUrl?: string | Uint8Array) {
        this.headPicId = headPicId;
        this.level = level;
        this.avatarUrl = avatarUrl instanceof Uint8Array ? DataHelper.BytesToString(avatarUrl) : avatarUrl;
    }
}

export class AvatarGuildData {
    headIconId: number;
    constructor(headIconId: number) {
        this.headIconId = headIconId;
    }
}

export class AvatarGuildCell extends BaseItem {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        IconSp: <fgui.GLoader>null,
    };

    public SetData(data: AvatarGuildData) {
        UH.SpriteName(this.viewNode.BgSp, "CommonAtlas", `QiShiTouXiangKuang${data.headIconId}`)
        UH.SpriteName(this.viewNode.IconSp, "CommonAtlas", `QiShiTouXiang${data.headIconId}`)
    }
}