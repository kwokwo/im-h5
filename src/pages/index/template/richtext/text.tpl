<li class="robot-say"  data-type="richtext">
        <a class="article-anchor"></a>
        <div class="chat-con">
            <div class="hide-block"></div>
            <div class="chat-msg">
                <i class="chat-arr"></i>
                {{? it.dislike!==1}}
                <div class="tools-pop-up">
                    <i class="myzf-ico"></i>
                    <div class="j-trample-icon" id="{{= it.id}}"><i class="ico-myzf1"></i><span>不满意</span></div>
                </div>
                {{?}}
                {{? it.dislike===1}}
                <div class="tools-pop-up">
                    <i class="myzf-ico"></i>
                    <div class="active"><i class="ico-myzf1"></i><span>已踩</span></div>
                    <div><i class="ico-myzf2"></i><span>复制</span></div>
                </div>
                {{?}}
                {{? it.title.length >= 12 && it.summary.length>= 20}}
                <div class="chat-msg-txt">
                    <a style="color: #333;" href="{{= it.url}}" target="_blank">{{= it.title }}</a>
                </div>
                {{?}}
                <!--文本-->
                <div class="chat-message">
                    <dl class="minute-box">
                        <dt><img src="{{= it.cover_img }}" class="no-viewer"></dt>
                        <dd style="max-height: 90px">
                            {{? it.title.length
                            < 12 || it.summary.length < 20}} <span style="margin-bottom: 2px;"><a style="color: #333;" href="{{= it.url}}" target="_blank">{{= it.title }}</a></span>
                            {{?}}
                            <a href="{{= it.url}}" target="_blank">{{= it.summary.length>0?it.summary:'点击查看详情~' }}</a>
                        </dd>
                    </dl>
                </div>
            </div>
            <!--chat-msg End-->
        </div>
    </li>