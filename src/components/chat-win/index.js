'use strict';
import api from '../hx-api';

/**
 * chatWin 对象，封装相关操作和方法调用
 */
export default {
    /**
     * init 调用接口初始化请求对象等
     * @return {Object} promise.resolve();
     */
    initBaseService() {
        // 初始化initUserAndIM api
       return api._initUserAndIM();
    },
    /**
     * initBaseLogin 初始化登录
     * @return {Object} promise
     */
    initBaseLogin() {
       return api._initUserlogin();
    },
};
