import { BaseView, viewRegcfg, ViewLayer } from "modules/common/BaseView";
import { CommonButton } from "modules/extends/CommonButton";
import * as fgui from "fairygui-cc";
import { UH } from "../../helpers/UIHelper";
import { Language } from "modules/common/Language";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { EventCtrl } from "modules/common/EventCtrl";
import { CommonEvent } from "modules/common/CommonEvent";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { MainView } from "modules/main/MainView";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";

@BaseView.registView
export class CreateRoleView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CreateRole",
        ViewName: "CreateRoleView",
        LayerType: ViewLayer.Normal,
    };

    protected viewNode = {
        Board:<CommonBoard3>null,
        nameInput: <fgui.GTextInput>null,
        btnOk: <CommonButton>null,
        btnCancel: <CommonButton>null,
        genderMale: <fgui.GButton>null,
        genderFemale: <fgui.GButton>null,
        avatarLoader: <fgui.GLoader>null,
        randomBtn: <fgui.GButton>null,
        titleText: <fgui.GTextField>null
    };

    private selectedGender: number = 1; // 1: Nam, 2: Nữ

    InitData() {
         this.viewNode.Board.SetData(new BoardData(CreateRoleView));
        this.selectedGender = 1;
    }

    InitUI() {
        this.viewNode.genderMale.selected = true;
        this.viewNode.genderFemale.selected = false;

        this.viewNode.genderMale.onClick(this.onSelectMale, this);
        this.viewNode.genderFemale.onClick(this.onSelectFemale, this);

        this.viewNode.btnOk.onClick(this.onClickOk, this);
        this.viewNode.btnCancel.onClick(this.onClickCancel, this);
        this.viewNode.randomBtn.onClick(this.onClickRandom, this);

        this.viewNode.titleText.text = Language.CreateRole?.title || "Tạo nhân vật";
        this.viewNode.nameInput.promptText = Language.CreateRole?.name_placeholder || "Nhập tên nhân vật...";

        this.updateAvatar();

        // Lắng nghe sự kiện tạo role thành công
        EventCtrl.Inst().on(CommonEvent.LOGIN_SUCC_ROLEDATA, this.onCreateRoleSucc, this, true);
    }

    private onSelectMale() {
        this.selectedGender = 1;
        this.viewNode.genderMale.selected = true;
        this.viewNode.genderFemale.selected = false;
        this.updateAvatar();
    }
    private onSelectFemale() {
        this.selectedGender = 2;
        this.viewNode.genderMale.selected = false;
        this.viewNode.genderFemale.selected = true;
        this.updateAvatar();
    }
    private updateAvatar() {
        if (this.viewNode.avatarLoader) {
            this.viewNode.avatarLoader.url =
                this.selectedGender === 1
                    ? "ui://CreateRole/role_male"
                    : "ui://CreateRole/role_female";
        }
    }
    
    private onClickRandom() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        const names = ["Long", "Hải", "Quang", "An", "Bảo", "Phúc", "Trang", "Vân", "Ngọc", "Linh"];
        const randomName = "NgườiChơi" + names[Math.floor(Math.random() * names.length)];
        this.viewNode.nameInput.text = randomName;
    }
    private onClickOk() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        const roleName = this.viewNode.nameInput.text.trim();
        if (!roleName) {
            UH.Tip(Language.CreateRole?.NameEmpty || "Vui lòng nhập tên nhân vật!");
            return;
        }
        // Gửi request tạo role qua RoleCtrl
        RoleCtrl.Inst().SendCreateRoleReq(roleName, this.selectedGender);
    }
    private onClickCancel() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().CloseView(CreateRoleView);
    }
    private onCreateRoleSucc() {
        ViewManager.Inst().CloseView(CreateRoleView);
        ViewManager.Inst().OpenView(MainView);
    }
    CloseCallBack(): void {
        EventCtrl.Inst().off(CommonEvent.LOGIN_SUCC_ROLEDATA, this.onCreateRoleSucc, this, true);
    }
}
