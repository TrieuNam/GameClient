import { _decorator, Component, assetManager, director } from "cc";
import { ReportManager, ReportType } from "../script/proload/ReportManager";
import { PackageData, url_parm } from "./PkgData";
import { PreloadToolFuncs, Report2Type } from "./PreloadToolFuncs";

const { ccclass } = _decorator;

@ccclass('Preload')
export class Preload extends Component {
    protected _reconnectTimer: any = null;
    protected _reconnectTimes: number = 0;

    start() {
        // console.error("!!!!!!Preload=====!!!!!!!!!!!");
        this._reconnectTimes = 5
        PackageData.Inst().init();
        this.requestQueryData()

        // console.error("!!!!!!Preload=====!!!!!!!!!!!END!!===========");
    }

    private requestOnComplete() {
        let queData = PackageData.Inst().getQueryData();
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_9000, Report2Type.par_12());
        if (PackageData.Inst().getHotUpdate()) {
            let funcName = 'SetRemoteBundleInfo'
            let setRemoteBundleInfo = (window as any)[funcName];
            if (setRemoteBundleInfo) {
                if (queData && queData.param_list && queData.param_list.update_url &&
                    queData.version_info && queData.version_info.assets_info) {
                    setRemoteBundleInfo(queData.param_list.update_url, queData.version_info.assets_info);
                }
                else {
                    console.error('Hotupdate SetRemoteBundleInfo ERROR,query data Exception');
                }
            }
            else {
                console.error(`Open hotupdate ERROR,function [${funcName}] not in windows!`);
            }
        }

        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_9002, Report2Type.par_12());
        assetManager.loadBundle("resources", (err, bundle) => {
            if (err) {
                console.error(`Load Resources Bundle ERROR:${err}`);
                PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_9003, Report2Type.par_12());
            }
            else {
                PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_9004, Report2Type.par_12());
                director.loadScene("Game");
            }
        })
    }

    private requestQueryData() {
        ReportManager.Inst().sendPoint(ReportType.loading);
        let url = PackageData.Inst().query_url;
        // console.error(`${url}`);
        PreloadToolFuncs.HttpGetJson(url, this.requestCallBack.bind(this));
    }

    private requestCallBack(statusCode: number, resp: url_parm | null, respText: string) {
        // console.error(`${statusCode},${respText}`);
        // console.table(resp);
        // ReportManager.Inst().sendPoint(ReportType.endQuery);
        clearTimeout(this._reconnectTimer)
        if (-1 != statusCode && null != resp) {
            PackageData.Inst().setQueryData(resp);
            this.requestOnComplete();
        } else if (this._reconnectTimes > 0) {
            this._reconnectTimes--
            this._reconnectTimer = setTimeout(() => {
                this.requestQueryData();
            }, 0.5);
        } else {
            let MainAgent = (window as any)['MainAgent'];
            if (MainAgent) {
                // this.MainAgent.wxModal(title, content, confirm_func, cancel_func, showCancel, confirmText, cancelText);
                MainAgent.wxModal("提示", "网络已断开，请检查网络状态后重试", () => {
                    MainAgent.exitMiniProgram()
                }, null, false);
            }
        }
    }
}