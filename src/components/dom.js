'use strict';
import env from '../../config/env.js';
import ajax from './hx-api/ajax.js';
import hxApi from './hx-api';
import webIm from './hx-api/webim.js';
import customer from './customer-service';
import Viewer from './viewer/viewer.js';
import './viewer/viewer.min.css';
import debounce from 'debounce';
import MobileDetect from 'mobile-detect';
const md = new MobileDetect(window.navigator.userAgent);
// import throttle from 'lodash.throttle';
const body = $('body');
const sendBtn = body.find('#send');
const box = body.find('.main-robot-box');
const dialogList = body.find('#dialogList');
const bottombox = body.find('.up-dialog-post'); // 智能客服信息底部
const mobileTitle = body.find('.robot-mobile-title'); // 智能客服信息头部
const userLoad = body.find('.user-load'); // loading 信息
const msgListConent = body.find('#msgList'); // 消息内容
const customerBtn = body.find('.customer-btn'); // 转人工按钮
const textarea = body.find('#msg'); // 发送消息本身
const reconnectBtn = body.find('.reconnect-btn');
const completeContent = body.find('.search-tips'); // 自动补全内容框
const historyMoreBtn = body.find('.history-more'); // 历史纪录--跟多按钮
const disableBlock = body.find('.force-repaint');
let DOM = {
    _click: () => {
        // 绑定事件
        /**
         * 发送按钮
         */
        sendBtn.on('click', function(event) {
            event.stopPropagation();
            if ($.trim(textarea.val()) != '' && webIm.imServer.id != '') {
                // textMsgData为数据对象
                webIm.sendMsg({
                    data: textarea.val(),
                });
                // 清空提示
                DOM.cleanAutocomplete();
                // 清空输入框
                textarea.val('');
                // textarea.focus();
            } else {
                textarea.val('');
            }
        });
        let time;
        textarea.on('focus', () => {
            if (md.mobile()) {
                // bottombox.addClass('fix-bottom');
                time = setInterval(function() {
                    if (md.os() == 'iOS') {
                        // DOM.smallTip(document.body.scrollHeight);
                        document.body.scrollTop = document.body.scrollHeight;
                    } else {
                        DOM.scrollBottom();
                    }
                }, 300);
            };
        }).on('blur', () => {
            clearInterval(time);
            bottombox.removeClass('fix-bottom');
            document.body.scrollTop=0;
            DOM.scrollBottom();
        }).on('keyup',
            debounce(() => { // 防抖函数,防止不必要的重复操作 自动补全
                let text = $.trim(textarea.val());
                if (text) {
                    // 获取自动补全的数据
                    ajax.completeAjax(text).done((res) => {
                        let dataArray = res.data;
                        if (dataArray && dataArray.length > 0) {
                            let _html = '';
                            dataArray.forEach(function(item) {
                                _html += '<li msg="' + item + '">'
                                + item.replace(text, '<span>' + text + '</span>') + '</li>';
                            });
                            completeContent.empty().append(_html).show();
                            DOM.timeCleanAutocomplete();
                        }
                    });
                }
            }, 500)
        );
        /**
         * 回车发送按钮
         */
        $(document).on('keydown', function(event) {
            if (event.keyCode == '13') {
                event.preventDefault();
                // 回车执行查询
                sendBtn.click();
                // textarea.focus();
            }
        });
        /**
         * choices发送
         */
        body.on('click', '.s-choices', function() {
            let val = $(this).attr('word');
            webIm.sendMsg({
                data: val,
            });
        });
        /**
         * 踩/不满意
         */
        msgListConent.on('click', '.j-trample-icon', function() {
            e.stopPropagation();
            let id = $(this).attr('id');
            new Promise((resolve, reject) => {
                ajax.setDislikeAjax(id).done((res) => {
                    resolve(res.data);
                });
            }).then((data) => {
                $(this).addClass('active');
                $(this).closest('.tools-pop-up').fadeOut();
                // 更新本地缓存
                webIm.setHistoryById(id, {
                    dislick: 1,
                });
            });
        });
        /**
         * 转人工
         */
        customerBtn.on('click', function() {
            if (webIm.imServer.type == 'robot') {
                let isSuccess = true;
                 new Promise((resolve, reject)=>{
                    customer.callCustomer(isSuccess, resolve);
                 }).then((type)=>{
                    if (!type) {
                        // 通过判断是否需要显示额外信息,来判断是否隐藏 false 为不需要,标识隐藏按钮,接入成功
                        customerBtn.hide();
                    }
                 });
            } else {
                customerBtn.hide();
            }
            // 获得焦点
            textarea.blur();
        });
        /**
         * 重新连接
         */
        reconnectBtn.on('click', function() {
            webIm.setCloseType(true);
            webIm.reconnect();
            body.find('.reconnect').hide();
            DOM.setDisable(false);
        });
        /**
         * 自动补全点击发送
         */
        body.on('click', '.search-tips li', function() {
            let textMsgData = $(this).attr('msg');
            // 发送消息
            // textMsgData为数据对象
            webIm.sendMsg({
                data: textMsgData,
            });
            // 清空提示
            DOM.cleanAutocomplete();
            // 清空输入框
            textarea.val('');
        });
        //  获取更多历史纪录
        historyMoreBtn.on('click', () => {
            let oldHeight = msgListConent.height();
            // 获取更多之后操作
            webIm.addHistoryDom(($this) => {
                // 定位到上层
                dialogList.scrollTop($this.height() - oldHeight);
            });
        });
    },
    /**
     * initBaseDom
     * 初始化DOM操作
     * @param {Function} resolve
     * @param {Function} reject
     */
    initBaseDom: (resolve, reject) => {
        DOM._click();
        DOM.scrollIntoView();
        // 兼容bug 
        DOM.polyfill();
        resolve();
    },
    /**
     * 兼容bug ios等
     */
    polyfill() {
        // // 禁止头底滑动
        // $(function() {
        //     dialogList.on('touchStart', function(e) {
        //         e.stopPropagation();
        //     }, false);
        // });
    },
    scrollIntoView() {
        window.onresize = debounce(() => {
            bottombox[0].scrollIntoView(false); // 底部对齐
            body[0].scrollIntoView(false);
            let close = $('.viewer-close');
            if (close.length >0) {
                close[0].scrollIntoView(true); // 顶端对齐
            }
        }, 200);
    },
    /**
     * tip
     * 公共方法,提供公共的提示信息方法
     * @param {String} message 
     */
    tip(message) {
        console.log(message);
    },
    /**
     * log
     * 公共日志方法 
     * @param {String} message 
     * @param {String} type 默认为log方式, 可传参数 error
     */
    log(message, type = 'log') {
        if (type == 'error') {
            console.error(new Date(), message);
        } else {
            // 如果为线上环境，则屏蔽掉log输出
            if (env.base === 'formal' && !hxApi.urlData.debug) return;
            console.log(new Date(), message);
        }
    },
    /**
     * cleanAutocomplete
     * 清除自动完成选项
     */
    cleanAutocomplete() {
        completeContent.html('').hide();
    },
    /**
     * cleanAutocomplete
     * 清除自动完成选项
     */
    timeCleanAutocomplete() {
        setTimeout(() => {
            completeContent.html('').hide();
        }, 5000);
    },
    /**
     * setToReconnect
     * 设置当前状态为不可用状态,同时显示重新连接按钮
     */
    setToReconnect() {
        body.find('.reconnect').show();
        textarea.val('').blur();
        this.setDisable(true);
    },
    /**
     * setDisable
     * 设置其它不可用
     * @param {Boolean} type  true 不可用 false 可用
     */
    setDisable(type) {
        type ? disableBlock.show() : disableBlock.hide();
    },
    /**
     * userLoad
     * 显示隐藏 useLoad
     * @param {boolean} type 
     */
    userLoad(type) {
        type ? userLoad.show() : userLoad.hide();
    },
    /**
     * showCustomerBtn
     * 展示转人工按钮
     */
    showCustomerBtn() {
        customerBtn.show();
    },
    /**
     * appendHtml
     * 在消息内容最后添加html
     * @param {String} html 
     */
    appendHtml(html) {
        $.when(msgListConent.append(html)).then(() => {
            let imgType = $(html).find('img').length > 0 ? true : false;
            if (imgType) {
                if (this.viewer) {
                    this.viewer.update();
                } else {
                    this.initViewer();
                }
            }
        });
    },
    /**
     * prependHtml
     * 在消息内容前面添加html
     * @param {String} html 
     * @return {Object} jquery obj
     */
    prependHtml(html) {
        // 不添加历史内容,因为加入的节点是总的html
        let $this = msgListConent.prepend(html);
        let imgType = $(html).find('img').length > 0 ? true : false;
        if (imgType) {
            if (this.viewer) {
                this.viewer.update();
            } else {
                this.initViewer();
            }
        }
        return $this;
    },
    initViewer() {
        DOM.viewer = new Viewer(msgListConent[0], {
            navbar: false,
            title: false,
            toolbar: false,
        });
    },
    /**
     * smallTip
     * 底部输入框上方最小的文字提示
     * @param {String} msg 
     * @param {boolean} isHistory 是否加入历史纪录
     */
    smallTip(msg, isHistory = true) {
        let tpl = this.getSmalltpl(msg);
        msgListConent.append(tpl);
        // 添加到历史纪录
        if (isHistory) {
            webIm._setHistorys(tpl);
        }
        DOM.scrollBottom();
    },
    /**
     * getSmalltpl
     * 获取small模板
     * @param {String} msg
     * @return {String} html
     */
    getSmalltpl(msg) {
        return '<li class="user-join-time"><div>' + msg + '</div></li>';
    },
    /**
     * 隐藏更多历史纪录按钮
     * @param {boolean} type
     */
    disableMoreHistory(type) {
       type ? historyMoreBtn.hide() : historyMoreBtn.css('display', 'inline-block');
    },
    /**
     * setMobileTitle 设置客服名称
     * @param {String} titleValue title值    
     */
    setMobileTitle(titleValue) {
        mobileTitle.find('span').html(titleValue);
    },
    /**
     * setMobileTitleBgColor  设置客服title颜色
     * @param {String} colorValue 
     */
    setMobileTitleBgColor(colorValue) {
        mobileTitle.css('background-color', colorValue);
    },
    getBrowserInfo() {
        let agent = navigator.userAgent.toLowerCase();
        // IE
        if (agent.indexOf('msie') > 0) {
            return 'IE';
        } else if (agent.indexOf('firefox') > 0) {
            return 'Firefox';
        } else if (agent.indexOf('chrome') > 0) {
            return 'Chrome';
        } else if (agent.indexOf('safari') > 0 && agent.indexOf('chrome') < 0) {
            return 'Safari';
        } else {
            return 'IE';
        }
    },
    scrollBottom() {
        dialogList.scrollTop(msgListConent.height());
   },
};
export default DOM;