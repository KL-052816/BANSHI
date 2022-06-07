import {importScript, timeFormat} from '@ruhnn/common/common/util';
import NUM from '@ruhnn/common/common/number';
import {getAliOss, uploadOssUrl} from '@ruhnn/common/components/ImageUpload/common/api';
import {getUUid} from '@ruhnn/common/components/ImageUpload/common/util';
import moment from 'moment';
import {express, expressToCode} from './constant.common';

export function copyJSON(json) {
    return JSON.parse(JSON.stringify(json));
}

// 保证不会报错
export function safeParseJSON(str, defaultValue = {}) {
    if (typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch (e) {
        return defaultValue;
    }
}

export const required = (message = '必填', type?) => ({
    required: true,
    message,
    ...(type ? {type} : {}),
});
export const whitespace = (message = '不能为空') => ({required: true, whitespace: true, message});
export const len = (len, message?) => ({len, message: message || `需要${len}个字`});
export const max = (max, message?) => ({max, message: message || `最多${max}个字`});
export const min = (min, message?) => ({min, message: message || `最少${min}个字`});
export const pattern = (pattern, message = '格式不符') => ({pattern, message});

export const urlRegBase = '(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]';
export const urlReg = new RegExp(urlRegBase);
export const vaildHttp = (url: string) => /^http/g.test(url);

export const Reg = {
    number: /^(0|[1-9][0-9]*)$/,
    decimal: /^(0|[1-9][0-9]*)(\.\d+)?$/,
    url: urlReg,
    telephone: /^\d{11}$/,
    checkCode: /^\d{6}$/,
};

export const text = (l, require) => (require ? [whitespace(), max(l)] : [max(l)]);

export const number = (decimal = true, require = true) => [
    ...(require ? [required()] : []),
    pattern(decimal ? Reg.decimal : Reg.number, `必须是${decimal ? '数字' : '整数'}`),
];

export const telephone = (m1, m2, require = true) =>
    require ? [whitespace(m1), pattern(Reg.telephone, m2)] : [pattern(Reg.telephone, m2)];

export const checkCode = (m1, m2, require = true) =>
    require ? [whitespace(m1), pattern(Reg.checkCode, m2)] : [pattern(Reg.checkCode, m2)];

export const password = (m1, m2, require = true) => [
    ...(require ? [whitespace(m1)] : []),
    pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/,
        m2 || '必须包含大小写字母和数字，至少8位'
    ),
];

export const validSPAUrl = (url: string) => url[0] === '/' && url[1] !== '/';

/**
 * 两个字段必须相等验证
 * @param form Form.create()
 * @param field 比对字段名
 * @param m1    不相等提示
 * @return {*[]}
 */
export const confirm = (form, field, m1) => [
    (rule, value, callback) => {
        if (value !== form.getFieldValue(field)) {
            return callback(m1 || '两次密码不一致');
        }
        form.setFieldsValue({[field]: value});
        callback();
    },
];

export const getRangePickValueCustom = (value, notShowTime = false) => {
    if (value.length) {
        if (value[1] && value[0]) {
            return {
                value,
                label: `${timeFormat(value[0], !notShowTime)}~${timeFormat(
                    value[1],
                    !notShowTime
                )}`,
            };
        }
        if (value[0]) {
            return {
                value,
                label: `${timeFormat(value[0], !notShowTime)}`,
            };
        }
        return {
            value,
            label: `${timeFormat(value[1], !notShowTime)}`,
        };
    }
    return {};
};

export const getRangePickValueCustomForDay = value => {
    if (value.length) {
        return {
            value,
            label: `${timeFormat(value[0], false)}~${timeFormat(value[1], false)}`,
        };
    }
    return {};
};

