<li class="robot-say" data-type="video">
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
            {{ if((it.abstract).indexOf('iframe')>-1){ }}
            <div class="chat-message">{{=it.abstract}}</div>
            {{ } else { }}
            <div class="chat-message"><i class="vdo-display"><a target="_blank" href="javascript:window.open('{{! it.abstract  }}')"><img src="images/vdo-play.png"></i></a></div>
            {{ } }} 
        </div>
    </div>
</li>