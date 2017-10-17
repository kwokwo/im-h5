'use strict';
import ajax from './ajax.js';
import env from '../../../config/env.js';
let index = {
    urlData: {}, // 地址数据对象
    loginInfo: {}, // 登录成功之后得到的登录信息
    /**
     * initUserAndIM 初始化智能客服信息
     * @return {Boolean} 可能参数错误
     */
    _initUserAndIM: () => {
        // 存入并存入url对象（地址所带url参数对象）
        return new Promise((resolve, reject) => {
            if (!index.urlData.id) {
                reject('链接参数有误，请检查链接后重试');
            } else {
                resolve();
            }
        }).then(() => {
            // 判断用户，并返回用户信息
            return index._getloginInfo();
        }).then((loginInfo) => {
            if (loginInfo) {
                ajax.loginStatus = true;
                // 判断是否初始化完成
                index.loginInfo = loginInfo;
            } else {
                env.DOM.log('初始化用户信息失败!');
            }
        }).catch((error) => {
            env.DOM.log(error, 'error');
        });
    },
    /**
     * _initUserlogin  初始化user登录，判断是否存在store
     * @return {Object} promise
     */
    _initUserlogin: () => {
        return new Promise((resolve, reject) => {
            ajax._getLoginBaseData(resolve, reject);
        });
    },
    /**
     * _getloginInfo  获取登录的用户信息,并返回用户信息
     * 登录则获取localstrore信息，否则以游客信息登录
     * @param {Object} resolve 导入数据
     * @return {Object} loginInfo 返回loginInfo
     */
    _getloginInfo() {
        // 如果是用户登录，则登录loginMember 否则是游客登录
        return this.urlData.account && this.urlData.pwd ?
            this._getLoginMember() : this._getLoginVisitor();
    },
    /**
     * getLogin_member 
     * 会员登录
     * @return  { Object } loginData 用户登录信息
     */
    _getLoginMember: () => {
            let _ajaxLoginData;
            return new Promise((resolve, reject) => {
                ajax._getLoginMemberAjax().done((data) => {
                    // this  指向当前对象
                    if (data.msg_text == 'success') {
                       // 成功之后设置本地数据存储
                       _ajaxLoginData = ajax.formatLoginData(data.data);
                       // -------------- 设置robot设置view信息 ------------
                       index._setRobotSetting(_ajaxLoginData);
                       // -------------- 设置page配置信息 ------------
                       index._setPageSetting(_ajaxLoginData);
                       // ----------设置缓存-----------
                       ajax._setLoginStor(_ajaxLoginData);
                       resolve(_ajaxLoginData);
                    } else {
                        reject('[error] 登录会员接口数据返回失败');
                    }
                }).fail((res) => {
                    reject('[error] 登录会员接口数据请求失败');
                });
            });
    },
    /**
     * getLogin_visitor
     *  游客登录
     * @return {Object} promise
     */
    _getLoginVisitor: () => {
            let _ajaxLoginData;
            return new Promise((resolve, reject) => {
                ajax._getLoginVisitorAjax().done((data) => {
                    if (data.is_success) {
                        // 成功之后设置本地数据存储
                        _ajaxLoginData = ajax.formatLoginData(data.data);
                        // -------------- 设置robot设置view信息 ------------
                        index._setRobotSetting(_ajaxLoginData);
                        // -------------- 设置page配置信息 ------------
                        index._setPageSetting(_ajaxLoginData);
                        // ----------设置缓存-----------
                        ajax._setLoginStor(_ajaxLoginData);
                        resolve(_ajaxLoginData);
                    } else {
                        reject('[error] 登录游客接口数据返回失败');
                    }
                }).fail((res) => {
                    reject('[error] 游客会员接口数据请求失败');
                });
            });
    },
    /**
     * _setRobotSetting 
     * 设置机器人信息 设置机器人title
     * @param {Object} _ajaxLoginData 
     */
    _setRobotSetting(_ajaxLoginData) {
        ajax._getRobotSettingAjax(_ajaxLoginData).done((res) => {
            let robotData = res.data;
            // 判断是否有值
            if (robotData.length > 0) {
                // 设置title名称
                env.DOM.setMobileTitle(robotData[0].robot_name);
            }
        }).fail((res) => {
            env.DOM.log('[robot] 获取robot设置错误', 'error');
        });
    },
    /**
     * _setPageSetting 
     * 设置pageSetting 
     * @param { Object } _ajaxLoginData  登录成功返回对象
     */
    _setPageSetting(_ajaxLoginData) {
        ajax._setPageSettingAjax(_ajaxLoginData).done((res) => {
            if (res.is_success) {
                if (res.data) {
                    let _data = res.data;
                    env.DOM.setMobileTitleBgColor(_data.color);
                }
            }
        });
    },
    /**
     * 公共获取get 链接信息借口
     * @return {Object | paraObj}   返回链接数据对象
     */
    getBaseInfoFn() {
        let paraString = location.href.substring(
            location.href.indexOf('?') + 1, location.href.length
        ).split('&');
        let paraObj = {};
        for (let i = 0; i < paraString.length; i++) {
            let j = paraString[i];
            let index = j.substring(0, j.indexOf('=')).toLowerCase();
            paraObj[index] = j.substring(j.indexOf('=') + 1, j.length);
        }
        return paraObj;
    },
};
export default index;