export const getSearchValue = (search, custom = {}, pure = true) => {
    const p = {};
    Object.keys(search).forEach(k => {
        const value = pure ? search[k] : search[k].value;
        if (custom[k]) {
            p[k] = custom[k](value, search[k]);
        } else if (~k.indexOf('-')) {
            const key = k.split('-');
            if (value[0]) {
                p[key[0]] = value[0].startOf('day').valueOf();
            }
            if (value[1]) {
                p[key[1]] = value[1].endOf('day').valueOf();
            }
        } else if (~k.indexOf('~')) {
            const key = k.split('~');
            p[key[0]] = value[0];
            p[key[1]] = value[1];
        } else {
            p[k] = value;
        }
    });
    return p;
};

/**
 * SearchBox 组件,模糊查询模板
 * @param api   一个返回 Promise<{result<Array>}> 的函数
 * @return {function(...[*]=)}
 */
export const getDefaultSelect = function (api) {
    let resolveFunc = null;
    let last = null;
    return name => {
        // 对400毫秒内的上一次模糊搜索返回空数组
        if (resolveFunc) resolveFunc([]);
        clearTimeout(last);
        return new Promise(resolve => {
            resolveFunc = resolve;
            last = setTimeout(() => {
                if (!name) return resolve([]);
                api(name).then(data =>
                    resolve(data && Array.isArray(data.result) ? data.result : [])
                );
            }, 700);
        });
    };
};

/**
 * 数字转字符
 * 1000 => 1k 500=> 0.5k 10000 => 1w
 * @param num
 * @param point  保留小数位数
 * @param unit   k|w|K|W 默认自动匹配 >1w 用 w , 1k-1w 用 k
 * @return {string}
 */
export const transformNumber = (num: number, point = 2, unit = '') => {
    if (typeof num !== 'number') return '';
    unit = unit ? unit.toLowerCase() : num > 10000 ? 'w' : 'k';
    const powMap = {k: 3, w: 4};
    const pow = powMap[unit];
    const u = window.Math.pow(10, pow);

    if (num < u) {
        return String(num);
    }
    const s = num % u;
    point = s ? point : 0;
    return `${parseFloat((num / u).toFixed(point))}${unit}`;
};

/**
 * 将对象里的数值 统一处理，后端保存金钱精确到分
 * @param num
 * @param fields
 * @param defaultValue
 * @param method       用 NUM 的哪个方法处理数据
 * @param time
 * @returns {*}
 */
export const batchTransNumber = (num, fields?, defaultValue?, method = 'div', time = 100) => {
    const isObj = typeof num === 'object';
    num = isObj ? copyJSON(num) : {num};
    Object.keys(num).forEach(i => {
        if (
            // fields 不存在，值为数值类型
            (!validArray(fields) && typeof num[i] === 'number') ||
            // fields 存在，且包含改字段名
            (validArray(fields) && fields.includes(i))
        ) {
            // 第二种情况可能需要转换为数值
            num[i] = parseFloat(num[i]);
            num[i] = isNaN(num[i]) ? defaultValue : NUM[method](num[i], time);
        }
    });
    return isObj ? num : num.num;
};

export const divNumber = batchTransNumber;

export const mulNumber = (num, fields?, defaultValue?, method?, time?) =>
    batchTransNumber(num, fields, defaultValue, 'mul', time);

/**
 * 时间戳转过去：几小时前
 * @param dateTime      时间戳
 * @return string
 */
export function getDateDiff(dateTime: number) {
    let result = '';
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const now = new Date().getTime();
    const diffValue = now - dateTime;
    if (diffValue < 0) return;
    const monthC = diffValue / month;
    const weekC = diffValue / (7 * day);
    const dayC = diffValue / day;
    const hourC = diffValue / hour;
    const minC = diffValue / minute;
    if (monthC >= 1) {
        result = `${parseInt(String(monthC), 10)}月前`;
    } else if (weekC >= 1) {
        result = `${parseInt(String(weekC), 10)}周前`;
    } else if (dayC >= 1) {
        result = `${parseInt(String(dayC), 10)}天前`;
    } else if (hourC >= 1) {
        result = `${parseInt(String(hourC), 10)}小时前`;
    } else if (minC >= 1) {
        result = `${parseInt(String(minC), 10)}分钟前`;
    } else result = '刚刚';
    return result;
}

/**
 * 比10小则前面加0
 */
