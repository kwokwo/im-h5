'use strict';
import hxApi from '../hx-api';
import webIm from '../hx-api/webim.js';
import dom from '../dom.js';
import ajax from '../hx-api/ajax.js';
export default {
    /**
     * callRobot
     * 初始化机器人流程
     */
    callRobot() {
        new Promise((resolve, reject) => {
            // 获取机器人列表
            this.callRobotAjax().done((res) => {
                if (res.is_success) {
                    let robot = res.data[0];
                    dom.log('连接机器人列表....');
                    resolve(robot);
                }
            });
        }).then((robotData) => {
            dom.log('创建机器人....');
            new Promise((resolve) => {
                // 创建机器人
                this.callRobotNewAjax(robotData).done((res) => {
                    // 设置webim请求时的服务参数 type-> robot | user
                    this._setImServerToRobot(robotData);
                    resolve();
                }).fail((res)=>{
                    dom.log(res);
                });
            }).then(()=>{
                dom.log('连接机器人成功');
            });
        });
    },
    /**
     * _setImServerToRobot
     * 设置iM请求为robot请求
     * @param {Object} robotData 
     */
    _setImServerToRobot(robotData) {
        Object.assign(webIm.imServer, {
                id: robotData.id,
                name: robotData.robot_name,
                hx: robotData.hx_user_code,
                type: 'robot',
                chat_identity: robotData.chat_identity,
                image: robotData.header_path || 'images/ico-default-robot.png',
            });
    },
    /**
     * callRobotNewAjax
     * 新建机器人服务
     * @param {Object} robotData 
     * @return {Object} 返回ajax对象
     */
    callRobotNewAjax(robotData) {
       return ajax.getJson({
            url: '/intelligent/api/robot/new/',
            type: 'post',
            data: JSON.stringify({
                user_id: hxApi.loginInfo.client_id,
                client_hx_user_code: hxApi.loginInfo.client_hx_user_code,
                robot_hx_user_code: robotData.hx_user_code,
            }),
        });
    },
    /**
     * callRobotAjax
     * 获取机器人列表
     * @return {Object} 返回ajax对象
     */
    callRobotAjax() {
      return ajax.getJson({
            url: '/intelligent/api/robot/list/',
            type: 'get',
            data: {
                user_id: hxApi.loginInfo.client_id,
            },
        });
    },
};
