{{
    function decaodeAntiSqlXssValid(str) {
        try {
            return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, '\'').replace(/&quot;/g, '"');
        } catch (e) {
            return str;
        }
    }
}}
<li class="robot-say" data-type="choices">
    <a class="article-anchor"></a>
    <div class="chat-con">
        <div class="hide-block"></div>
        <div class="chat-msg">
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
            {{~ it.abstract :item:index}} 
            {{? index== 0}} 
                {{? item.content_type == "text"}}
                <div class="chat-msg-txt">
                    {{ if(isJSON(item.abstract)){ }} {{= JSON.parse(item.abstract).answer}} {{ } else { }} {{= item.abstract}} {{ } }}
                </div>
                {{?}} 
                {{? item.content_type == "video"}}
                <div class="chat-msg-txt">
                   {{= decaodeAntiSqlXssValid(JSON.parse(item.abstract).answer)}}
            
                </div>
                {{?}} 
                {{? item.content_type == "image"}}
                <div class="chat-msg-txt">
                    <div class="pho-imgs">
                        {{ if(isJSON(item.abstract)){ }}  <img class="sImg gallery-pic no-viewer" src="{{= JSON.parse(item.abstract).answer}}"/> {{ } else { }} <img class="sImg gallery-pic no-viewer" src="{{= item.abstract }}"/> {{ } }}
                    </div>
                </div>
                {{?}}
             {{? item.content_type == "position"}}
            <div class="chat-msg-txt">
                <div class="chat-msg">
                    <div class="chat-msg-txt-map" style="color:#000;">
                        {{= JSON.parse(item.abstract).title}}
                    </div>
                    <!--文本-->
                    <a class="chat-message-map" href="{{= JSON.parse(item.abstract).answer}}" target="_blank">
                        <img style="max-width:300px;" class="no-viewer" src="{{= JSON.parse(item.abstract).cover_img}}" />
                    </a>
                </div>
            </div>
            {{?}} 
            {{? item.content_type == "richtext"}} 
            {{ if(isJSON(item.abstract)){ }} 
                {{? JSON.parse(item.abstract).title.length >= 12}}
                <div class="chat-msg-txt">
                    <a style="color: #333;" href="{{= JSON.parse(item.abstract).url}}" target="_blank">{{= JSON.parse(item.abstract).title }}</a>
                </div>
                {{?}}
                <div class="chat-message">
                    <dl class="minute-box">
                        <dt><img src="{{= JSON.parse(item.abstract).cover_img }}" class="no-viewer"></dt>
                        <dd style="max-height: 90px">
                            {{? JSON.parse(item.abstract).title.length
                            < 12}} <span style="margin-bottom: 2px;"><a style="color: #333;" href="{{= JSON.parse(item.abstract).url}}" target="_blank">{{= JSON.parse(item.abstract).title }}</a></span>
                            {{?}}
                            <a href="{{= JSON.parse(item.abstract).url}}" target="_blank">{{= JSON.parse(item.abstract).summary.length>0?JSON.parse(item.abstract).summary:'点击查看详情~' }}</a>
                        </dd>
                    </dl>
                </div> 
                {{ } else { }}
                {{? item.text.length >= 12}}
                <div class="chat-msg-txt">
                    <a style="color: #333;" href="rich_view.html?id={{=item.data_id}}" target="_blank">{{= item.text }}</a>
                </div>
                {{?}}
                <div class="chat-message">
                    <dl class="minute-box">
                        <dt><img src="{{= it.cover_img }}" class="no-viewer"></dt>
                        <dd style="max-height: 90px">
                            {{? item.text.length < 12}} 
                            <span style="margin-bottom: 2px;"><a style="color: #333;" href="rich_view.html?id={{=item.data_id}}" target="_blank">{{= item.text }}</a></span>
                            {{?}}
                            <a href="rich_view.html?id={{=item.data_id}}" target="_blank">{{= item.abstract.length>0?item.abstract:'点击查看详情~' }}</a>
                        </dd>
                    </dl>
                </div> 
                {{ } }} 
                {{?}} 
            {{?}} 
            {{~}}
        
            <!--文本-->
            <div class="chat-message">
                <span class="more-result">为您推荐更多答案</span>
                <ul class="list-result">
                    {{~ it.abstract :item:index}} {{? index != 0}}
                    <li {{? index==2 }}style="margin-bottom:0px;" {{?}}><i>{{= index }}</i><a class="s-choices" word="{{= item.text}}">{{= item.text}} </a></li>
                    {{?}} {{~}}
                </ul>
        
        
            </div>
        </div>
    </div>
</li>