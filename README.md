for im-h5 
---------
####老版流程接口
> 默认数据字段

        大部分默认有传递数据

        ajax.getJson (获取ajax请求公共封装方法)

        beforeSend: (request)=>{
            request.setRequestHeader('tenantid', _loginData.client_tenantid);
            request.setRequestHeader('authtoken', _loginData.client_authtoken);
            request.setRequestHeader('uid', _loginData.client_id);
            request.setRequestHeader('sign', _loginData.client_sign);
        },

1. 初始化登录用户

        _getLoginBaseData 获取登录所需基本设置 (未登录时注册获取) | _loginData (登录时直接从store获取)

        /intelligent/api/sys/visitor/register/

        传递参数 (post)

        tenant_id: this.urlData.id,
        login_name: loginName,
        sign: sign,
        
2. 初始化游客和会员服务
    
    > 获取会员

        _getLoginMember 登录ajax配置

        /intelligent/api/sys/login/

        传递参数 (post)

        account: this.urlData.account,
        pwd: this.urlData.pwd,
        last_login_platform: 'web',

    > 获取游客

        _getLoginVisitor 登录游客方法

        /intelligent/api/sys/visitor/login/

        传递参数 (post)

        login_name: loginName,
        last_login_platform: 'web',



    >登录游客或者会员公共方法和配置

        1. _setRobotSetting 设置机器人信息 设置机器人title  

            /intelligent/api/robot/settings/view/

            传递参数 (get)

            tenantid: _ajaxLoginData.tenant_id,
            uid: _ajaxLoginData.id,

        2. _setPageSetting 设置pageSetting 

            /intelligent/api/channel/get_page_setting/

            传递参数 (get)

            id: _ajaxLoginData.client_tenantid,

3. 环信登录 (websocks第三方)

    >由第三方提供服务

4. 自身检测服务(判断接入机器人或者人工)

    > _getInitSessionAjax (判断是否接入)

        /intelligent/api/chat/check/session/ 

        传递参数 (get)

        client_user_id: hxApi.loginInfo.client_id,

    > _getTenantAjax (没有接入时的判断 --> 转入机器接入或者人工)

        /intelligent/api/tenant/get_tenant_info/

        参数传递 (post)

        默认数据字段

    1. 机器人接入

        > callRobotAjax (获取机器人列表)
           
            /intelligent/api/robot/list/

            传递参数 (get)

            user_id: hxApi.loginInfo.client_id,

        > callRobotNewAjax (创建机器人)

            /intelligent/api/robot/new/

            传递参数 (post)

            user_id: hxApi.loginInfo.client_id,
            client_hx_user_code: hxApi.loginInfo.client_hx_user_code,
            robot_hx_user_code: robotData.hx_user_code,

    2. 人工接入

        > callCustomerAjax (连接客服列表)

            /intelligent/api/chat/expert/free/

            传递参数 (get)

            user_id: hxApi.loginInfo.client_id,

        > getCustomerAjax (获取在线客服接口)

            /intelligent/api/chat/expert/new/

            传递参数 (post)

            user_id: hxApi.loginInfo.client_id,
            client_hx_user_code: hxApi.loginInfo.client_hx_user_code,
            server_user_id: customerData.server_user_id,
            server_hx_user_code: customerData.hx_user_code,
            client_duty: '',
            client_company: '',
            chat_identity: webIm.imServer.chat_identity,
            is_auto_connect_human: webIm.imServer.chat_identity ? 1 : 0,
            login_platform: 'web',
            ---------------------
            no_tip: 1, (如果是自动转入,auto需要添加no_tip(没有提示))



        


    



