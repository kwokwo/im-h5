'use strict';
import env from '../../../config/env.js';
import md5 from 'md5';
import store from 'store';
import hxApi from './index.js';
export default {
    // 使用时被外部传入
    urlData: {},
    envConfig: env[env.base],
    loginStatus: false,
    /**
     * setDislikeAjax
     * 踩/不满意接口
     * @param {Number} id 
     * @return {Object} ajax 数据对象
     */
    setDislikeAjax(id) {
        return this.getJson({
            url: '/intelligent/api/chat/update_dislike/',
            data: JSON.stringify({
                im_msg_id: id,
                dislike: 1,
            }),
        });
    },
    /**
     * _getLogin_member_ajax 
     * 获取会员登录ajax配置
     * @return {Object} ajax-promise 返回ajax类promise对象
     */
    _getLoginMemberAjax() {
        return this.getJson({
            url: '/intelligent/api/sys/login/',
            data: {
                account: this.urlData.account,
                pwd: this.urlData.pwd,
                last_login_platform: 'web',
            },
        });
    },
    _getLoginVisitorAjax() {
        let loginData = store.get('loginBase'); // 获取loginData
        let loginName = loginData[this.urlData.id + '_client_znkf_login_sign'];
        return this.getJson({
            url: '/intelligent/api/sys/visitor/login/',
            data: JSON.stringify({
                login_name: loginName,
                last_login_platform: 'web',
            }),
        });
    },
    /**
     * _getRobotSetting_ajax 获取机器人设置信息
     * @param {Object} _ajaxLoginData 
     * @return {Object} 返回ajax 对象 .done .fail
     */
    _getRobotSettingAjax(_ajaxLoginData) {
        return this.getJson({
            type: 'get',
            url: '/intelligent/api/robot/settings/view/',
            data: {
                tenantid: _ajaxLoginData.tenant_id,
                uid: _ajaxLoginData.id,
            },
        });
    },
    /**
     * _setPageSetting_ajax 获取页面信息ajax
     * @param {Object} _ajaxLoginData 
     * @return {Object} 返回ajax 对象 .done .fail
     */
    _setPageSettingAjax(_ajaxLoginData) {
        return this.getJson({
            type: 'get',
            url: '/intelligent/api/channel/get_page_setting/',
            data: {
                id: _ajaxLoginData.client_tenantid,
                // channel_id: 2,
                // tenantid: _ajaxLoginData.client_tenantid,
                // uid: _ajaxLoginData.client_id,
            },
        });
    },
    _getRegisterAjax(loginName, sign) {
        return this.getJson({
            url: '/intelligent/api/sys/visitor/register/',
            data: JSON.stringify({
                tenant_id: this.urlData.id,
                login_name: loginName,
                sign: sign,
            }),
        });
    },
    completeAjax(msg) {
        return this.getJson({
            url: '/intelligent/api/get/auto/complete/',
            type: 'get',
            data: {
                tenant_ids: '',
                user_id: hxApi.loginInfo.client_id,
                input: msg,
            },
        });
    },
     /**
     * 格式化获取的数据
     * @param {Object} _ajaxLoginData 
     * @return {Object} data
     */
    formatLoginData(_ajaxLoginData) {
        // md5 数字签名 signUri
        let signUri = md5(_ajaxLoginData.tenant_id +
           _ajaxLoginData.access_token +
           _ajaxLoginData.id + 'e773145823ef68dc');

       let loginData = {
           client_tenantid: _ajaxLoginData.tenant_id, // 租客ID
           client_id: _ajaxLoginData.id, // 登陆用户ID
           client_hx_user_code: _ajaxLoginData.hx_user_code, // 环信用户CODE
           client_authtoken: _ajaxLoginData.access_token, // 验证token
           client_sign: signUri, // 签名
           client_real_name: _ajaxLoginData.real_name, // 登陆用户真实名称
           client_nick_name: _ajaxLoginData.nick_name, // 登陆用户昵称
           client_company: _ajaxLoginData.company, // 公司名称
           client_role_code: _ajaxLoginData.role_code, // 角色定义
           client_appkey: _ajaxLoginData.tenant_secret, // APP key
           client_verson: _ajaxLoginData.version_category, // 版本
       };
       return loginData;
   },
    /**
     * _getLogin_member_ajax 
     * 获取会员登录ajax配置
     * @param {Object} _ajaxLoginData 
     */
    _setLoginStor(_ajaxLoginData) {
        store.set('loginData', _ajaxLoginData);
    },
    /**
     * _getLoginBaseData  
     * 获取登录所需基本设置 (未登录时注册获取) | _loginData (登录时直接从store获取)
     * @param {Function} resolve 
     * @param {Function} reject
     * @return { Object } baseData (未登录时注册获取) | _loginData (登录时直接从store获取)
     */
    _getLoginBaseData(resolve, reject) {
        this.urlData = hxApi.urlData = hxApi.getBaseInfoFn();
        let baseData;
        // // 判断是否是同一个ID访问
        let oldLoginData = store.get('loginData');
        if (oldLoginData && oldLoginData.client_tenantid != this.urlData.id) {
            store.clearAll();
        }
        let _loginData = store.get('loginBase'); // 获取loginData
        if (_loginData) {
            return resolve(_loginData);
        }
        // 构建登录名称 loginName
        let loginName = 'visitor_' + ((new Date()).valueOf());
        // 构造签名 sign
        let sign = md5(this.urlData.id + loginName + 'e773145823ef68dc');
        // 请求ajax 获取新的登录信息 
        // 必须注册到环信 传入登录名，签名和 urlData.id
        this._getRegisterAjax(loginName, sign).done((res) => {
            // 结果处理
            if (res.is_success) {
                baseData = {
                    client_znkf_login_sign: sign,
                };
                baseData[this.urlData.id + '_client_znkf_login_sign'] = loginName;
                store.set('loginBase', baseData);
                resolve(baseData);
            } else {
                reject('注册用户接口返回数据false,请刷新页面后重试');
            }
        }).fail((res) => {
            reject('[error] 获取用户注册接口错误');
        });
    },
    /**
     * getJson 通用的获取ajax方法  暂时使用回调函数的形式
     * @param { Object } config  传入的配置链接等
     * @param { Object } extend  是否扩展
     * @return { Object } 返回ajax 对象  .done .fail 
     */
    getJson(config, extend = 'true') {
        let baseConfig = {
            type: 'post', // 默认post，
            dataType: 'json', // 默认json ，开启cashe true
        };
        baseConfig = Object.assign(baseConfig, config);
        baseConfig.url = this.envConfig.urlPath + baseConfig.url;
        let _loginData = store.get('loginData');
        // 如果已经登录，需要加入hash验证
        if (this.loginStatus && extend) {
            Object.assign(baseConfig || {}, {
                beforeSend: (request)=>{
                    request.setRequestHeader('tenantid', _loginData.client_tenantid);
                    request.setRequestHeader('authtoken', _loginData.client_authtoken);
                    request.setRequestHeader('uid', _loginData.client_id);
                    request.setRequestHeader('sign', _loginData.client_sign);
                },
            });
        }
        return $.ajax(baseConfig);
    },
};
