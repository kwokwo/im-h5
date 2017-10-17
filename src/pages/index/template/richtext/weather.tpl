<li class="robot-say" data-type="weather">
    <a class="article-anchor"></a>
    <div class="chat-con">
        <div class="hide-block"></div>
        <div class="chat-msg">
            <i class="chat-arr"></i>
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
            <div class="chat-message">
                <dl class="minute-box">
                    {{? it.img != '' }}
                    <dt><img src="{{= it.img }}" class="no-viewer"><span>{{= it.curw }}</span></dt>{{?}}
                    <dd>
                        <div class="weather-box">
                            <p><em>{{= it.city }}</em><span>{{= it.date }}</span></p>
                            {{? it.temp === ''}}
                            <p><small></small ><strong style="font-size:30px;">{{= it.temp_min }}~{{= it.temp_max }}℃</strong></p>
                            {{??}}
                            <p><small>{{= it.temp }}℃</small ><strong>{{= it.temp_min }}~{{= it.temp_max }}℃</strong></p>{{?}}
                            <p>{{= it.weather }}<b class="green">{{= it.air }}</b></p>
                        </div>
                    </dd>
                </dl>
            </div>
        </div>
        <!--chat-msg End-->
    </div>
</li>