'use strict';
import hxApi from '../hx-api';
import webIm from '../hx-api/webim';
import dom from '../dom.js';
import robot from '../robot';
import ajax from '../hx-api/ajax.js';
export default {
    /**
     * callRobot
     * 初始化客服流程
     * @param {boolean} showMsg 是否显示额为传递的信息
     * @param {promise} outresolve
     * @param {String} genre 类型区分 labour--人工  auto--自动
     */
    callCustomer(showMsg = true, outresolve, genre = 'labour') {
        new Promise((resolve, reject) => {
            dom.log('连接客服列表....');
            // 获取机器人列表
            this.callCustomerAjax().done((res) => {
             resolve(res);
            });
        }).then((res) => {
            dom.log('创建客服连接....');

            if (res.is_success) {
            let customerData = res.data;
            let _status =customerData.service_status;
            // 客服不在线
            if (_status == 'noOnlineService' || _status == 'noFreeService' ) {
                // 提示信息
                if (genre == 'labour') {
                    dom.smallTip('很抱歉，暂时无可接待客服');
                }
                // 不在线时试转机器人
                if (!webIm.imServer.id || webIm.imServer.type === 'customer') {
                    robot.callRobot();
                }
                // 如果不是转人工,显示转人工按钮
                if (webIm.sessionServer.switch_to_man_set === 1) {
                    dom.showCustomerBtn();
                }
                // promise resolve 处理外部等待
                if (outresolve) {
                    outresolve(showMsg);
                }
            } else {
                // 设置当前的服务对象为客服信息
                this._setImServerToCustomer(customerData);
                // 设置现在的头部信息
                dom.setMobileTitle(customerData.real_name);
                // 异步调用promise对象,获取服务信息
                new Promise((resolve, reject)=>{
                    // genre是否需要添加no_tip
                    this.getCustomerAjax(customerData, genre).done((res)=>{
                        resolve(res);
                    });
                }).then((res)=>{
                        if (genre == 'labour') {
                            dom.smallTip('现在是客服 '+customerData.real_name+' 为您服务');
                        }
                        Object.assign(webIm.imServer, {
                            chat_identity: res.data.chat_identity,
                        });
                        showMsg = false;
                        if (outresolve) {
                            outresolve(showMsg);
                        }
                        dom.log('连接客服成功');
                        dom.userLoad(false); // 关闭连接loading
                        // dom.showCustomerBtn(); // 关闭转人工按钮
                });
            }
        } else {
            dom.smallTip('很抱歉，暂时无法转接人工服务');
        }
        });
    },
    /**
     * callCustomerAjax
     * 检测客服信息接口
     * @return {Object} ajax 数据对象
     */
    callCustomerAjax() {
        return ajax.getJson({
            url: '/intelligent/api/chat/expert/free/',
            type: 'get',
            data: {
                user_id: hxApi.loginInfo.client_id,
            },
        });
    },
    /**
     * getCustomerAjax
     * 获取在线客服接口
     * @param {Object} customerData 
     * @param {String} genre auto需要添加no_tip
     * @return {Object} ajax 数据对象
     */
    getCustomerAjax(customerData, genre) {
        let ajaxData = {
            user_id: hxApi.loginInfo.client_id,
            client_hx_user_code: hxApi.loginInfo.client_hx_user_code,
            server_user_id: customerData.server_user_id,
            server_hx_user_code: customerData.hx_user_code,
            client_duty: '',
            client_company: '',
            chat_identity: webIm.imServer.chat_identity,
            is_auto_connect_human: webIm.imServer.chat_identity ? 1 : 0,
            login_platform: 'web',
        };
        if (genre == 'auto') {
            Object.assign(ajaxData, {
                no_tip: 1,
            });
        }
        return ajax.getJson({
            url: '/intelligent/api/chat/expert/new/',
            data: JSON.stringify(ajaxData),
        });
    },
    /**
     * _setImServerToCustomer
     * 设置webim 服务对象为客服状态
     * @param {Object} customerData 
     */
    _setImServerToCustomer(customerData) {
        Object.assign(webIm.imServer, {
            id: customerData.server_user_id,
            name: customerData.real_name,
            hx: customerData.hx_user_code,
            type: 'customer',
            image: 'images/ico-robot-hd.png',
        });
    },
};

