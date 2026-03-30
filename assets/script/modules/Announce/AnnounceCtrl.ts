import { LogError } from 'core/Debugger';
import { ViewManager } from 'manager/ViewManager';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { ROLE_SETTING_TYPE } from 'modules/common/CommonEnum';
import { Mod } from 'modules/common/ModuleDefine';
import { FunOpen } from 'modules/guide/FunOpen';
import { LoginData } from 'modules/login/LoginData';
import { RoleData } from 'modules/role/RoleData';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { PackageData } from 'preload/PkgData';
import { HTTP } from '../../helpers/HttpHelper';
import { AnnounceView } from './AnnounceView';

export class AnnounceCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCNoticeTimeRet, func: this.onSCNoticeTimeRetInfo },
        ]
    }

    private announce_list :any
    private marked_time = 0
    private login_mark = 0
    public AutoOpenAnnounce(){
        let notice_call = LoginData.GetUrlParm().param_list.update_notice_query_url
        
        let url = notice_call + "?spid="+PackageData.Inst().getSpid()
        HTTP.GetJson(url, this.AutoNoticeRet.bind(this));
    }

    private AutoNoticeRet(statusCode: number, resp: any)
    {
        let last_time = 0
        let cur_time = TimeCtrl.Inst().ServerTime
        let list = []
        if(resp && resp.ret == 0){
            for(var index in resp.data)
            {
                let oper = resp.data[index]
                if (cur_time >= oper.beg_time && cur_time <= oper.end_time){
                    let handled = this.FixRichTextForUrl(oper.content)

                    let info = {
                        content :handled,
                        title:oper.title,
                        add_time:oper.add_time,
                    }
                    list.push(info)

                    // 有效时间内的最新公告，且比已存在的配置大
                    // LogError("?d gfe",oper.add_time)
                    if(last_time < Number(oper.add_time))
                    {
                        last_time = Number(oper.add_time)
                    }
                }
            }
        }

        list.sort((a, b) => b.add_time - a.add_time);
        this.SetAnnounceInfo(list)

        if(this.marked_time < last_time)
        {
            ViewManager.Inst().OpenView(AnnounceView,{init_flag:true})
        }
    }

    public onSCNoticeTimeRetInfo(protocol:PB_SCNoticeTimeRet)
    {
        LogError("1465?公告记录时间下发?",protocol)
        this.marked_time = Number(protocol.noticeTime)

        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Announce.Main);
        if(this.login_mark == 0 && open_t.is_open)
        {
            this.AutoOpenAnnounce()
            this.login_mark = 1
        }
    }

    public SendCSNoticeTimeReq(type: number, param:number)
    {
        let protocol = this.GetProtocol(PB_CSNoticeTimeReq);
        protocol.type = type ? type : 0
        protocol.param = param ? param : 0
        LogError("1464?公告记录时间请求?",protocol,type,param)
        this.SendToServer(protocol);
    }

    public TryOpenAnnounce(){
        // ViewManager.Inst().OpenView(AnnounceView);
        let notice_call = LoginData.GetUrlParm().param_list.update_notice_query_url
        
        let url = notice_call + "?spid="+PackageData.Inst().getSpid()
        HTTP.GetJson(url, this.NoticeRet.bind(this));
    }

    private NoticeRet(statusCode: number, resp: any) {

        let cur_time = TimeCtrl.Inst().ServerTime
        let list = []
        if(resp && resp.ret == 0){
            for(var index in resp.data)
            {
                let oper = resp.data[index]
                if (cur_time >= oper.beg_time && cur_time <= oper.end_time){
                    let handled = this.FixRichTextForUrl(oper.content)
                    // LogError("?check?!1",oper.content)
                    // LogError("?check?!2",handled)
                    let info = {
                        content :handled,
                        title:oper.title,
                        add_time:oper.add_time,
                    }
                    list.push(info)
                }
            }
        }
        
        list.sort((a, b) => b.add_time - a.add_time);
        this.SetAnnounceInfo(list)

        ViewManager.Inst().OpenView(AnnounceView);
    }

    public SetAnnounceInfo(data:any){
        this.announce_list = data
    }

    public GetAnnounceInfo(){
        return this.announce_list 
    }

    public FixRichTextForUrl(str:string){
        let url=str.replace("{【}","[")

        while(url.search("{【}") != -1) { 
            url=url.replace("{【}","[")
        } 

        url = url.replace("{】}","]")
        while(url.search("{】}") != -1) { 
            url=url.replace("{】}","]")
        } 

        while(url.search("url=") != -1) { 
            url=url.replace("url=","mark=http://")
        } 

        while(url.search("mark") != -1) { 
            url=url.replace("mark","url")
        } 

        return url
    }
}
