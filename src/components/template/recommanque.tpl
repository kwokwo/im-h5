<li class="robot-say" data-type="text">
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
            <div class="chat-message">
                <span class="more-result">为您推荐更多答案</span>
                <ul class="list-result">
                    {{~ it.abstract :item:index}}
                    <li><i>{{= index+1 }}</i><a class="s-choices" word="{{= item}}">{{= item}} </a></li>
                    {{~}}
                </ul>
            </div>
        </div>
    </div>
</li>