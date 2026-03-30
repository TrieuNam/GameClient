export type NetData = Uint8Array;

// 协议辅助接口
export interface IProtocolHelper {
    getHeadlen(msg: NetData): number;                   // 返回包头长度
    getHearbeat(): NetData;                 // 返回一个心跳包
    checkPackage(msg: NetData): boolean;    // 检查包数据是否合法
    getPackageId(msg: NetData): number;     // 返回包的id或协议类型
    getPackageData(msg: NetData, target: any): any;    // 解析数据获得protobuf数据 
    handlePackageData(msg: any): NetData;    // 处理数据获得protobuf数据 
}
