import { color, Node, resources, sp, SpriteFrame, Texture2D, _decorator, Sprite, log } from "cc";
import { EDITOR, NATIVE } from "cc/env";
import { SPINE_ANI_SLOT, SPINE_ANI_EVENT_STATE, SPINE_ANI_STATE } from "modules/scene_obj_spine/ObjSpineConfig";
import { Debugger, LogError } from "./Debugger";
import { SpColor, spine, SpSkeletonBase } from "./SpSkeletonBase";
export const middleware = (window as any).middleware;

const { ccclass, property } = _decorator;
let handleKeys = {
    preload: "preload"
}

type TYPE_EVENT_DATA = {
    audioPath: string,
    floatValue: number,
    intValue: number,
    name: string,
    stringValue: string,
}

type TYPE_EVENT_DATAS = {
    data: TYPE_EVENT_DATA,
    audioPath: string,
    floatValue: number,
    intValue: number,
    time: number,
    stringValue: string,
}
@ccclass('SpSkeleton')
export class SpSkeleton extends SpSkeletonBase {

    static spinePreviewMode() {

        if (EDITOR) {

            // 重写update方法 达到在编辑模式下 自动播放动画的功能
            sp.Skeleton.prototype['update'] = function (dt) {
                if (EDITOR) {
                    (cc['engine'] as any)._animatingInEditMode = 1;
                    (cc['engine'] as any).animatingInEditMode = 1;
                }
                if (this.paused) return;
                dt *= this.timeScale * sp['timeScale'];
                if (this.isAnimationCached()) {
                    console.log("isAnimationCached");

                    // Cache mode and has animation queue.
                    if (this._isAniComplete) {

                        if (this._animationQueue.length === 0 && !this._headAniInfo) {

                            let frameCache = this._frameCache;
                            if (frameCache && frameCache.isInvalid()) {

                                frameCache.updateToFrame();
                                let frames = frameCache.frames;
                                this._curFrame = frames[frames.length - 1];
                            }
                            return;
                        }
                        if (!this._headAniInfo) {

                            this._headAniInfo = this._animationQueue.shift();
                        }
                        this._accTime += dt;
                        if (this._accTime > this._headAniInfo.delay) {

                            let aniInfo = this._headAniInfo;
                            this._headAniInfo = null;
                            this.setAnimation(0, aniInfo.animationName, aniInfo.loop);
                        }
                        return;
                    }
                    this._updateCache(dt);
                } else {
                    this._updateRealtime(dt);
                }
            }
        }
    }

    private _list_spTexture: { [key: string]: { id_res: string, tex: sp.SkeletonTexture | Texture2D } };
    private _list_spTexture2: { [key: string]: { comp_sprit: Sprite, id_res: string, tex: SpriteFrame } };
    constructor() {
        super();
    }

    public __preload() {
        let t = this;
        if (!EDITOR && !NATIVE) {
            this.copySkeData();
        }
        if (!t._list_spTexture) {
            t._list_spTexture = {};
            t._list_spTexture2 = {};
        }
        super.__preload(false);
        t._onPreLoad && t._onPreLoad();
    }



    public bindBone(p_ske: SpSkeleton, p_name: SPINE_ANI_SLOT, bineName: SPINE_ANI_SLOT) {
        let p_bone: any;
        for (let index = 0, l = p_ske._skeleton.bones.length; index < l; index++) {
            const bone = p_ske._skeleton.bones[index];
            if (bone.data.name == p_name) {
                p_bone = bone;
                break;
            }
        }
        let y = 0;
        if (p_bone) {
            let root = this.findBone(bineName)
            if (root) {
                if (NATIVE) {
                    root.data.y = p_bone.data.y / 0.5
                    root.data._parent = p_bone.data;
                    root._parent = p_bone;
                } else {
                    // root.data.y = root.data.y;
                    root.data.parent = p_bone.data;
                    root.parent = p_bone;
                }
                y = root.data.y
            }
        }
        return y;
    }

    onDestroy() {
        super.onDestroy();
        let t = this;
        t._list_spTexture = undefined;
        t._list_spTexture2 = undefined;
    }

