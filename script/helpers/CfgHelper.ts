import { KeyFunction } from "modules/common/CommonType";

export let CfgHelper: KeyFunction = {};

/**
 *处理表数据 返回以keys为key的表数据对象，当keys长度不为1，用"-"拼接
 *example: p1:datas:xxx[]  p2:[a,b]  return:{datas[x].a-datas[x].b:datas[x]};
 *@param datas:需要处理的表数据
 *@param keys:用来作为key的表字段名数组 
 *@param isArray:每个key对应的值是否为数组  
 */
CfgHelper.reSetdatas = function (datas: any[], keys: string[], isArray = false) {
    let r_data: any = {};
    for (let i = 0; i < datas.length; i++) {
        let data = datas[i];
        let key = data[keys[0]];
        for (let j = 1; j < keys.length; j++)
            key += "-" + data[keys[j]];
        if (!isArray)
            r_data[key] = data;
        else {
            !r_data[key] && (r_data[key] = []);
            r_data[key].push(data);
        }
    }
    return r_data;
}