export const addZero = (num: number) => (num < 10 ? `0${num}` : num);

/**
 * 获取年月日时间
 * @param dateTime      时间戳
 * 格式  2021.09.26
 */
export const getDate = (dateTime: number, mark = '/') =>
    moment(dateTime).format(`YYYY${mark}MM${mark}DD`);

// 获取月日
export const getMonthAndDay = (dateTime: number, mark = '-') =>
    moment(dateTime).format(`MM${mark}DD HH:MM:SS`);

/**
 * 获取年月日时间
 * @param dateTime      时间戳
 * 格式  2021.9.26  14:19
 */
export const getTimeDetail = (dateTime: number) => {
    const date = new Date(dateTime);
    return `${getDate(dateTime)} ${addZero(date.getHours())}:${addZero(date.getMinutes())}`;
};

/**
 * 获取年月日时间
 * @param dateTime      时间戳
 * 格式       2021-9-26 14:19:53
 */
export const getTimeDetailDash = (dateTime: any, mark = '-') => {
    const date = new Date(dateTime);
    const mainDate = date.toLocaleDateString().replace(/\//g, mark);
    return `${mainDate} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(
        date.getSeconds()
    )}`;
};

export {getUUid};

export const downLoad = (url, filename) =>
    fetch(url)
        .then(res =>
            res.blob().then(blob => {
                const a = document.createElement('a');
                const disposition = res.headers.get('Content-Disposition');
                a.download =
                    filename ||
                    (disposition ? decodeURIComponent(/filename=(.+)/.exec(disposition)[1]) : '');
                a.href = window.URL.createObjectURL(blob);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                window.URL.revokeObjectURL(url);
                return {success: true};
            })
        )
        .catch(e => console.log(e));

// oss sdk 初始化
function getOSSClient(): any {
    if (getOSSClient.client) return Promise.resolve(getOSSClient.client);

    const sdkPromise = (
        window.OSS
            ? Promise.resolve()
            : importScript(`//gosspublic.alicdn.com/aliyun-oss-sdk-6.1.1.min.js`)
    ).then(() => window.OSS);

    return Promise.all([sdkPromise, getAliOss()]).then(([OSS, res]) => {
        if (OSS && res && res.success) {
            const r = res.result;
            getOSSClient.client = window.OSS({
                region: r.region,
                accessKeyId: r.accessKeyId,
                accessKeySecret: r.accessKeySecret,
                stsToken: r.stsToken,
                bucket: r.bucket,
            });
        }
        return getOSSClient.client;
    });
}

declare namespace getOSSClient {
    let client: object;
}

export {getOSSClient};

// 上传
export const uploadOSS = (file, name) => getOSSClient().then(client => client.put(name, file));

// 将一组图片跟 pid 绑定
export const getImagePid = (imageList: Array<string>, pid?: string): Promise<string> => {
    pid = pid || getUUid();
    return uploadOssUrl({
        pid,
        remarkType: 2,
        images: imageList.map(url => ({
            url,
            name: url.split('/').pop(),
            type: 5,
        })),
    }).then(() => pid);
};

export const getExpressUrl = ({name, id, no}) => {
    const ename = name || express[id];
    return `https://www.kuaidi100.com/chaxun?com=${expressToCode[ename]}&nu=${no}`;
};

export const percent = (decimal, fixed = 2) => `${(decimal * 100).toFixed(fixed)}%`;

export const getFileViewUrl = url =>
    `//ruhnn-web.kol18.com/pdfjs/viewer.html?file=${url}&_t=${Date.now()}`;

// 判断有效值
export function validValue(val) {
    return val !== undefined && val !== '' && val !== null;
}

// 判断数组长度大于0
export function validArray(arr) {
    return Array.isArray(arr) && arr.length > 0;
}

// 判断对象存在属性
export function validObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

/**
 * 是否是JSON对象
 */
export const validJson = (str: string, errorInit: any = []) => {
    let temp;
    try {
        temp = JSON.parse(str);
    } catch (e) {
        temp = errorInit;
    }
    return temp;
};

// 节流
export function throttle(fn, wait = 500) {
    let timer = null;
    return function (...args) {
        // @ts-ignore
        const context = this;
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(context, args);
                timer = null;
            }, wait);
        }
    };
}
// 防抖
export function deBounce(func, wait) {
    let timeOut = null;
    return function (...args) {
        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

// 是否是图片
const imgs = ['png', 'jpg', 'jpeg'];
export const isImg = str => imgs.includes(str.slice(str.lastIndexOf('.') + 1).toLowerCase());

// 过滤new searchbox 结果
export const filterNewSearch = (values, originData) => {
    const temp = {};
    // eslint-disable-next-line
    for (const key in values) {
        if (validValue(values[key])) {
            const data = originData[key];
            if (data.getValueCustom) {
                temp[key] = data.getValueCustom(values[key]).value;
            } else if (Array.isArray(data.defaultSelect)) {
                // 下拉框
                temp[key] = data.defaultSelect.filter(v => v[data.value] === values[key])[0][
                    data.value
                ];
            } else if (Object.prototype.toString.call(values[key]) === '[object Object]') {
                // 模糊搜索
                temp[key] = values[key].key;
            } else {
                // input
                temp[key] = values[key];
            }
        }
    }
    return temp;
};

// 获取屏幕可用宽度
export const getWindowScreen = () => window.innerWidth;

// 过滤对象中所有有值的属性
export const filterObjectValue = obj => {
    const temp = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in obj) {
        if (validValue(obj[key])) {
            temp[key] = obj[key];
        }
    }
    return temp;
};

/**
 * 格式化数字，每隔多少位数字加逗号
 * @param {*} num 数字
 * @param {*} symbol 位数
 * @returns
 */
export const transferPriceNumber = (num, symbol = 3) => {
    if (!num && typeof num !== 'number') return '';
    const result = [];
    let counter = 0;
    const stringNum = (num || 0).toString();
    const decimalIndex = stringNum.indexOf('.');
    const decimal = decimalIndex > -1 ? stringNum.slice(decimalIndex) : '';
    num = (decimalIndex > -1 ? stringNum.slice(0, decimalIndex) : stringNum).split('');
    for (let i = num.length - 1; i >= 0; i--) {
        counter += 1;
        result.unshift(num[i]);
        if (!(counter % symbol) && i !== 0) result.unshift(', ');
    }
    return result.join('') + decimal;
};
/**
 * window.Notification提示
 */
export const notificationNotice = (msg: string) => {
    // 判断用户是否同意
    if (window.Notification && window.Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(msg);
    } else if (window.Notification && Notification.permission !== 'denied') {
        // 如果用户没有选择是否显示通知
        Notification.requestPermission(status => {
            // if (Notification.permission !== status) Notification.permission = status
            // 用户同意
            // eslint-disable-next-line no-new
            if (status === 'granted') new Notification(msg);
        });
    }
};

// 阿拉伯数字转中文数字
export function toChineseNum(num) {
    if (!/^\d*(\.\d*)?$/.test(num)) {
        alert('Number is wrong!');
        return 'Number is wrong!';
    }
    const AA = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const BB = ['', '十', '百', '千', '万', '亿', '点', ''];
    const a = String(num).replace(/(^0*)/g, '').split('.');
    let k = 0;
    let re = '';
    for (let i = a[0].length - 1; i >= 0; i--) {
        switch (k) {
            case 0:
                re = BB[7] + re;
                break;
            case 4:
                if (!new RegExp(`0{4}\\d{${a[0].length - i - 1}}$`).test(a[0])) re = BB[4] + re;
                break;
            case 8:
                re = BB[5] + re;
                BB[7] = BB[5];
                k = 0;
                break;
        }
        if (k % 4 === 2 && a[0].charAt(i + 2) !== '0' && a[0].charAt(i + 1) === '0')
            re = AA[0] + re;
        if (a[0].charAt(i) !== '0') re = AA[a[0].charAt(i)] + BB[k % 4] + re;
        k += 1;
    }
    if (a.length > 1) {
        re += BB[6];
        for (let i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
    }
    return re;
}

/**
 * 保留小数点后几位
 * 判断是否是0，防止js 二进制转换错误
 * 0.14 * 100 === 14.000000000000002
 */
export const retainNumDigit = (num: number, digit = 2) => {
    const stringNum = String(num);
    const pointIndex = stringNum.indexOf('.');
    if (pointIndex > -1) {
        let tag = false;
        for (let i = 0; i < digit; i++) {
            if (stringNum[pointIndex + 1 + i] !== '0') {
                tag = true;
                break;
            }
        }
        return !tag ? +stringNum.slice(0, pointIndex) : +stringNum.slice(0, pointIndex + digit + 1);
    }
    return num;
};

// 双指针循环，比Array.prototype.map效率更高
export function doublePointerMap<T = any, U = any>(
    list: T[] = [],
    callback: (item: T, index: number, array: T[]) => U
): U[] {
    const {length} = list;
    const result = new Array(length);
    let left = 0;
    let right = length - 1;
    while (left <= right) {
        result[left] = callback(list[left], left, list);
        result[right] = callback(list[right], right, list);
        left += 1;
        right -= 1;
    }
    // 垃圾回收
    // eslint-disable-next-line no-multi-assign
    left = right = undefined;
    return result;
}

// 过滤都是空格的字符串
// 如果是，使用 □ 转换
// 如果不是，返回字符串
export const filterEmptyString: (str: string) => string = (str: string) => {
    if (typeof str !== 'string') return '';
    let s = '';
    for (let i = 0; i < str.length; i++) {
        s += '□';
        if (str[i] !== ' ') return str;
    }
    return s;
};

// base64 => blob
const convertBase64ToBlob = (base64Data: string, type = '') => {
    let byteString;
    if (base64Data.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(base64Data.split(',')[1]);
    // base64 解码
    else {
        byteString = unescape(base64Data.split(',')[1]);
    }
    // var arrayBuffer = new ArrayBuffer(byteString.length); //创建缓冲数组
    // var ia = new Uint8Array(arrayBuffer);//创建视图
    const ia = new Uint8Array(byteString.length); // 创建视图
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {
        type,
    });
};

// 复制图片
export const copyImage = (src: string, cb: Function) => {
    const blobInput = convertBase64ToBlob(src, 'image/png');
    const clipboardItemInput = new ClipboardItem({'image/png': blobInput});
    navigator.clipboard.write([clipboardItemInput]);
    cb && cb();
};

// 获取image 尺寸
interface ImageResult {
    width: number;
    height: number;
    isRow: Boolean;
}
export const getImageSize = (url: string): Promise<ImageResult> => {
    const img = new Image();
    img.src = url;
    return new Promise(resolve => {
        img.addEventListener('load', () => {
            resolve({
                width: img.width,
                height: img.height,
                isRow: img.width / img.height >= 0.75, // 是否是横向图片，即 宽：长 > 3 : 4
            });
        });
    });
};

// 阿里云首图后缀
export const aliSuffix = '?x-oss-process=video/snapshot,t_0,f_jpg';

// 获取video当前帧截图
export const getVideoImage = video => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let url = '';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    url = canvas.toDataURL('image/png');
    return url;
};

// 判断是 video 还是 image
export const validVideo = (path = '') => {
    path = path.split('?')[0];
    return (
        ['avi', 'mov', 'rmvb', 'rm', 'flv', 'mp4', '3gp'].indexOf(
            path.slice(path.lastIndexOf('.') + 1)?.toLocaleLowerCase()
        ) > -1
    );
};

// 获取audio时长
export const getAudioTime = (dom: HTMLAudioElement) =>
    new Promise(resolve => {
        dom.oncanplay = () => resolve(dom.duration);
    });
    
// 对象的转换{1:'name'} => {valueName:1,labelName:name}  
export const objToArr = (obj, valueName = 'value', labelName = 'label') => {
        return Object.keys(obj).map(i => ({[valueName]: +i, [labelName]: obj[i]}));
    }