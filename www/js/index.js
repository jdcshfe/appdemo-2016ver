/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        StatusBar.styleLightContent();
        //
        app.receivedEvent('deviceready');
        // StatusBar.overlaysWebView( false );
        // 
        // StatusBar.styleLightContent();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

//dom ready
$(function(){
    var appDom = {
        barVisible: true,
        barTimeDelay: 500,
        touchStartID: -1,
        touchEndID: -1,
        touchStart: null,
        touchDelta: null,
        winW: $(window).width(),
        bannerIndex: 0,
        bannerPlay: false,
        bannerAutoID: -1,
        seckillOffset : null,
        init: function(){
            var me = this;
            //
            app.initialize();
            me.bindHander();
            me.initBanner();
            me.initSeckill();
        },
        bindHander: function(){
            var me = this;
            //touch
            $('body').on('touchstart', function(e){
                var touches = e.touches[0];
                me.touchStart = {
                    x: touches.pageX,
                    y: touches.pageY
                };
            });
            $('body').on('touchmove', function(e){
                var target = $(e.target);
                var isBanner = target.parents('#J_banner').length>0;
                var isSeckill = target.parents('#J_seckill').length>0;
                var isSign = isBanner || isSeckill;
                isSign = false;
                if(isSign || !me.barVisible){
                    return;
                }
                if(e.touches.length>1 || e.scale && e.scale !== 1){
                    return;
                }
                var touches = e.touches[0];
                me.touchDelta = {
                    x: touches.pageX - me.touchStart.x,
                    y: touches.pageY - me.touchStart.y
                };
                if(Math.abs(me.touchDelta.x) < Math.abs(me.touchDelta.y)){
                    //status
                    me.barVisible = false;
                    me.barVisibleHandler();    
                }
                
            });
            $('body').on('touchend', function(e){
                //auto
                me.bannerAuto();
                //
                if(me.barVisible){
                    clearTimeout(me.touchEndID);
                    return;
                }
                //status
                clearTimeout(me.touchEndID);
                me.touchEndID = setTimeout(function(e){
                    var me = appDom;
                    me.barVisible = true;
                    me.barVisibleHandler();
                },me.barTimeDelay);
            });
            //banner
            var bannerMc = new Hammer($('#J_banner').get(0));
            bannerMc.on("panleft panright", function(e){
                clearInterval(me.bannerAutoID);
                if(me.bannerPlay){
                    return;
                }
                me.bannerPlay = true;
                switch(e.type){
                    case 'panleft': me.bannerSwipeLeft(); break;
                    case 'panright': me.bannerSwipeRight(); break;
                }
            });

            // $('#J_banner').on('swipeLeft', function(e){
                // return;
                // var index = me.bannerIndex + 1;
                // if(index>=bannerMax){
                //     index = bannerMax-1;
                //     return;
                // }
                // me.bannerPos(index);
            // });
            // $('#J_banner').on('swipeRight', function(e){
            //     return;
            // });
            var count = 0;
            //seckill
            $('#J_seckill .items-con').on('scroll', function(e){
            // setInterval(function(){
                count++;
                var me = appDom;
                var target = $('#J_seckill .items-con');
                var img = target.find('img').eq(0);
                var left = target.scrollLeft();
                leftTmp = img.offset().left * (-1);
                var tmp = left + me.seckillOffset.margin;
                var num = Math.floor(tmp/(me.seckillOffset.item+me.seckillOffset.margin*2));
                //debug
                /*$('#J_seckill .h').text(count+'-'+leftTmp).css({
                    width: '100px',
                    background: 'yellow'
                });*/
                //
                var moveItem;
                for(var i=0; i<=num; i++){
                    moveItem = $('#J_seckill .percent span').eq(i+2);
                    if(moveItem.length>0){
                        me.seckillMove(moveItem);    
                    }
                }

                
                // console.log(img.position().left)
                // $('#J_seckill .h').text('-'+img.position);
            // }, 100);
            });
            $('#J_seckill').on('touchend', function(e){
                count = 0;
            });

            //go-sub
            $('.go-sub').on('tap', function(e){
                var to = $(this).attr('data-sub');
                $('#J_subPages img').removeClass('show')
                $('#J_subPages .txt').removeClass('show')
                $('#J_subPages').find('.'+to).addClass('show');
                if($('#J_subPages .show').length==0){
                    $('#J_subPages .txt').addClass('show');
                }
                $('#J_subPages').addClass('moving');
                //container
                $('.container').addClass('moving');
                //status
                setTimeout(function(){
                    StatusBar.styleDefault();    
                },300);
            });
            $('#J_subPages .back').on('click', function(e){
                $('#J_subPages').removeClass('moving');
                $('.container').removeClass('moving');
                //status
                StatusBar.styleLightContent();
            });
        },
        bannerSwipeLeft: function(){
            var me = this;
            //
            me.bannerPlay = true;
            var bannerPics = $('#J_banner .banner-pics');
            var bannerMax = bannerPics.find('li').length;
            //
            var index = me.bannerIndex + 1;
            if(index>=bannerMax){
                index = bannerMax-1;
                me.bannerPlay = false;
                return;
            }
            me.bannerPos(index);
        },
        bannerSwipeRight: function(){
            var me = this;
            //
            var index = me.bannerIndex - 1;
            if(index<0){
                index = 0;
                me.bannerPlay = false;
                return;
            }
            me.bannerPos(index);
        },
        barVisibleHandler: function(){
            var me = this;
            //header
            var header = $('#J_header');
            var footer = $('#J_footer');
            if(me.barVisible){
                header.removeClass('move-out');
                footer.removeClass('move-out');
            }else{
                header.addClass('move-out');
                footer.addClass('move-out');
            }
        },
        initBanner: function(){
            var me = this;
            var banner = $('#J_banner');
            var num = banner.find('.banner-pics li').length;
            banner.find('.banner-pics').css({
                width: me.winW*num
            });
            banner.find('.banner-pics li').css({
                width: me.winW
            });
            //auto
            me.bannerAuto();
        },
        initSeckill: function(){
            var me = this;
            var seckillNode = $('#J_seckill');
            var num = seckillNode.find('.items img').length;
            var offset = 20;
            seckillNode.css({
                width: me.winW - offset
            });
            seckillNode.find('.items').css({
                width: me.winW * num
            }).find('img').css({
                width: me.winW - offset
            });
            //
            var scaleW = me.getScaleSize(260, 1202);
            var scaleWMargin = me.getScaleSize(73,1202)-1;
            seckillNode.find('.percent').css({
                width: (me.winW-offset)*num+scaleWMargin
            }).find('span').css({
                width: scaleW,
                'margin': '0 '+scaleWMargin+'px'
            });
            me.seckillOffset = {
                item: scaleW,
                margin: scaleWMargin
            };
            //play
            me.seckillPlay();
            setTimeout(function(){
                appDom.seckillPercent();
            },1000);
        },
        bannerPos: function(index){
            var me = this;
            var bannerPics = $('#J_banner .banner-pics');
            //pos
            var pos = index * me.winW;
            pos = -pos;
            bannerPics.css({
                '-webkit-transform': 'translateX('+pos+'px)',
                'transform': 'translateX('+pos+'px)'
            });
            me.bannerIndex = index;
            //dots
            var dotNode = $('#J_banner .dots');
            dotNode.find('li').removeClass('cur');
            dotNode.find('li').eq(index).addClass('cur');
            //bg
            var bgNode = $('#J_mainBg');
            bgNode.find('span').removeClass('cur');
            bgNode.find('span').eq(index).addClass('cur');
            //clean
            setTimeout(function(e){
                var me = appDom;
                me.bannerPlay = false;
            },600);
        },
        bannerAuto: function(){
            var me = this;
            var num = $('#J_banner .banner-pics img').length;

            //auto
            clearInterval(me.bannerAutoID);
            me.bannerAutoID = setInterval(function(){
                var me = appDom;
                var index = me.bannerIndex + 1;
                index = index>=num ? 0 : index;
                me.bannerPos(index);
            },3000);
        },
        seckillPlay: function(){
            var me = this;
            var mNode = $('#J_seckill .m');
            var mValue = Number(mNode.text());
            var sNode = $('#J_seckill .s');
            var sValue = Number(sNode.text());
            var tmp;
            setInterval(function(){
                tmp = sValue - 1;
                if(tmp<0){
                    sValue = 59;
                    mValue -= 1;
                    mValue = mValue<0 ? 59 : mValue;
                }else{
                    sValue = tmp<=9 ? '0'+tmp : tmp;
                }
                mNode.text(mValue);
                sNode.text(sValue);
            }, 1000);
        },
        seckillPercent: function(){
            var me = this;
            var arr = $('#J_seckill .percent span');
            var item;
            for(var i=0; i<3; i++){
                item = $(arr[i]);
                me.seckillMove(item);
            }
        },
        //utils
        getScaleSize: function(cur, whole){
            var me = this;
            var offset = 20;
            var size = cur/whole*(me.winW - offset);
            size = parseInt(size);
            return size;
        },
        seckillMove: function(item){
            var me = this;
            var val = item.find('em').text();
            item.find('i').css({
                width: val
            });
            item.find('em').css({
                left: val
            });
        }
    };

    //init
    appDom.init();
});
