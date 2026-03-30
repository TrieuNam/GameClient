import { Singleton } from "core/Singleton";
import { TextHelper } from "../../helpers/TextHelper";

export class UserProtocolData extends Singleton{

    public static ToRichTxt(str:string){
        let params=str.split(";");
        let desc=params[1];
        let color=params[2];
        let url=params[4].replace("}","");
        let result = TextHelper.ColorStr(desc, color);
        result = `[url=${url}]${result}[/url]`
        return result;
    }
}