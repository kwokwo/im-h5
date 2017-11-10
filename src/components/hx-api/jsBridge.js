'use strict';
import common from './webim';
const bridge = {
    onIntelligentQaResult(message) {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler(
                'onIntelligentQaResult'
                , {'param': message}
                , function(responseData) {}
            );
        };
    },
    onIntelligentQaRequest() {
       window.WebViewJavascriptBridge.init(function(message, responseCallback) {
            console.log('初始化bridge');
            responseCallback({
                'initState': true,
            });
        });
        window.WebViewJavascriptBridge.registerHandler("onIntelligentQaRequest", function(data, responseCallback) {
            console.log('onIntelligentQaRequest');
            common.sendMsg({
                    data: data,
                });
            responseCallback("java调用onIntelligentQaRequest");
        });
    },
};

document.addEventListener(
    'WebViewJavascriptBridgeReady'
    , function() {
       bridge.onIntelligentQaRequest();
    },
    false
);


module.exports = bridge;