export enum CommonEvent {
    /**FGUI package销毁 */
    FGUI_PACKAGE = "ev0",
    /**关闭页面 arg1 viewName：string arg2 viewClass  */
    VIEW_CLOSE = "ev0-1",
    FGUI_PACKAGE_ONLOAD = "ev0-2",

    NET_CLOSE = "ev1",
    NET_RECONS = "ev1-0",
    NET_RECON = "ev1-1",
    /**切服 */
    NET_SWITCH = "ev1-2",
    /**开始切服 */
    NET_BEFORE_SWITCH = "ev1-3",
    /**断网重连 */
    NET_CHECKED = "ev1-4",

    LOGIN_SUCC = "ev2",
    /**获取到角色信息 */
    LOGIN_SUCC_ROLEDATA = "ev2-1",
    /**菜单分享成功 */
    PACK_WX_MENUSHARESUC = "ev3",
    /**分享成功 arg1 活动id */
    PACK_WX_AROUSESHARESUC = "ev3-1",
    /**激励视频 */
    PACK_WX_ADVERTSUC = "ev3-2",
    /**被邀请进游戏 */
    PACK_WX_BE_AROUSESHARESUC = "ev3-3",
    /**微信帐号信息 */
    PACK_WX_BE_AVATAR = "ev3-4",
    /**初次拿到服务器时间 */
    FIRST_GET_SEVER_TIME = "ev4",

    /**动效开始播放监听事件 */
    SPINE_ANI = "SPINE_ANI"
}