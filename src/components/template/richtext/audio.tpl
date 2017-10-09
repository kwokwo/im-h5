<li class="robot-say"  data-type="audio">
    <a class="article-anchor"></a>
    <div class="chat-con" >
        <div class="hide-block"></div>
        <div class="chat-msg music-chat-msg" >
            <i class="chat-arr"></i>
            {{? it.type == "robot"}}
            {{? it.dislike!==1}}
            <div class="tools-pop-up">
                <i class="myzf-ico"></i>
                <div class="j-trample-icon" id="{{= it.id}}"><i class="ico-myzf1"></i><span>不满意</span></div>
                <!--<div><i class="ico-myzf2"></i><span>复制</span></div>-->
            </div>
            <!--<i id="{{= it.id}}" class="trample-icon active"></i> -->
            {{?}}
            {{? it.dislike===1}}
            <div class="tools-pop-up">
                <i class="myzf-ico"></i>
                <div class="active"><i class="ico-myzf1"></i><span>已踩</span></div>
                <div><i class="ico-myzf2"></i><span>复制</span></div>
            </div>
            <!--<i id="{{= it.id}}" class="trample-icon default"></i>-->
            {{?}}
            {{?}}
            <div class="chat-message">
                <dl class="minute-box">
                    <a target="_blank" href="{{= it.url }}" style="display: inherit;"><i class="music-play"></i></a>
                    <dt><img class="no-viewer" style="height: 60px;width: 60px;" src="{{= it.cover_img?it.cover_img:'images/ico-yingyue.png' }}"></dt>
                    <dd style="height: 62px;">
                        <span>{{= it.title }}</span>
                        <a>{{= it.author}}</a>
                    </dd>
                </dl>
            </div>
            <div class="from-panel">
                    <p>来至网易云音乐</p>
                </div>
        </div>
       
        <!--chat-msg End-->
    </div>
</li>