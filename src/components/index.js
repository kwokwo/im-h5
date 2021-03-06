/**
 *  ajax._getLoginBaseData() -> loginBase 
 *  返回存储在store中的login登录信息， 
 *  { 
 *    'id'+'_client_znkf_login_name': Number,
 *    client_znkf_login_sign: string
 *  }
 *  hx-api/index.js -> urlData
 *  链接参数对象
 *  {
 *      id: Number
 *      account: String,
 *      pwd: String
 *  }
 *  hx-api/index.js -> loginInfo
 *  ajax 用户返回数据对象元数据， 请求成功之后保存在store -> loginData
 *  数据格式参考  hx-api/ajax.js -> _setLoginStor()
 */
'use strict';
import chatWin from './chat-win';
import env from '../../config/env.js';
import ajax from './hx-api/ajax.js';
import hxApi from './hx-api';
import webIm from './hx-api/webim.js';
import customer from './customer-service';
import attachFastClick from 'fastclick';
// const robot = new Robot();
// const user = new User();
// /**
//  *  IM 对象，定义胖智构造函数
//  * @param  
//  */
let IM = function(_config) {
    // 默认配置信息，通过扩展新的属性
    // 获取当前环境信息 配置相关请求地址
    this.config = env[env.base];
    this.config = Object.assign(_config||{}); // 浅拷贝初始化配置
    env.setDOM(_config.dom);
    env.setTemplate(_config.template_url);
};

IM.prototype = {
    // 对外配置信息
    // /**  
    //  * init 初始化IM 
    //  * @param {}  初始化配置对象
    //  * @return {Object obj} this 返回初始化之后对象
    //  */  
    init() {
        attachFastClick.attach(document.body);
        // promise 
        new Promise((resolve, reject) => {
            env.DOM.log('绑定交互dom');
            //  bindDom 绑定交互dom
            // return resolve();
            env.DOM.setDisable(true);
           return env.DOM.initBaseDom(resolve, reject); // 返回promise对象 resolve
        }).then(() => {
            env.DOM.log('初始化登录用户');
            // 初始化登录用户
            // 判断是否存在缓存
          return chatWin.initBaseLogin();
        }).then(() => {
            env.DOM.log('初始化游客和会员服务');
            // 初始化服务
          return chatWin.initBaseService(); // 返回loginInfo
        }).then((loginInfo)=>{
            env.DOM.log('初始化环信服务');
            // 接入环信webIm
            return webIm.initImService();
        }).then(()=>{
            env.DOM.log('初始化自身服务');
            return webIm.initSessionService();
        }).then((res)=>{
            env.DOM.log('连接成功');
            env.DOM.setDisable(false);
        }).catch((error)=>{
            env.DOM.log(error, 'error');
        });
    },
};

let imCommon = Object.assign(ajax, hxApi, webIm, env, customer);
export {imCommon, IM};

