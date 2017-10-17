<li class="robot-say"  data-type="image">
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
                <div class="pho-imgs" style="margin: 0">
                    <img class="sImg gallery-pic" src="{{= it.answer}}" data-action="zoom"/>
                </div>
        
            </div>
        </div>
       
    </div>
</li>