    cleanSkin2() {
        for (const key in this._list_spTexture2) {
            const element = this._list_spTexture2[key];
            if (element && element.comp_sprit) {
                element.comp_sprit.spriteFrame = null;
                element.tex.decRef();
            }
            delete this._list_spTexture2[key];
        }
    }

    /**
     * 换装
     * @param name_slot 骨骼名字
     * @param tex_src 路径
     */
    public changSkin(name_slot: SPINE_ANI_SLOT, tex_src: string) {
        let t = this;
        if (NATIVE) {
            t.changSkinNative(name_slot, tex_src);
            return
        }
        let slot = t.findSlot(name_slot);
        if (!slot) {
            return;
        }
        let data_sp_tex: any = this._list_spTexture[name_slot];
        if (!data_sp_tex) {
            data_sp_tex = this._list_spTexture[name_slot] = { id_res: undefined, tex: new sp.SkeletonTexture(undefined) }
        }
        if (tex_src == data_sp_tex.id_res) {
            return;
        }
        let sptexture = data_sp_tex.tex;
        data_sp_tex.id_res = tex_src;
        resources.load(tex_src + "/texture", Texture2D, (err: any, texture: any) => {
            if (texture && this._list_spTexture[name_slot].id_res == tex_src) {
                if (slot) {
                    texture.addRef();
                    let attachment = slot.getAttachment();
                    let region = attachment.region;
                    sptexture['_image'] = texture;
                    sptexture.setRealTexture(texture);
                    region.width = texture.width;
                    region.height = texture.height;
                    region.originalWidth = texture.width;
                    region.originalHeight = texture.height;
                    region.page = undefined;
                    region.rotate = false;
                    region.u = 0;
                    region.v = 0;
                    region.u2 = 0.5;
                    region.v2 = 0.5
                    region.texture = sptexture;
                    //旋转角度 图集导出时会旋转 重置为0
                    region.degrees = 0;
                    region.renderObject = region;
                    attachment.updateUVs();
                } else {
                    Debugger.LogError(name_slot + " is undefind");
                }
            }
        });

    }
    /**
     * Native换装
     * @param name_slot 骨骼名字
     * @param tex_src 路径
     */
    private changSkinNative(name_slot: SPINE_ANI_SLOT, tex_src: string) {
        let t: any = this;
        let slot = t.findSlot(name_slot);
        if (!slot) {
            return;
        }
        let data_sp_tex: any = t._list_spTexture[name_slot];
        if (!data_sp_tex) {
            data_sp_tex = t._list_spTexture[name_slot] = { id_res: undefined, tex: new middleware.Texture2D() }
        }
        if (tex_src == data_sp_tex.id_res) {
            return;
        }
        let sptexture = data_sp_tex.tex;
        data_sp_tex.id_res = tex_src;
        resources.load(tex_src + "/texture", Texture2D, (err: any, texture: any) => {
            if (texture) {
                if (slot) {
                    let attachment = slot.getAttachment();
                    if (!attachment || !attachment.getRendererObject) {
                        return
                    }
                    let attachment_vs = attachment.getRendererObject()
                    if (attachment_vs._texture == sptexture) {
                        return
                    }

                    // let region = attachment.region;
                    // sptexture['_image'] = texture;
                    // let index = 0;
                    // if ((t.skeletonData as any).recordTexture) {
                    //     index = (t.skeletonData as any).recordTexture(texture);
                    // }
                    // sptexture.setRealTextureIndex(index);
                    sptexture.setPixelsWide(texture.width);
                    sptexture.setPixelsHigh(texture.height);
                    sptexture.setNativeTexture(texture.getImpl())

                    attachment.setUVs(0, 0, 0.5, 0.5, false)
                    attachment.setRegionWidth(texture.width);
                    attachment.setRegionHeight(texture.height);
                    attachment.setRegionOriginalWidth(texture.width);
                    attachment.setRegionOriginalHeight(texture.height);
                    attachment.setWidth(texture.width);
                    attachment.setHeight(texture.height);

                    if (attachment_vs._texture) {
                        attachment_vs._texture.release()
                    }
                    attachment_vs._texture = sptexture;
                    attachment_vs._texture.retain();

                    let verts = attachment_vs._triangles.verts;
                    let uvs = attachment.getUVs();
                    for (let i = 0, ii = 0; i < 4; ++i, ii += 2) {
                        verts[i].texCoord.u = uvs[ii];
                        verts[i].texCoord.v = uvs[ii + 1];
                    }

                    attachment.updateOffset();
                } else {
                    Debugger.LogError(name_slot + " is undefind");
                }
            }
        });
    }


