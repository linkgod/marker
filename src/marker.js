/*! Licensed under MIT, https://github.com/linkgod/marker */
(function(){
    var root = this,
        Marker;

    Marker = function(config){
        this.config = {
            dom: 'body',
            type: [{
                name: 'Mark',
                color: '#00f127'
            }]
        };
        if($.type(config) === 'string'){
            this.config.dom = config;
        }else if ($.type(config) === 'object'){
            $.extend(this.config, config);
        }else{
            throw '你的marker配置类型错误，不应该是' + $.type(config);
        }

        this.$this = $(this.config.dom);
        this.keywordList = [];
        this._selection = window.getSelection();

        // init toolbar
        this.toolbar();

        return this;
    };

    Marker.prototype.addKeyword = function(range, typeNum) {
        marker = this;

        // define Keyword
        var Keyword = function(range, typeNum){
            var id = +new Date();
            // Add DOM
            var keywordNode = document.createElement('span');
            keywordNode.id = 'mark' + id;
            keywordNode.setAttribute('data-type-num', typeNum);
            keywordNode.className = 'markpen-mark';
            keywordNode.title = marker.config.type[typeNum].name;
            keywordNode.style.backgroundColor = marker.config.type[typeNum].color;
            range.surroundContents(keywordNode);

            this.id = id;
            this.content = range.toString();
            this.typeNum = typeNum || 0;
            this.type = marker.config.type[typeNum].name;
            this.node = keywordNode;
        };
        var keyword = new Keyword(range, typeNum);

        this.keywordList.push(keyword);

        // Add listener
        $(keyword.node).click(function(e){
            e.stopPropagation();
            e.preventDefault();

            // show toolbar
            marker.toolbar.$this.find('.markpen-toolbar-delete').show();
            marker.toolbar.$this.find('.markpen-toolbar-tag').hide();
            marker.toolbar.$this.css({
                position: 'absolute',
                top: e.currentTarget.offsetTop - marker.toolbar.$this.height(),
                left: e.currentTarget.offsetLeft
            }).show();

            marker._currentKeyword = keyword;
            return false;
        }).mouseup(function(e){
            e.stopPropagation();
            return false;
        });
    };

    Marker.prototype.delectKeyword = function(keyword){
        var i;

        // TODO: 有待改进，会分割单个6DOM为多个#text
        $(keyword.node).replaceWith(keyword.node.childNodes);

        // delete keyword from keyword list
        for(i = 0;i < this.keywordList.length; i++){
            if(this.keywordList[i] === keyword){
                this.keywordList.splice(i, 1);
            }
        }
    };

    // get keyword list
    Marker.prototype.getKeywordList = function(){
        return this.keywordList;
    };

    Marker.prototype.markedAll = function(){
        var isMarkedAll = true;

        $.each(this.$this, function(k, v){
            var marks = $(v).find('.markpen-mark');
            if( marks.length === 0){
                isMarkedAll = false;
                console.log('还有内容没有标记', v);
            }
        });

        return isMarkedAll;
    };

    // transform html to templet
    Marker.prototype.getTemplet = function(){
        // TODO: export templet
    };

    Marker.prototype.toolbar = function(){
        var marker = this,
            $this = marker.$this;

        // define toolbar
        var Toolbar = function(){
            var toolbarTpl ='',
                selectValue = '',
                offset,
                i;

            // init toolbar
            toolbarTpl += '<aside class="markpen-toolbar">';
            for(i = 0; i < marker.config.type.length; i++){
                toolbarTpl += '<a class="markpen-toolbar-tag markpen-toolbar-button" data-type-num="' + i + '">' + marker.config.type[i].name + '</a>';
            }
            toolbarTpl += '<a class="markpen-toolbar-delete markpen-toolbar-button" style="display:none;">删除</a></aside>';
            $toolbar = $(toolbarTpl).hide();

            $this.append($toolbar);

            // Add listener to mark word
            $toolbar.find('.markpen-toolbar-tag').click(function(e){
                e.stopPropagation();
                try{
                    marker.addKeyword(marker._range, e.currentTarget.dataset.typeNum);
                }catch(error){
                    console.log(error, '无法跨行标记');
                }
                $toolbar.hide();
                return false;
            }).mouseup(function(e){
                e.stopPropagation();
                return false;
            });

            // Add listener to delete marked word
            $toolbar.find('.markpen-toolbar-delete').click(function(e){
                e.stopPropagation();
                marker.delectKeyword(marker._currentKeyword);
                $toolbar.hide();
                return false;
            }).mouseup(function(e){
                e.stopPropagation();
                return false;
            });

            var showToolbar = function(){
                var offset = marker._range.getBoundingClientRect(),
                    top = offset.top - 8,
                    left = offset.left + offset.width / 2;

                // don't show delete option
                $toolbar.find('.markpen-toolbar-tag').show();
                $toolbar.find('.markpen-toolbar-delete').hide();

                // set position and show it
                $toolbar.css({
                    position: 'fixed',
                    top: top - $toolbar.height(),
                    left: left - $toolbar.width() / 2
                }).show();
            };

            var hideToolbar = function (){
                $toolbar.hide();
            };

            return {
                $this: $toolbar,
                showToolbar: showToolbar,
                hideToolbar: hideToolbar
            };
        };
        marker.toolbar = Toolbar();

        // auto show toolbar after select words
        $this.mouseup(function(){
            var range;

            if(!marker._selection.isCollapsed){
                range = marker._selection.getRangeAt(0);
                // highlight whether start and end points in same container
                // if(range.startContainer === range.endContainer){
                    marker._range = marker._selection.getRangeAt(0);
                    marker.toolbar.showToolbar();
                // }
            }
        });

        // auto hide toolbar
        $(window).mouseup(function(){
            if(marker._selection.isCollapsed){
                marker.toolbar.hideToolbar();
            }
        });

        // change menu offset when window resize / scroll
        var setpos = function() {
            if(marker.toolbar.$this.css('display') !== 'none'){
                if(marker.toolbar.$this.css('position') !== 'absolute'){
                    marker.toolbar.showToolbar();
                }
            }
        };
        window.addEventListener('resize', setpos);
        window.addEventListener('scroll', setpos);
    };

    // support AMD and Node
    if(typeof define === "function" && typeof define.amd){
        define(function(){
            return Marker;
        });
    }else if(typeof exports !== 'undefined') {
        if(typeof module !== 'undefined' && module.exports) {
          exports = module.exports = Marker;
        }
        exports.Marker = Marker;
    } else {
        root.Marker = Marker;
    }

}).call(this);
