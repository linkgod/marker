/*! Licensed under MIT, https://github.com/linkgod/marker */
(function(){
    var root = this,
        utils= {},
        Marker;

    // type detect
    utils.is = function(obj, type) {
        return Object.prototype.toString.call(obj).slice(8, -1) === type;
    };

    // copy props from a obj
    utils.copy = function(defaults, source) {
        for(var p in source) {
            if(source.hasOwnProperty(p)) {
                var val = source[p];
                defaults[p] = this.is(val, 'Object') ? this.copy({}, val) :
                    this.is(val, 'Array') ? this.copy([], val) : val;
            }
        }
        return defaults;
    };

    // merge: make it easy to have a fallback
    utils.merge = function(config) {
        // default settings
        var defaults = {
            dom: document.body,
            type: [{
                name: 'Mark',
                color: '#00f127'
            }]
        };

        // user-friendly config
        if(config.nodeType === 1) {
            defaults.dom = config;
        } else if(config.match && config.match(/^#[\S]+$/)) {
            defaults.dom = document.getElementById(config.slice(1));
        } else {
            defaults = utils.copy(defaults, config);
        }

        return defaults;
    };

    Marker = function(config){

        if(!config){
            return console.log('can\'t find config');
        }

        // merge user config
        this.config = utils.merge(config);

        this.dom = this.config.dom;
        this.keywordList = [];
        this._selection = window.getSelection();

        // init toolbar
        this.toolbar();

        return this;
    };

    Marker.prototype.addKeyword = function(range, typeNum) {
        that = this;

        // define Keyword
        var Keyword = function(range, typeNum){
            var id = +new Date();
            // Add DOM
            var keywordNode = document.createElement('span');
            keywordNode.id = 'mark' + id;
            keywordNode.setAttribute('data-type-num', typeNum);
            keywordNode.className = 'markpen-mark';
            keywordNode.title = that.config.type[typeNum].name;
            keywordNode.style.backgroundColor = that.config.type[typeNum].color;
            range.surroundContents(keywordNode);

            this.id = id;
            this.content = range.toString();
            this.typeNum = typeNum || 0;
            this.type = that.config.type[typeNum].name;
            this.node = keywordNode;
        };
        var keyword = new Keyword(range, typeNum);

        this.keywordList.push(keyword);

        // Add listener
        keyword.node.addEventListener('click', function(e){
            e.stopPropagation();
            e.preventDefault();

            // show toolbar
            [].forEach.call(that.toolbar.dom.getElementsByClassName('markpen-toolbar-delete'), function(item){
                item.style.display = '';
            });
            [].forEach.call(that.toolbar.dom.getElementsByClassName('markpen-toolbar-tag'), function(item){
                item.style.display = 'none';
            });
            that.toolbar.dom.style.position = 'absolute';
            that.toolbar.dom.style.display = '';
            that.toolbar.dom.style.top = e.currentTarget.offsetTop - that.toolbar.dom.clientHeight + 'px';
            that.toolbar.dom.style.left = e.currentTarget.offsetLeft + 'px';

            that._currentKeyword = keyword;
            return false;
        });
        keyword.node.addEventListener('mouseup', function(e){
            e.stopPropagation();
            return false;
        });
    };

    Marker.prototype.delectKeyword = function(keyword){
        var i;

        keyword.node.outerHTML = keyword.node.innerHTML;

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

    // transform html to templet
    Marker.prototype.getTemplet = function(){
        var markerCopy = this.dom.cloneNode(true),
            keywords = markerCopy.getElementsByClassName('markpen-mark');

        [].forEach.call(keywords, function(item){
            item.outerHTML = '{{'+ item.innerHTML + '}}';
        });

        [].forEach.call(markerCopy.getElementsByClassName('markpen-toolbar'), function(item){
            item.parentElement.removeChild(item);
        });

        return markerCopy.innerHTML;
    };

    Marker.prototype.toolbar = function(){

        var that = this,
            dom  = this.dom;

        // define toolbar
        var Toolbar = function(){

            var toolbarTpl  = '',
                selectValue = '',
                toolbar,
                offset,
                i;

            // init toolbar
            for(i = 0; i < that.config.type.length; i++){
                toolbarTpl += '<a class="markpen-toolbar-tag markpen-toolbar-button" data-type-num="' + i + '">' +
                                  that.config.type[i].name +
                              '</a>';
            }
            toolbarTpl += '<a class="markpen-toolbar-delete markpen-toolbar-button" style="display:none;">删除</a>';

            toolbar = document.createElement('aside');
            toolbar.setAttribute('class', 'markpen-toolbar');
            toolbar.innerHTML = toolbarTpl;
            toolbar.style.display = 'none';

            dom.appendChild(toolbar);

            // Add listener to mark word
            var toolbarClick = function(e){
                e.stopPropagation();

                var isMarkKeyword   = e.target.classList.contains('markpen-toolbar-tag'),
                    isDelectKeyword = e.target.classList.contains('markpen-toolbar-delete');

                if(isMarkKeyword){

                    try{
                        that.addKeyword(that._range, e.target.dataset.typeNum);
                    }catch(error){
                        console.log(error, 'Don\'t cross mark');
                    }
                    toolbar.style.display = 'none';

                    return false;

                }else if(isDelectKeyword){

                    that.delectKeyword(that._currentKeyword);
                    toolbar.style.display = 'none';

                    return false;
                }
            };

            var stopPropagation = function(e){
                e.stopPropagation();
                return false;
            };

            toolbar.addEventListener('click', toolbarClick, false);
            toolbar.addEventListener('mouseup', stopPropagation, false);


            var showToolbar = function(){
                var offset = that._range.getBoundingClientRect(),
                    top = offset.top - 8,
                    left = offset.left + offset.width / 2;

                // don't show delete option
                [].forEach.call(toolbar.getElementsByClassName('markpen-toolbar-tag'), function(item){
                    item.style.display = '';
                });
                [].forEach.call(toolbar.getElementsByClassName('markpen-toolbar-delete'), function(item){
                    item.style.display = 'none';
                });

                // set position and show it
                toolbar.style.position = 'fixed';
                toolbar.style.display = '';
                toolbar.style.top = top - toolbar.clientHeight + 'px';
                toolbar.style.left = left - (toolbar.clientWidth/2) + 'px';
            };

            var hideToolbar = function(){
                toolbar.style.display = 'none';
            };

            return {
                dom: toolbar,
                showToolbar: showToolbar,
                hideToolbar: hideToolbar
            };
        };
        that.toolbar = Toolbar();

        // auto show toolbar after select words
        dom.addEventListener('mouseup', function(){
            var range,
                startContainer,
                endContainer;

            if(!that._selection.isCollapsed){
                range = that._selection.getRangeAt(0);
                // highlight whether start and end points in same container
                startContainer = range.startContainer.nodeType === 3 ?
                                    range.startContainer.parentNode: range.startContainer;
                endContainer = range.endContainer.nodeType === 3 ?
                                    range.endContainer.parentNode : range.endContainer;

                if(startContainer === endContainer){
                    that._range = that._selection.getRangeAt(0);
                    that.toolbar.showToolbar();
                }
            }
        });

        // auto hide toolbar
        window.addEventListener('mouseup', function(){
            if(that._selection.isCollapsed){
                that.toolbar.hideToolbar();
            }
        });

        // change menu offset when window resize / scroll
        var setpos = function() {
            if(that.toolbar.dom.style.display !== 'none'){
                if(that.toolbar.dom.style.position !== 'absolute'){
                    that.toolbar.showToolbar();
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
