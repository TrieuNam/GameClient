import * as fgui from "fairygui-cc";

/**
 * Runtime patch cho fairygui-cc v1.1.0.
 *
 * Vấn đề: GComponent.getChildByPath(path) gọi path.split(".") mà không
 * kiểm tra null/undefined. Khi dữ liệu binary của UI package có một entry
 * với target path null (buffer.readS() trả về null), toàn bộ component bị
 * crash với:
 *   TypeError: Cannot read properties of undefined (reading 'split')
 *   at GComponent.getChildByPath
 *
 * Giải pháp: monkey-patch prototype để thêm null guard TRƯỚC khi bất kỳ
 * UIPackage nào được load. File này phải được import sớm nhất có thể
 * (trong Main.ts hoặc entry point).
 *
 * KHÔNG sửa node_modules — patch này nằm trong source code và đi theo deploy.
 */

const _originalGetChildByPath = fgui.GComponent.prototype.getChildByPath as Function;

fgui.GComponent.prototype.getChildByPath = function <T extends fgui.GObject>(path: String, classType?: any): T {
    if (!path) {
        return null as unknown as T;
    }
    return _originalGetChildByPath.call(this, path, classType) as T;
};

