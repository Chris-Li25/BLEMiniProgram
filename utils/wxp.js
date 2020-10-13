import { promisifyAll, promisify } from 'miniprogram-api-promise';

export const wxp = {}
// 对小程序api接口全部Promise化
promisifyAll(wx, wxp);