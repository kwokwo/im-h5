'use strict';
import env from '../../../config/env.js';
import dom from '../dom.js';
import ajax from './ajax.js';
import hxApi from './index.js';
import robot from '../robot';
import customer from '../customer-service';
import store from 'store';
import chatWin from '../chat-win/index.js';
import loadImage from 'image-promise';
import debounce from 'debounce';
// import unescape from 'lodash.unescape';
let envConfig = env[env.base];
let isJSON = require('is-json');
window.isJSON = isJSON;
let im = {
    msgLastObj: {
        last_id: 0, // 最后消息id 防止环信重复返回数据
    },
    // 切换服务对象 type 默认值 现阶段连接的是机器人还是客服对象
    imServer: {
        type: 'robot', // 服务类型 robot 机器人   customer 客服
        id: '', // id
        name: 'robot_name', // 名称
        hx: 'hx_user_code', // 环信id,
        chat_identity: '',
        image: 'images/ico-default-robot.png',
        switch_to_man_set: 0, // 是否可以有 转人工操作
    },
    startTime: 0,
    sessionServer: {},
    closeType: false,
    /**
     * 获取自检服务
     * @return {Object} promise
     */
    initSessionService() {
        return new Promise((resolve, reject) => {
            // 查询是否已介入客服
            this._getInitSessionAjax().done((res) => {
                this.sessionServer = res.data;
                if (res.is_success &&
                    (this.sessionServer.server_hx_user_code != 'intell_bot_1'
                    && this.sessionServer.server_hx_user_code)) { // 已经接入了客服
                    Object.assign(im.imServer, {
                        id: this.sessionServer.server_user_id,
                        name: this.sessionServer.nick_name,
                        hx: this.sessionServer.server_hx_user_code,
                        type: 'customer',
                        image: 'images/ico-robot-hd.png',
                    });
                    im.addHistoryDom(()=>{
                        // 默认加载的时候,跳转到底部
                       dom.scrollBottom();
                       resolve();
                   });
                } else {
                    // 没有接入的时候初始化接入接口
                    this._getTenantAjax().done((res) => {
                        // 创建成功
                        this.sessionServer = res.data;
                        if (res.is_success) {
                            // 判断是否是机器人
                            if (this.sessionServer.priority_reception_set === 0) {
                                // 连接机器人
                                robot.callRobot();
                                // 是否有转人工的按钮
                                if (this.sessionServer.switch_to_man_set === 1) {
                                    // 展示转人工的按钮
                                    dom.showCustomerBtn();
                                }
                            } else {
                                // 连接客服
                                customer.callCustomer();
                            }
                            resolve();
                        }
                    }).fail((error) => {
                        reject('创建新的tenant信息初始化失败');
                    });
                }
            }).fail((error) => {
                reject('[webim->_getInitSessionAjax]查询是否接入客服信息失败');
            });
        });
    },
    /**
     * _getInitSessionAjax
     * 查询是否接入客服信息
     * @return {Object} ajax
     */
    _getInitSessionAjax() {
        // 查询是否已介入客服
        return ajax.getJson({
            url: '/intelligent/api/chat/check/session/',
            type: 'get',
            data: {
                client_user_id: hxApi.loginInfo.client_id,
            },
        });
    },
    _getTenantAjax() {
        // 创建新的tenant信息
        return ajax.getJson({
            url: '/intelligent/api/tenant/get_tenant_info/',
        });
    },
    /**
     * initImService
     * 初始化环信
     * @param {Object} loginInfo 传入用户信息
     * @return {Object} primose
     */
    initImService() {
        return new Promise((resolve, reject) => {
            // 连接环信
            im.conn = new WebIM.connection({
                apiUrl: WebIM.config.apiURL,
                https: WebIM.config.https,
                url: WebIM.config.xmppURL,
                isAutoLogin: WebIM.config.isAutoLogin,
                isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
            });
            im.options = {
                apiUrl: WebIM.config.apiURL,
                user: hxApi.loginInfo.client_hx_user_code,
                pwd: 'cqzhstim',
                appKey: envConfig.appKey,
            };
            im._emoji();
            im._open();
            im._listen(resolve);
        });
    },
    /**
     * reconnect
     * 重新获取接口
     */
    reconnect() {
        dom.userLoad(true);
        dom.scrollBottom();
        chatWin.initBaseService().then(()=>{
            return this.initImService();
        }).then(()=>{
            return im.initSessionService();
        }).then(()=>{
            dom.userLoad(false);
            dom.log('重新连接成功');
        }).catch((res)=>{
            dom.log(res, 'error');
        });
    },
    /**
     * _setUserText
     * 发送消息时的模板
     * @param {Object} userMsgData 
     * @return {String} dot 模板返回的html
     */
    _setUserText(userMsgData) {
        let tplData = {
            id: userMsgData.id,
            dislike: 0,
            abstract: userMsgData.msg,
        };
        let tpl = require('../template/usertext.tpl');
        return tpl(tplData);
    },
    /**
     * 判断是否是正常的关闭链接 true 允许关闭 false 不是正常的关闭连接
     * @param {boolean} type 
     */
    setCloseType(type) {
        this.closeType = type;
    },
    /**
     * _open
     * 私有方法，启动环信
     */
    _open() {
        im.startTime = Date.now();
        this.conn.open(this.options);
    },
    /**
     * _listen
     *  私有方法，添加环信监听事件
     * @param {Function} resolve
     */
    _listen(resolve) {
        this.conn.listen({
            onOpened() {
                resolve();
            },
            onError( message ) {
                // dom.log(message);
                // // dom.smallTip(message.data, false);
                // // im.reconnect();
                // im._open();
            },
            onOffline() {
                im._open();
            },
            // 连接关闭回调
            onClosed: debounce(() => {
                if (!im.closeType) {
                    // dom.smallTip('连接异常关闭,请重新连接', false);
                    dom._open();
                } else {
                    dom.log('正常关闭环信');
                    im.closeType = false;
                }
            }, 300),
            onTextMessage(message) {
                /**
                 * ---根据状态判断是否掉线等---
                 */
                // 判断是否需要显示历史纪录
                if (message.ext.cmd_type == 'show_history_detail') {
                    im.addHistoryDom(()=>{
                         // 默认加载的时候,跳转到底部

                        dom.userLoad(false);
                        dom.scrollBottom();
                    });
                    return;
                }
                 // 如果是已经结束会话 disconnect_by_server
                if (message.ext.cmd_type === 'disconnect_by_server') {
                    let _now = Date.now();
                    let _maxtime = im.startTime + 3000;
                    if (_maxtime > _now) return;
                    // 操作会话已经结束
                    dom.setToReconnect();
                    // 显示会话结束
                    dom.smallTip(message.ext.abstract);
                    return;
                }
                // 断言判断是否是重复获取
                if (im._isNotRepeat(message.id)) {
                    if (message.from === 'intell_bot_1') { // 如果是机器人回复
                        im.receiveRobotMsg(message);
                    } else { // 如果是客服回复
                        if (!message.ext.content_type) {
                            message.ext.content_type= 'text';
                        }
                        im.receiveCustomerMsg(message);
                    }
                };
            },

        });
    },
      /**
     * receiveRobotMsg
     * 获取环信的数据
     * @param {Object} message 
     */
    receiveRobotMsg(message) {
        new Promise((resolve, reject) => {
            let _html = this._switchMsgType(message);
            resolve(_html);
        }).then((_html) => {
            // 环信消息显示成功
            // todo 操作DOM对象 msgData 数据模板对象   
            // 有其他服务的时候返回 notHtml
            // 增加promise 方法,判断是否存在图片 进行lazyload
            if (_html === '') {
                dom.log('其它操作');
                return;
            }
            im.hasImage(_html).then((obj)=>{
                 // 增加一条新的信息到store存储
                dom.appendHtml(_html);
                dom.scrollBottom();
                im._setHistorys(_html);
            });
        });
    },
    /**
     * hasImage
     * 判断domhtml中有没有图片
     * @param {html} html 
     * @return {Object} Promise
     */
    hasImage(html) {
        let $this = $(html);
        let img = $this.find('img');
        if (img.length > 0) {
            return loadImage(img.attr('src'));
        } else {
            return Promise.resolve(html);
        }
    },
    /**
     * receiveCustomerMsg
     * 获取客服发送的消息
     * @param {Object} message 
     */
    receiveCustomerMsg(message) {
        new Promise((resolve, reject) => {
            let _html = this._switchMsgType(message);
            resolve(_html);
        }).then((_html) => {
            // 环信消息显示成功
            // todo 操作DOM对象 msgData 数据模板对象   
            // 有其他服务的时候返回 notHtml
            // 增加promise 方法,判断是否存在图片 进行lazyload
            if (_html === '' || !_html) {
                dom.log('其它操作');
                return;
            }
            im.hasImage(_html).then((obj)=>{
                 // 增加一条新的信息到store存储
                dom.appendHtml(_html);
                dom.scrollBottom();
                im._setHistorys(_html);
            });
        });
    },
    /**
     * getCustomerHtml
     * 设置客服模板信息
     * @param {Object} message 
     * @return {String} html 返回模板字符串
     */
    getCustomerHtml(message) {
        let tplData = {
            abstract: message.data,
        };
        return render.customertext(tplData);
    },
    /**
     * _isNotRepeat
     * 断言函数-判断是否是环信重复返回的数据
     * @param {Number} msgId 
     * @return {Boolean} true 不是重复获取 false重复获取
     */
    _isNotRepeat(msgId) {
        if (this.msgLastObj.last_id && this.msgLastObj.last_id === msgId) {
            return false;
        } else {
            this.msgLastObj.last_id = msgId;
            return true;
        }
    },
    /**
     * _switchMsgType
     * 判断数据收发信息
     * @param { Object } serverData 数据对象 包含全部
     * @param { String } type new 添加到新的历史纪录(默认) histroy 不添加到新的历史纪录
     * @return { html } html 字符串
     */
    _switchMsgType: (serverData) => {
        let serverExt = serverData.ext;
        let _html;
        switch (serverExt.content_type) {
            case 'position':
                _html = im._setPosition(serverData, serverExt);
                break;
            case 'richtext':
                _html = im._setRichtext(serverData, serverExt);
                break;
            case 'text':
                _html = im._setRobotText(serverData, serverExt);
                break; // 正常的数据展示
                // 其它
            case 'image':
                _html = im._setImage(serverData, serverExt);
                break;
            case 'video':
                _html = im._setVideo(serverData, serverExt);
                break;
            case 'choices':
                _html = im._setChoices(serverData, serverExt);
                break;
            case 'recommand_que':
                _html = im._setRecommandQue(serverData, serverExt);
                break;
            default:
                _html = im._setUnknow(serverData, serverExt);
                break;
        };
        return _html;
    },
    /**
     * _setPosition
     * 设置位置模板数据对象
     * @param {Object} serverData 
     * @param {Object} serverExt 
     * @return {Html} 返回html
     */
    _setPosition(serverData, serverExt) {
        let dataJson = JSON.parse(serverData.data); // 包含abstract对象
        let abstract = JSON.parse(dataJson.abstract); // position  数据返回的abstract 为对象
        let tplData = {
            id: serverExt.ext_old_msg_id,
            title: abstract.title,
            dislike: serverData.dislike,
            cover_img: abstract.cover_img,
            answer: abstract.answer,
        };
        let tpl = require('../template/position.tpl');
        return tpl(tplData);
    },
    /**
     * _setRichtext
     * 接收到的分类为富文本的消息
     * @param {Object} serverData 全部顶级数据
     * @param {Object} serverExt 顶级数据中的扩展数据
     * @return {Object} html-string 返回dot数据html
     */
    _setRichtext(serverData, serverExt) {
        let dataJson = JSON.parse(serverData.data); // 包含abstract对象
        let abstract = JSON.parse(dataJson.abstract); // position  数据返回的abstract 为对象
        if (dataJson.sub_type == 'image') {
            let tplData = {
                id: serverExt.ext_old_msg_id,
                dislike: serverData.dislike || 0,
                cover_img: abstract.cover_img,
                url: abstract.url,
            };
            let tpl = require('../template/richtext/image.tpl');
            return tpl(tplData);
        } else if ( dataJson.sub_type == 'video') {
            let tplData = {
                id: serverExt.ext_old_msg_id,
                title: abstract.title,
                dislike: serverData.dislike,
                cover_img: abstract.cover_img,
                answer: abstract.answer,
                url: abstract.url,
                author: abstract.author,
            };
            let tpl = require('../template/richtext/video.tpl');
            return tpl(tplData);
        } else if ( dataJson.sub_type == 'audio') {
            let tplData = {
                id: serverExt.ext_old_msg_id,
                title: abstract.title,
                dislike: serverData.dislike,
                cover_img: abstract.cover_img,
                answer: abstract.answer,
                url: abstract.url,
                author: abstract.author,
            };
            let tpl = require('../template/richtext/audio.tpl');
            return tpl(tplData);
        } else if ( dataJson.sub_type == 'weather') {
            let tplData = {
                id: serverExt.ext_old_msg_id,
                title: abstract.title,
                dislike: serverData.dislike,
                img: abstract.img,
                curw: abstract.curw,
                city: abstract.city,
                date: abstract.date,
                temp: abstract.temp,
                temp_min: abstract.temp_min,
                temp_max: abstract.temp_max,
                weather: abstract.weather,
                air: abstract.air,
            };
            let tpl = require('../template/richtext/weather.tpl');
            return tpl(tplData);
        } else if (dataJson.sub_type == 'richtext') {
            let tplData = {
                id: serverExt.ext_old_msg_id,
                title: abstract.title,
                dislike: serverData.dislike,
                cover_img: abstract.cover_img,
                answer: abstract.answer,
                url: abstract.url,
                summary: abstract.summary,
            };
            let tpl = require('../template/richtext/text.tpl');
            return tpl(tplData);
        }
    },
    /**
     * _setRobotText
     * 接收到的分类为文本消息
     * @param {Object} serverData 
     * @param {Object} serverExt 
     * @return {Object} html-string 返回dot数据html
     */
    _setRobotText(serverData, serverExt) {
        let abstract;
        // 正常接受消息时的模板
        abstract = this._abstract(serverData);
        let tplData = {
            id: serverExt.ext_old_msg_id,
            dislike: serverData.dislike || 0,
            abstract: abstract.type == 'json' ? abstract.data.answer : abstract.data,
        };
        let tpl = require('../template/robottext.tpl');
        return tpl(tplData);
    },
    /**
     * _abstract
     * 获取abstract 数据
     * @param {Object} serverData 
     * @return { Object | string } string
     */
    _abstract(serverData) {
        // 如果是手动设置的data,那么直接返回数据
        if (typeof serverData === 'string') {
            return {
                type: 'string',
                data: serverData,
            };
        }
        // 如果是接入客服的欢迎语,需要判断另一层逻辑
        if (!isJSON(serverData.data)) {
            if (typeof serverData.data === 'string') {
                return {
                    type: 'string',
                    data: serverData.data,
                };
            }
        }
        // 数据转换
        let data = JSON.parse(serverData.data);
        let result, type;
        if (parseInt(data.abstract)) {
            // 可能是数字的情况
            result = data.abstract;
            type = 'string';
        } else {
            try {
                result = JSON.parse(data.abstract);
                type = 'json';
            } catch (error) {
                result = data.abstract;
                type = 'string';
            }
        }
        return {
            type: type,
            data: result,
        };
    },
    /**
     * 跳转到图片模板
     * @param {Object} serverData 
     * @param {Object} serverExt 
     * @return {HTML} dot模板
     */
    _setImage(serverData, serverExt) {
        let dataJson = JSON.parse(serverData.data); // 包含abstract对象
        let abstract = JSON.parse(dataJson.abstract); // position  数据返回的abstract 为对象
        let tplData = {
            id: serverExt.ext_old_msg_id,
            disable: serverData.dislike,
            answer: abstract.answer,
        };
        let tpl = require('../template/image.tpl');
        return tpl(tplData);
    },
    /**
     * 跳转到视频模板
     * @param {Object} serverData 
     * @param {Object} serverExt 
     * @return {html}
     */
    _setVideo(serverData, serverExt) {
        let dataJson = JSON.parse(serverData.data), abstract; // 包含abstract对象
        if (dataJson.abstract) { // 客服发送的视频,没有abstract
            abstract = JSON.parse(dataJson.abstract);
        } else {
             abstract = dataJson;
        }
        let src = $(im.decaodeAntiSqlXssValid(abstract.answer));
        src.height('100%');
        src.width('100%');
        let tplData = {
            id: serverExt.ext_old_msg_id,
            disable: serverData.dislike,
            abstract: src[0].outerHTML,
        };
        // 解析回来
        let tpl = require('../template/video.tpl');
        return tpl(tplData);
    },
    /**
     * decaodeAntiSqlXssValid
     * 通过原来的方法去解析视频路径(bug #039 -> #39)
     * @param {String} str 
     * @return {String} 返回视频路径
     */
    decaodeAntiSqlXssValid(str) {
        try {
            return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, '\'').replace(/&quot;/g, '"');
        } catch (e) {
            return str;
        }
    },
    /**
     * _setRecommandQue
     * 跳转到欢迎模板
     * @param {Object} serverData 
     * @param {Object} serverExt 
     * @return {HTML} HTML
     */
    _setRecommandQue(serverData, serverExt) {
        let dataJson = JSON.parse(serverData.data); // 包含abstract对象
        let abstract = dataJson.abstract; // position  数据返回的abstract 为对象
        let tplData = {
            id: serverData.id,
            disable: serverData.dislike || 0,
            abstract: abstract.answer,
        };
        let tpl = require('../template/recommanque.tpl');
        return tpl(tplData);
    },
    /**
     * _setChoices
     * 跳转到多选模板
     * @param {Object} serverData 
     * @param {Object} serverExt 
     * @return {HTML} html
     */
    _setChoices(serverData, serverExt) {
        let dataJson = JSON.parse(serverData.data); // 包含abstract对象
        let abstract = dataJson.content; // position  数据返回的abstract 为对象
        let tplData = {
            id: serverExt.ext_old_msg_id,
            disable: serverData.dislike,
            abstract: abstract,
        };
        let tpl = require('../template/choices.tpl');
        return tpl(tplData);
    },
    /**
     * _setUnknow
     * 公共跳转,当不知道是什么分类的时候,就跳转到unknow
     * @param {*} serverData 
     * @param {*} serverExt 
     * @return {HTML} html
     */
    _setUnknow(serverData, serverExt) {
        if (serverExt.cmd_type == 'disconnect_by_server' ) {
            return dom.getSmalltpl(serverExt.abstract);
        }
        // 欢迎模板提示tip
        if (serverExt.cmd_type == 'robot_welcome_tip') {
            dom.userLoad(false);
            let abstract = serverData.data; // position  数据返回的abstract 为字符串
            let tplData = {
                id: serverExt.ext_old_msg_id,
                dislike: serverData || 0,
                abstract: abstract,
            };
            let tpl = require('../template/robottext.tpl');
            return tpl(tplData);
        }
        // 普通的不明信息流程
        if (serverExt.content_type == 'unknow') {
            const autoCustomer = async ()=>{
                let showType = true, tplData, tpl;
                return await new Promise((resolve, reject)=>{
                    // 第一个promise 判断是否需要自动转人工
                    // 如果需要,判断中间逻辑是否需弹出消息
                    if (im.sessionServer.switch_to_man_set == 0 && im.imServer.type == 'robot') {
                        customer.callCustomer(showType, resolve, 'auto');
                    } else { // 没有自动转人工
                        // 特定情况下的必须转人工
                        if (serverExt.ext_unknown_to_human && serverExt.ext_unknown_to_human > 0) {
                            customer.callCustomer(showType, resolve, 'auto');
                        } else {
                            resolve(showType);
                        }
                    }
                }).then((type)=>{
                    // 获取返回的状态来获取信息 type - true 显示 false 不显示
                    if (type) {
                        let abstract = serverData.data; // position  数据返回的abstract 为字符串
                        tplData = {
                            id: serverExt.ext_old_msg_id,
                            dislike: serverData || 0,
                            abstract: abstract,
                        };
                        tpl = require('../template/robottext.tpl');
                        return tpl(tplData);
                    } else {
                        return '';
                    }
                });
            };
            return autoCustomer();
        }
    },
      /**
     * sendMsg
     * 发动消息时触发的方法
     * @param {Object} msgData 
     *  @param {Number} index 
     */
    sendMsg(msgData, index) {
        let imData = msgData.data;
        // 拼凑消息本身
        if (!imData) return;
        let ext = {
            ext_from_user_id: hxApi.loginInfo.client_id,
            ext_to_user_id: this.imServer.id,
            ext_from_user_name: hxApi.loginInfo.client_real_name || '',
            ext_to_user_name: this.imServer.name || '',
            ext_conv_id: hxApi.loginInfo.client_id + '_' + this.imServer.id,
            ext_device_type: '4',
            ext_from_user_type: 1,
            ext_browser_url: window.location.href,
            ext_client_os: 'Windows',
            ext_client_browser: dom.getBrowserInfo(),
            ext_audio_text: '',
            ext_client_company: '',
            ext_client_duty: '',
            ext_tenant_id: hxApi.loginInfo.client_tenantid,
            ext_wx_openid: '',
            ext_chat_identity: this.imServer.chat_identity,
        };
        // 专门为了choice添加的字段 index - choice时的数字编号
        if (index) {
             Object.assign(ext, {
                ext_rapid_session_pos: index,
             });
        }
        let id = this.conn.getUniqueId(); // 生成本地消息id
        let msg = new WebIM.message('txt', id); // 创建文本消息
        msg.set({
            msg: imData,
            to: this.imServer.hx,
            ext: ext,
        });
        let _webim = msg.body;
         let _html = this._setUserText(_webim);
        dom.appendHtml(_html);
        dom.scrollBottom();
        // primose 判断是否发送成功
        new Promise((resolve, reject) => {
            // 消息发送成功回调
            _webim.success = function(id, serverMsgId) {
                resolve();
            };
            _webim.fail = function(e) {
                dom.log(e);
                reject(e);
            };
            this.conn.send(_webim);
        }).then(() => {
            // 发送成功之后的操作
            // let _html = this._setUserText(_webim);
            // dom.appendHtml(_html);
            this._setHistorys(_html);
            // dom.scrollBottom();
        }).catch((e) => {
            // 失败时提示
            dom.log('[sendMsg]' + e, 'error');
        });
    },
    /**
     * _setHistorys
     * 私有方法, 设置历史纪录 
     * @param {Object} _html 页面数据 
     */
    _setHistorys(_html) {
        let _historys = store.get(hxApi.loginInfo.client_id + '_historys');
        let historys = _historys ? _historys : [];
        historys.unshift(_html);
        store.set(hxApi.loginInfo.client_id + '_historys', historys);
    },
    /**
     * _getHistorys
     * 获取历史信息 并操作相关DOM 
     * todo 本地存储在不同的域名下带来的历史纪录篡改
     * @return {String} html
     */
    getHistorys() {
        let _historys, _html = '';
        // 只获取前15条数据
        if (this.oldHistorys) {
            _historys = this.oldHistorys;
        } else {
            this.oldHistorys = _historys = store.get(hxApi.loginInfo.client_id + '_historys') || [];
        }
        let _historysArray = _historys.splice(0, 15);
        if (_historys.length <= 0) {
            // 已经没有历史消息 屏蔽掉更多历史按钮
            dom.disableMoreHistory(true);
        } else {
            dom.disableMoreHistory(false);
        }
        for (let item of _historysArray) {
                _html = item + _html;
        }
        return _html;
    },
    /**
     * addHistoryDom
     * 获取更多历史纪录方法,集成了primose图片判断 
     * @param {*} callback  添加了一个回掉方法,处理新增之后的操作
     */
    addHistoryDom(callback) {
        let _html = this.getHistorys();
         // 懒加载图片
         let _img = $(_html).find('img');
         if (_img.length == 0) {
             let $this = dom.prependHtml(_html);
             if (callback) {
                 callback($this);
            }
            return;
         }
         let images =[];
        for (let item of _img) {
            images.push($(item).attr('src'));
         };

         loadImage(images).then(()=>{
            let $this = dom.prependHtml(_html);
            if (callback) {
                callback($this);
           }
         }).catch((e)=>{
            dom.log(e);
            dom.log('[addHistoryDom]promise历史纪录失败', 'error');
         });
    },
    /**
     * setHistoryById
     * 根据id设置历史纪录数据
     * @param {*} id 标识
     * @param {*} data  扩展数据
     */
    setHistoryById(id, data) {
        let _his = store.get(hxApi.loginInfo.client_id + '_historys');
        for (let item of _his) {
            if (item.id == id) {
                Object.assign(item, data);
            }
        }
        store.set(hxApi.loginInfo.client_id + '_historys', _his);
    },
    /**
     * emoji 
     * 表情使用，暂时无使用
     */
    _emoji() {
        WebIM.Emoji = {
            path: 'images/faces/', // 表情包路径
            map: {
                '[):]': 'ee_1.png',
                '[:D]': 'ee_2.png',
                '[;)]': 'ee_3.png',
                '[:-o]': 'ee_4.png',
                '[:p]': 'ee_5.png',
            },
        };
    },
};

export default im;
