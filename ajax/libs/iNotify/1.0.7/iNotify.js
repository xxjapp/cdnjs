;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.iNotify = factory();
    }
}(this, function(root, undefined) {
    var repeatableEffects = ['flash', 'scroll'],iNotify,defaultNotification={
                title:"通知！",
                body:'您来了一条新消息'
            },iconURL = "";
    iNotify = {
        init:function(config){
            if(!config) config = {}
            this.interval = config.interval || 200//响应时长
            this.effect = config.effect || 'flash' //效果
            this.title = config.title || document.title; //标题
            this.message = config.message || this.title; //原来的标题
            this.updateFavicon = config.updateFavicon || {
                id: "favicon",
                textColor: "#fff",
                backgroundColor: "#2F9A00",
            }
            this.audio = config.audio || '';
            this.favicon = document.querySelectorAll('link[rel~=shortcut]')[0]
            this.favicon = this.favicon;
            this.cloneFavicon = this.favicon.cloneNode(true);
            defaultNotification.icon = iconURL = this.favicon.href;
            this.notification = config.notification || defaultNotification;

            if ( 0 <= repeatableEffects.indexOf(this.effect)) this.addTimer()
            return this;
        },
        render: function() {
            switch (this.effect) {
                case 'flash':
                    document.title = (this.title === document.title) ? this.message : this.title;
                    break;
                case 'scroll':
                    document.title = document.title.slice(1);
                    if (0 === document.title.length) {
                        document.title = this.message
                    }
                    break;
            }
        },
        setURL:function(url){
            if(!this.audioElm){
                url=url?this.audio.file=url:this.audio.file;
                this.audioElm = createAudio(url);
                document.body.appendChild(this.audioElm);
            }else{
                if(url){
                    this.audioElm.remove()
                    this.audioElm = createAudio(url);
                    document.body.appendChild(this.audioElm);
                }
            }
            return this
        },
        loopPlay:function(){
            this.setURL()
            this.audioElm.loop = true
            this.player()
            return this
        },
        stopPlay:function(){
            this.audioElm && (this.audioElm.loop = false,this.audioElm.pause())
            return this
        },
        //播放声音
        player:function(){
            var adi = this.audio.file,source = null;
            if(!this.audio || !this.audio.file) return;
            if(!this.audioElm){
                this.audioElm = createAudio(this.audio.file);
                document.body.appendChild(this.audioElm)
            }
            this.audioElm.play();
            return this
        },
        notify:function(json){
            var nt = this.notification;
            if(Notification){
                if(json) nt = jsonArguments(json,nt);
                else nt = defaultNotification;
                new Notification(nt.title, {
                    icon: iconURL,
                    body: nt.body
                });
            }
            return this
        },
        //设置标题
        setTitle:function(str){
            if(str) {
                this.message = str,this.addTimer()
            }else {
                this.clearTimer(),
                this.title = this.title
            }
            return this
        },
        //设置时间间隔
        setInterval:function(num){
            if(num) this.interval = num,this.addTimer()
            return this
        },
        //设置网页Icon
        setFavicon:function(num){
            if(!num&&num!==0) return this.faviconClear();
            var oldicon = document.getElementById('new'+this.updateFavicon.id)
            if(this.favicon) this.favicon.remove();
            if(oldicon) oldicon.remove();
            changeFavicon(num,this.updateFavicon)
            return this
        },
        //添加计数器
        addTimer:function(){
            this.clearTimer()
            if ( 0 <= repeatableEffects.indexOf(this.effect)) {
                this.timer = setInterval(this.render.bind(this), this.interval);
            }
            return this
        },
        //清除Icon
        faviconClear:function(){
            var newicon = document.getElementById('new'+this.updateFavicon.id)
                head = document.getElementsByTagName('head')[0],
                ficon = document.querySelectorAll('link[rel~=shortcut]')
            newicon&&newicon.remove()
            if(ficon.length>0) for (var i = 0; i < ficon.length; i++) {
                ficon[i].remove()
            };
            head.appendChild(this.cloneFavicon);
            iconURL = this.cloneFavicon.href;
            this.favicon = this.cloneFavicon;
            return this
        },
        //清除计数器
        clearTimer:function(){
            clearInterval(this.timer);
            document.title = this.title;
            return this
        }
    };
    function createAudio(url){
        var audioElm = document.createElement('audio')
        if(isArray(url) && url.length>0){
            for (var i = 0; i < url.length; i++) {
                source = document.createElement('source')
                source.src = url[i]
                source.type = 'audio/'+ getExtension(url[i])
                audioElm.appendChild(source)
            }
        }else{
            audioElm.src = url
        }
        return audioElm
    }
    function isArray(value) { return Object.prototype.toString.call(value) === '[object Array]';}
    function changeFavicon(num,settings){
        var canvas = document.createElement('canvas'),
            img = document.createElement('img'),
            head = document.getElementsByTagName('head')[0],
            linkTag = document.createElement('link'),
            ctx;

        canvas.height = canvas.width = 32;
        ctx = canvas.getContext('2d');
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, 32, 32);

        ctx.textAlign = "center";
        ctx.font = '22px "helvetica", sans-serif';
        ctx.fillStyle = settings.textColor;
        ctx.fillText(num, 16, 24);

        //生成到
        linkTag.setAttribute('rel','shortcut icon');
        linkTag.setAttribute('type','image/x-icon');
        linkTag.setAttribute('id', 'new'+settings.id);
        linkTag.setAttribute('href', canvas.toDataURL('image/png'));
        head.appendChild(linkTag); 
        iconURL = canvas.toDataURL('image/png')
    };
    //获取文件后缀
    function getExtension (file_name) { return file_name.match(/\.([^\.]+)$/)[1];}
    function jsonArguments (news,olds) {
        for (var a in olds) if(news[a]) olds[a]=news[a];
        return olds
    }
    //提醒是否添加chrome通知
    if (Notification&&Notification.permission !== "granted") Notification.requestPermission();
    return iNotify
}));

