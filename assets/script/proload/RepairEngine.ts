import { assetManager, Label, Graphics, UITransform, sys, director } from "cc";
import { LogError } from "core/Debugger";
import { Image, MovieClip } from "fairygui-cc";/**此项不要删除 */
import { Timer } from "modules/time/Timer";
import { DataHelper } from "../helpers/DataHelper";

export class RepairEngine {
    /**修复引擎配置 */
    public static repair() {
        assetManager.downloader.maxConcurrency = 50;
        Label.prototype.onCustomDestroy = Label.prototype.onDestroy;
        Image.prototype.onCustomDestroy = Image.prototype.onDestroy;
        if (!Image.prototype.onDestroy) {
            /**必须导入FGUI包 
             * import { Image, MovieClip } from "fairygui-cc";
            */
            LogError("！！！！！！！！！！！！！！！！警告 Image没有来自fairygui-cc")
        }
        MovieClip.prototype.onCustomDestroy = MovieClip.prototype.onDestroy;
        Graphics.prototype.onCustomDestroy = Graphics.prototype.onDestroy;
        UITransform.prototype.onCustomDestroy = UITransform.prototype.onDestroy;
        // RichText.prototype.onCustomDestroy = RichText.prototype.onDestroy

        // Mask.prototype.onCustomDestroy = () => { };
        // UIOpacity.prototype.onCustomDestroy = UIOpacity.prototype.onDisable;
        // LabelOutline.prototype.onCustomDestroy = () => { };

        //sys.__isWebIOS14OrIPadOS14Env = true;
        RepairEngine.repairMeshBuff();
        RepairEngine.repairTextDecoder()
    }

    private static repairMeshBuff = function repairMeshBuff() {
        if (sys.__isWebIOS14OrIPadOS14Env) {
            let count = 0;
            Timer.Inst().AddRunTimer(function () {
                director.root.batcher2D._bufferAccessors.forEach(function (element) {
                    let buff = element._buffers[0];
                    let byteCount = buff.indexOffset;
                    let _nextFreeIAHandle = buff['last_nextFreeIAHandle'] ? buff['last_nextFreeIAHandle'] : 0;
                    let _iaPool = buff['_iaPool'];
                    count += 1;
                    let start = _nextFreeIAHandle;
                    if (count > 2) {
                        count = 0;
                        start = 0;
                    }
                    if (start < _iaPool.length) {
                        for (let x = start; x < _iaPool.length; x++) {
                            let iaRef = _iaPool[x];
                            if (iaRef.indexBuffer.size > byteCount || start == 0) {
                                iaRef.ia.destroy();
                                iaRef.vertexBuffers[0].destroy();
                                iaRef.indexBuffer.destroy();
                                // if (index == -1)
                                //     index = x;
                            }
                        }
                        if (start >= 0)
                            _iaPool.splice(start, _iaPool.length - start);
                    }
                });
            }, 5, -1, false);
        }
    };

    private static repairTextDecoder() {
        if (undefined !== window.TextEncoder) { DataHelper.init(); return; }

        function _TextEncoder(encode: string) {
            //--DO NOTHING
        }
        _TextEncoder.prototype.encode = function (s: string) {
            return unescape(encodeURIComponent(s)).split('').map(function (val) { return val.charCodeAt(0); });
        };
        function _TextDecoder(decode: string) {
            //--DO NOTHING
        }
        _TextDecoder.prototype.decode = function (code_arr: any) {
            return decodeURIComponent(escape(String.fromCharCode.apply(null, code_arr)));
        };

        (window as any).TextEncoder = _TextEncoder;
        (window as any).TextDecoder = _TextDecoder;
        DataHelper.init();
    }
}