    public changSkin2(name_slot: SPINE_ANI_SLOT, id: string | number, tex_src: string, cb?: (result: boolean, id: string | number) => boolean, attachName = "attach") {
        let t = this;
        let skin = t.node.getChildByName("skin");
        if (skin) {
            let slot = skin.getChildByName(name_slot);
            if (slot) {
                let attach = slot.getChildByName(attachName);
                if (attach) {
                    let comp_sprit = attach.getComponent(Sprite);
                    if (comp_sprit && comp_sprit.spriteFrame && comp_sprit.spriteFrame.name == id) {
                        return
                    }
                    if (!this._list_spTexture2) {
                        this._list_spTexture2 = {};
                    }
                    let data_sp_tex: any = this._list_spTexture2[name_slot];
                    if (!data_sp_tex) {
                        data_sp_tex = this._list_spTexture2[name_slot] = { comp_sprit: undefined, id_res: undefined, tex: undefined }
                    }
                    if (tex_src == data_sp_tex.id_res) {
                        cb && cb(false, id)
                        return;
                    }
                    data_sp_tex.id_res = tex_src;
                    resources.load(tex_src + "/spriteFrame", SpriteFrame, (err: any, texture: SpriteFrame) => {
                        if (texture) {
                            data_sp_tex.tex = texture;
                            let check = true;
                            cb && (check = cb(true, id));
                            if (check) {
                                texture.addRef();
                                data_sp_tex.comp_sprit = comp_sprit;
                                comp_sprit.spriteFrame = texture
                                let ske_slot = t.findSlot(name_slot);
                                if (ske_slot && attachName == "attach") {
                                    ske_slot.color = new SpColor(ske_slot.color.r, ske_slot.color.g, ske_slot.color.b, ske_slot.color.a);
                                    ske_slot.data.color = ske_slot.color
                                    ske_slot.color.setSpriteColor(comp_sprit);
                                }
                                return;
                            }
                            // Debugger.LogError(name_slot + " is undefind");
                        }
                        cb && cb(false, id)
                    });
                }
            }
        }
    }

    public Check() {
        let t = this;
        let e_attact;
        let ske_cach = (t._skeletonData as any)._skeletonCache;
        if (ske_cach && ske_cach.events) {
            let ani_events: TYPE_EVENT_DATA[] = NATIVE ? ske_cach.getEvents() : ske_cach.events;

            for (let index = 0; index < ani_events.length; index++) {
                const element = ani_events[index];
                if (element.name === SPINE_ANI_EVENT_STATE.ATTACK) {
                    e_attact = element;
                }
            }
            if (!e_attact) {
                let anis = ske_cach.animations;
                // Debugger.LogError(t.name, " Event undefind e_attact");
                for (let index = 0; index < anis.length; index++) {
                    const element = anis[index];
                    if (element.name == SPINE_ANI_STATE.ATTACK) {
                        let time = element.duration / 2;
                        let eventData = new spine.EventData(SPINE_ANI_EVENT_STATE.ATTACK) //{ audioPath: null, name: SPINE_ANI_EVENT_STATE.ATTACK, intValue: 0, stringValue: "", floatValue: 0 };
                        // eventData._intValue = 0;
                        // eventData._floatValue = 0;
                        // eventData.stringValue = ""
                        // eventData.audioPath = ""
                        let event_data_s = new spine.Event(time, eventData) // { data: event, audioPath: event.audioPath, floatValue: event.floatValue, stringValue: event.stringValue, intValue: event.intValue, time: time };
                        // event_data_s._time = time
                        // event_data_s._data = eventData
                        let time_line = new spine.EventTimeline(1);
                        time_line.setFrame(0, event_data_s)
                        element.timelines.push(time_line);
                        ani_events.push(eventData);
                    }
                }
            }
        }
    }
}



SpSkeleton.spinePreviewMode();