
;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // using AMD; register as anon module
        define(['jquery'], factory);
    } else {
        // no AMD; invoke directly
        factory( (typeof(jQuery) != 'undefined') ? jQuery : window.Zepto );
    }
}

(function($) {
'use strict';

var
//separator of format
SEPARATOR = '%',

//default multi style,unit px
DEFAULT_ITEM_WIDTH = 57,
DEFAULT_ITEM_SPACE = 3,

//default max width when multiple,unit px
DEFAULT_INPUT_MAX_WIDTH = 500,

//max loaded item at a time when show all(min:dropdownMaxItem + 1)
ALL_DROPDOWN_NUM = 100,

//default search box animate duration,unit ms
BOX_ANIMATE_TIME = 200,

//default search delay,unit ms
SEARCH_DELAY = 200,

//default dropdown button width,unit px
DROPDOWN_WIDTH = 24,

//key code
KEY = {
    BACKSPACE: 8,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
},

//cache doms string
doms = {
    wrapper: 'magicsearch-wrapper',
    box: 'magicsearch-box',
    arrow: 'magicsearch-arrow',
    items: 'multi-items',
    item: 'multi-item',
    close: 'multi-item-close'
},

isString = function(value) {
    return $.type(value) === 'string';
},
//transform string which like this : %username%
formatParse = function(format, data) {
    var fields = format.match(eval('/\\' + SEPARATOR + '[^\\' + SEPARATOR + ']+\\' + SEPARATOR + '/g'));
    for (var i = 0; i < fields.length; i++) {
        fields[i] = fields[i].replace(eval('/\\' + SEPARATOR + '/g'), '');
    }
    for (var i = 0; i < fields.length; i++) {
        format = format.replace(SEPARATOR + fields[i] + SEPARATOR, data[fields[i]] ? data[fields[i]] : 'error');
    }
    return format;
},
//delete px at ending
deletePx = function(value) {
    var index = value.lastIndexOf('px');
    return index < 0 ? Number(value) : Number(value.substring(0, index));
},
//transform to positive num
transform2PositiveNum = function(value, key) {
    if (! $.isNumeric(value)) {
        value = MagicSearch.defaults[key];
    } else {
        value = Math.ceil(Number(value));
        if (value <= 0) {
            value = MagicSearch.defaults[key];
        }
    }
    return value;
},
//constructor
MagicSearch = function(element, options) {
    this.element = element;
    this.$element = $(element);
    this.options = options;
};


MagicSearch.defaults = {
    dataSource: [],         //array or string or function(url?)
    id: '',                 //string
    fields: '',             //string or array
    format: '',             //string(function?)
    inputFormat: '',        //string
    maxShow: 5,             //int
    dropdownBtn: false,     //boolean
    dropdownMaxItem: 8,     //int
    multiple: false,        //boolean
    maxItem: true,          //boolean or int
    showMultiSkin: true,    //boolean
    multiStyle: {},         //object
    multiField: '',         //string
    focusShow: false,       //boolean
    noResult: '',           //string
    skin: '',               //string
    disableRule: function(data) {
        return false;
    },
    success: function($input, data) {
        return true;
    }
};

MagicSearch.prototype = {
    init: function() {
        //to ensure unique,plus one at init everytime
        window.MagicSearch.index += 1;
        this.options = $.extend({}, MagicSearch.defaults, this.options);

        this.props = {
            isFirstGetDataSource: true,
            style: $.extend({}, this.element.style)
        };

        //can bind on input text only
        if (! this.$element.is('input:text')) {
            console.error('magicsearch: Can not bind magicsearch to other elements except input which type is text.');
            return false;
        }

        //init options
        if (! isString(this.options.id) || this.options.id == '') {
            console.error('magicsearch: The option id must be a string which is not empty.');
            return false;
        }
        if ($.isFunction(this.options.dataSource)) {
            this.options.dataSource = this.options.dataSource(this.$element);
        }
        if (! this.options.dataSource) {
            this.options.dataSource = [];
        } else if (isString(this.options.dataSource)) {
            if (this.options.dataSource.toLowerCase() == 'null') {
                this.options.dataSource = [];
            } else {
                try {
                    this.options.dataSource = $.parseJSON(this.options.dataSource);
                    if (! $.isArray(this.options.dataSource)) {
                        var dataSource = [];
                        for (var id in this.options.dataSource) {
                            dataSource.push(this.options.dataSource[id]);
                        }
                        this.options.dataSource = dataSource;
                    }
                } catch (err) {
                    this.options.dataSource = [];
                    console.error('magicsearch: A problem is occured during parsing dataSource,please check.Index: ' + window.MagicSearch.index);
                }
            }
        } else if (! $.isArray(this.options.dataSource)) {
            var dataSource = [];
            for (var id in this.options.dataSource) {
                dataSource.push(this.options.dataSource[id]);
            }
            this.options.dataSource = dataSource;
        }
        if (isString(this.options.fields)) {
            this.options.fields = [this.options.fields == '' ? this.options.id : this.options.fields];
        } else if (! $.isArray(this.options.fields)) {
            this.options.fields = [this.options.id];
        }
        if (! isString(this.options.format) || this.options.format == '') {
            this.options.format = SEPARATOR + this.options.id + SEPARATOR;
        }
        this.options.maxShow = transform2PositiveNum(this.options.maxShow, 'maxShow');
        if (this.options.dropdownBtn) {
            this.options.dropdownMaxItem = transform2PositiveNum(this.options.dropdownMaxItem, 'dropdownMaxItem');
        }
        if (this.options.multiple) {
            if (this.options.maxItem !== true) {
                this.options.maxItem = transform2PositiveNum(this.options.maxItem, 'maxItem');
            }
            if (this.options.showMultiSkin) {
                if (! isString(this.options.multiField) || this.options.multiField == '') {
                    this.options.multiField = this.options.id;
                }
            }
            if (this.options.multiStyle) {
                DEFAULT_ITEM_SPACE = this.options.multiStyle.space ? this.options.multiStyle.space : DEFAULT_ITEM_SPACE;
                DEFAULT_ITEM_WIDTH = this.options.multiStyle.width ? this.options.multiStyle.width : DEFAULT_ITEM_WIDTH;
            }
        }
        if (! $.isFunction(this.options.success)) {
            this.options.success = function($input, data) {
                return true;
            };
        }
        if (! $.isFunction(this.options.disableRule)) {
            this.options.disableRule = function(data) {
                return false;
            };
        }
        this.props.styles = {
            borderTopWidth: deletePx(this.$element.css('border-top-width')),
            borderRightWidth: deletePx(this.$element.css('border-right-width')),
            borderBottomWidth: deletePx(this.$element.css('border-bottom-width')),
            borderLeftWidth: deletePx(this.$element.css('border-left-width')),
            paddingTop: deletePx(this.$element.css('padding-top')),
            paddingRight: deletePx(this.$element.css('padding-right')),
            paddingBottom: deletePx(this.$element.css('padding-bottom')),
            paddingLeft: deletePx(this.$element.css('padding-left')),
            maxWidth: deletePx(this.$element.css('max-width')) || DEFAULT_INPUT_MAX_WIDTH
        };
        this.props.styles.height = this.$element.height() + this.props.styles.borderTopWidth + this.props.styles.borderBottomWidth + this.props.styles.paddingTop + this.props.styles.paddingBottom;
        this.props.styles.sightHeight = this.props.styles.height - this.props.styles.borderTopWidth - this.props.styles.borderBottomWidth;
        this.props.styles.width = this.$element.width() + this.props.styles.borderLeftWidth + this.props.styles.borderRightWidth + this.props.styles.paddingLeft + this.props.styles.paddingRight;
        //end init options

        //init doms
        var $input = this.$element;
        var styles = this.props.styles;
        var ids = $input.attr('data-id');
        if ($input.parent().attr('data-belong') !== 'magicsearch') {
            var $wrapper = $('<div class="' + doms.wrapper + ' ' + this.options.skin + '" data-belong="magicsearch"></div>');
            $wrapper.css('width', styles.width);
            $input.wrap($wrapper);
        }
        var $magicsearch_wrapper = $input.parent();
        //init magicsearch wrapper
        $magicsearch_wrapper.css({
            'display': $input.css('display'),
            'float': $input.css('float'),
            'margin': $input.css('margin')
        });
        $magicsearch_wrapper.attr('data-index', window.MagicSearch.index);

        //init input
        $input.css({
            'margin': 0,
            'box-sizing': 'border-box',
            'width': styles.width,
            'height': styles.height
        });
        if ($input.attr('placeholder')) {
            $input.attr('data-placeholder', $input.attr('placeholder'));
        }
        $input.removeAttr('disabled');
        if (ids === undefined) {
            $input.attr('data-id', '');
            ids = '';
        }
        //init multi items
        if (this.options.multiple) {
            $input.addClass('multi');
            if (this.options.showMultiSkin && $magicsearch_wrapper.find('.' + doms.items).length == 0) {
                var $items = $('<div class="' + doms.items + '"></div>');
                $items.css({
                    'top': DEFAULT_ITEM_SPACE + styles.borderTopWidth,
                    'left': DEFAULT_ITEM_SPACE + styles.borderLeftWidth,
                    'bottom': DEFAULT_ITEM_SPACE + styles.borderBottomWidth,
                    'right': DEFAULT_ITEM_SPACE + styles.borderRightWidth + (this.options.dropdownBtn ? DROPDOWN_WIDTH : 0)
                });
                $magicsearch_wrapper.append($items);
            }
        }

        //init magicsearch box
        if ($magicsearch_wrapper.find('.' + doms.box).length == 0) {
            $magicsearch_wrapper.append('<div class="' + doms.box + '"></div>');
        }
        $magicsearch_wrapper.find('.' + doms.box).css({
            'top': styles.height
        });

        //init magicsearch arrow
        if (this.options.dropdownBtn) {
            var $arrow = $('<div class="' + doms.arrow + '"><i></i></div>');
            $input.addClass('dropdown');
            $input.css('padding-right', styles.paddingRight + DROPDOWN_WIDTH);
            $arrow.css({
                'top': styles.borderTopWidth,
                'bottom': styles.borderBottomWidth,
                'right': styles.borderRightWidth
            });
            $magicsearch_wrapper.append($arrow);
        }

        if (this.options.multiple) {
            var idArr = ids ? ids.split(',') : [];

            if (this.options.maxItem !== true && idArr.length >= this.options.maxItem) {
                $input.attr('disabled', 'disabled');
                $magicsearch_wrapper.addClass('disabled');
            }

            //init default style
            if (this.options.showMultiSkin) {
                var hasSetId = [];
                for (var i = 0; i < idArr.length; i++) {
                    var data = {};
                    hasSetId.push(idArr[i]);
                    for (var j = 0; j < this.options.dataSource.length; j++) {
                        if (this.options.dataSource[j][this.options.id] == idArr[i]) {
                            data = this.options.dataSource[j];
                            break;
                        }
                    }
                    $input.attr('data-id',hasSetId.join(','));
                    this.appendHtml(data);
                }
            }
        } else {
            if (ids != '') {
                for (var i = 0; i < this.options.dataSource.length; i++) {
                    if (this.options.dataSource[i][this.options.id] == ids) {
                        $input.val(formatParse(this.options.format, this.options.dataSource[i]));
                        break;
                    }
                }
            }
        }
        return this;
    },
    destroy: function() {
        var $input = this.$element,
            $magicsearch_wrapper = $input.parent();
        if ($magicsearch_wrapper.attr('data-belong') === 'magicsearch') {
            var ids = $input.attr('data-id'),
                idArr = ids ? ids.split(',') : [];
            $input.css({
                'margin': $magicsearch_wrapper.css('margin'),
                'padding-left': deletePx($input.css('padding-left')) - idArr.length * (DEFAULT_ITEM_WIDTH + DEFAULT_ITEM_SPACE)
            });
            $input.removeClass('dropdown multi').removeAttr('disabled data-id');
            $input.off();
            $input.siblings().remove();
            $input.unwrap();
        }
    },
    getDataSource: function() {
        var dataSource = this.options.dataSource;
        if (this.props.isFirstGetDataSource) {
            for (var i = 0; i < dataSource.length; i++) {
                for (var key in dataSource[i]) {
                    this.options.dataSource[i][key] = String(dataSource[i][key]);
                }
            }
            this.props.isFirstGetDataSource = false;
        }
        return this.options.dataSource;
    },
    setData: function() {
        var $input = this.$element,
            $magicsearch_wrapper = $input.parent(),
            $magicsearch_box = $magicsearch_wrapper.find('.' + doms.box),
            $magicsearch_arrow = $magicsearch_wrapper.find('.' + doms.arrow),
            $ishover = $magicsearch_box.find('li.ishover');
        var options = this.options,
            ids = $input.attr('data-id'),
            data = {};
        data[options.id] = $ishover.attr('data-id');
        options.fields.forEach(function(field) {
            data[field] = $ishover.attr('data-' + field.toLowerCase());
        });
        if (options.multiple) {
            if ($magicsearch_box.is(':hidden')) {
                return;
            }
            $input.val('');

            var idArr = ids ? ids.split(',') : [];
            if (options.maxItem !== true && idArr.length >= options.maxItem) {
                return this;
            }
            idArr.push($ishover.attr('data-id'));
            if (options.maxItem !== true && idArr.length == options.maxItem) {
                $input.attr('disabled', 'disabled');
                $magicsearch_wrapper.addClass('disabled');
            }
            $input.attr('data-id', idArr.join(','));
            if (options.showMultiSkin) {
                this.appendHtml(data);
            }
        } else {
            $input.val($ishover.text());
            $input.attr('data-id', $ishover.attr('data-id'));
        }
        options.success($input, data);
        return this;
    },
    deleteData: function(id) {
        var $input = this.$element,
            $magicsearch_wrapper = $input.parent(),
            $magicsearch_box = $magicsearch_wrapper.find('.' + doms.box),
            $magicsearch_arrow = $magicsearch_wrapper.find('.' + doms.arrow);
        var delIdArr = id ? id.split(',') : [],
            ids = $input.attr('data-id'),
            idArr = ids ? ids.split(',') : [],
            options = this.options,
            styles = this.props.styles;

        for (var i = 0; i < delIdArr.length; i++) {
            $magicsearch_wrapper.find('.' + doms.item + '[data-id="' + delIdArr[i] + '"]').fadeOut(400, function() {
                $(this).remove();
            });
            idArr.splice(idArr.indexOf(delIdArr[i]), 1);
        }
        setTimeout(function() {
            var maxLineItem = parseInt((styles.maxWidth - (options.dropdownBtn ? DROPDOWN_WIDTH : 0) - styles.borderLeftWidth - styles.borderRightWidth - DEFAULT_ITEM_SPACE) / (DEFAULT_ITEM_WIDTH + DEFAULT_ITEM_SPACE));
            var lineNum = parseInt(idArr.length / maxLineItem);
            $input.attr('data-id', idArr.join(','));
            $magicsearch_wrapper.removeClass('disabled');
            $input.removeAttr('disabled');
            if (idArr.length == 0 && $input.attr('data-placeholder')) {
                $input.attr('placeholder', $input.attr('data-placeholder'));
            }
            $input.css('padding-left', (idArr.length % maxLineItem) * (DEFAULT_ITEM_WIDTH + DEFAULT_ITEM_SPACE) + styles.paddingLeft);
            $input.css('height', styles.height + lineNum * styles.sightHeight);
            $input.css('padding-top', lineNum * styles.sightHeight + styles.paddingTop);
            $magicsearch_box.css('top', styles.height + lineNum * styles.sightHeight);
            if (lineNum == 0) {
                var minWidth = (idArr.length % maxLineItem + 1) * (DEFAULT_ITEM_WIDTH + DEFAULT_ITEM_SPACE) + DEFAULT_ITEM_SPACE * 2 + styles.borderLeftWidth + styles.borderRightWidth + (options.dropdownBtn ? DROPDOWN_WIDTH : 0);
                $input.css('min-width', minWidth);
                $magicsearch_wrapper.css('min-width', minWidth);
            }
        }, 400);
    },
    searchData: function(isAll, isScroll) {
        var $input = this.$element,
            $magicsearch_box = $input.parent().find('.' + doms.box);

        var options = this.options,
            dataJson = this.getDataSource(),
            ids = $input.attr('data-id'),
            idArr = ids ? ids.split(',') : [],
            inputVal = $.trim($input.val()),
            htmlStr = '',
            data = [],
            isAppendHtml = true;

        //if is not scroll,clean all items first
        if (isScroll !== true) {
            $magicsearch_box.html('');
        }
        if (inputVal == '' && ! isAll) {
            return this;
        }
        //get the match data
        if (! options.multiple && ids != '' && ! isAll) {//when focus input during single selection
            for (var i = 0; i < dataJson.length; i++) {
                if (dataJson[i][options.id] == ids) {
                    data.push(dataJson[i]);
                    break;
                }
            }
        } else if (isAll) {
            var page = $input.data('page') || 1;
            data = dataJson.slice(0);
            //skip selected data
            for (var i = 0, num = 0; i < data.length; i++) {
                var index = idArr.indexOf(data[i][options.id]);
                if (index > -1) {
                    data.splice(i, 1);
                    num++;
                    i--;
                    if (num == idArr.length) {
                        break;
                    }
                }
            }
            //if page less than total page,page plus one
            if (page <= Math.ceil(data.length / ALL_DROPDOWN_NUM)) {
                $input.data('page', page + 1);
            }
            data = data.slice((page - 1) * ALL_DROPDOWN_NUM, page * ALL_DROPDOWN_NUM);
            //will not appending html if data's length is zero when scrolling
            if (page != 1 && data.length == 0) {
                isAppendHtml = false;
            }
        } else {
            var inputVals = inputVal.toLowerCase().split(' ');
            var inputData = [];
            for (var i = 0; i < inputVals.length; i++) {
                if (inputVals[i] === '') {
                    continue;
                }
                inputData.push({value: inputVals[i], flag: false});
            }
            //search match data
            for (var i = 0; i < dataJson.length; i++) {
                //skip selected
                if (idArr.indexOf(dataJson[i][options.id]) > -1) {
                    continue;
                }
                inputData = inputData.map(function(item) {
                    item.flag = false;
                    return item;
                });
                for (var j = 0; j < options.fields.length; j++) {
                    for (var k = 0; k < inputData.length; k++) {
                        if (dataJson[i][options.fields[j]] != null && dataJson[i][options.fields[j]].toLowerCase().indexOf(inputData[k].value) > -1) {
                            inputData[k].flag = true;
                        }
                    }
                    var isMatch = inputData.every(function(item) {
                        return item.flag;
                    });
                    if (isMatch) {
                        data.push(dataJson[i]);
                        break;
                    }
                }
                if (data.length >= options.maxShow) {
                    break;
                }
            }
        }

        //generate html string
        if (data.length == 0) {
            var noResult = options.noResult ? options.noResult : '&#x672a;&#x641c;&#x7d22;&#x5230;&#x7ed3;&#x679c;';
            htmlStr = '<span class="no-result">' + noResult + '</span>';
        } else {
            //delete empty input
            var inputVals = inputVal.split(' ').filter(function(item) {
                return item !== '';
            });
            //locate highlight chars
            var dataHighlight = $.extend(true, [], data);
            data.forEach(function(item, index) {
                options.fields.forEach(function(field) {
                    var posArr = [];
                    if (item[field] != null) {
                        for (var i = 0; i < item[field].length; i++) {
                            posArr[i] = 0;
                        }
                        inputVals.forEach(function(value) {
                            var position = item[field].toLowerCase().indexOf(value.toLowerCase());
                            if (position > -1) {
                                for (var i = position; i < value.length + position; i++) {
                                    posArr[i] = 1;
                                }
                            }
                        });
                    }
                    var tmpPosArr = [];
                    var hasStarted = false, start = -1, length = 0;
                    for (var i = posArr.length - 1; i >= 0; i--) {
                        if (posArr[i] == 1) {
                            if (! hasStarted) {
                                hasStarted = true;
                                start = i;
                            } else {
                                start--;
                            }
                            length++;
                            if (i == 0) {
                                tmpPosArr.push({start: start, length: length});
                            }
                        } else {
                            if (hasStarted) {
                                hasStarted = false;
                                tmpPosArr.push({start: start, length: length});
                                length = 0;
                            }
                        }
                    }
                    if (dataHighlight[index][field] !== undefined) {
                        dataHighlight[index][field] = tmpPosArr;
                    }
                });
            });

            htmlStr += '<ul>';
            data.forEach(function(item, index) {
                var tmpItem = $.extend({}, item);
                htmlStr += '<li class="';
                htmlStr += options.disableRule(item) ? 'disabled' : 'enabled';
                htmlStr += '" data-id="' + (item[options.id] === undefined ? '' : item[options.id]) + '"';
                options.fields.forEach(function(field) {
                    htmlStr += ' data-' + field.toLowerCase() + '="' + (item[field] === undefined ? '' : item[field]) + '"';
                    if (item[field] != null) {
                        dataHighlight[index][field].forEach(function(value) {
                            var matchStr = tmpItem[field].substr(value.start, value.length);
                            tmpItem[field] = tmpItem[field].replace(eval('/' + matchStr + '/i'), '<span class="keyword">' + matchStr + '</span>');
                        });
                    }
                });
                htmlStr += ' title="' + formatParse(options.format, item) + '">' + formatParse(options.format, tmpItem) + '</li>';
            });
            htmlStr += '</ul>';
        }

        //create dom
        if (isAll) {
            if (isAppendHtml) {
                $magicsearch_box.html($magicsearch_box.html() + htmlStr);
            }
            $magicsearch_box.addClass('all');
        } else {
            $magicsearch_box.html(htmlStr);
            $magicsearch_box.removeClass('all').css('max-height', 'none');
        }
        return this;
    },
    showSearchBox: function(callback) {
        var $input = this.$element,
            $magicsearch_wrapper = $input.parent(),
            $magicsearch_box = $magicsearch_wrapper.find('.' + doms.box);
        if ($magicsearch_box.is(':visible')) {
            return false;
        }
        //rotate the dropdown button 180deg
        if (this.options.dropdownBtn) {
            var $magicsearch_arrow = $magicsearch_wrapper.find('.' + doms.arrow);
            $magicsearch_arrow.removeClass('arrow-rotate-360');
            $magicsearch_arrow.addClass('arrow-rotate-180');
        }
        $magicsearch_box.slideDown(BOX_ANIMATE_TIME, callback);
        return this;
    },
    hideSearchBox: function(isClear) {
        var $input = this.$element,
            $magicsearch_wrapper = $input.parent(),
            $magicsearch_box = $magicsearch_wrapper.find('.' + doms.box);
        if (! $magicsearch_box.is(':visible')) {
            return false;
        }

        if (isClear === undefined) {
            if (this.options.isClear && (this.options.multiple || $input.attr('data-id') == '')) {
                $input.val('');
            }
        } else {
            if (isClear) {
                $input.val('');
            }
        }
        //rotate the dropdown button 360deg
        if (this.options.dropdownBtn) {
            var $magicsearch_arrow = $magicsearch_wrapper.find('.' + doms.arrow);
            $magicsearch_arrow.removeClass('arrow-rotate-180');
            $magicsearch_arrow.addClass('arrow-rotate-360');
        }
        setTimeout(function() {
            $magicsearch_box.scrollTop(0);
        }, BOX_ANIMATE_TIME - 1);
        $magicsearch_box.slideUp(BOX_ANIMATE_TIME, function() {
            $magicsearch_box.html('');
        });
        return this;
    },
    appendHtml: function(data) {
        var $input = this.$element,
            $magicsearch_wrapper = $input.parent(),
            $magicsearch_box = $magicsearch_wrapper.find('.' + doms.box),
            $magicsearch_arrow = $magicsearch_wrapper.find('.' + doms.arrow),
            $ishover = $magicsearch_box.find('li.ishover');
        var options = this.options,
            styles = this.props.styles,
            that = this;

        var idArr = $input.attr('data-id').split(',');
        if ($input.attr('placeholder')) {
            $input.removeAttr('placeholder');
        }
        var maxLineItem = parseInt((styles.maxWidth - (options.dropdownBtn ? DROPDOWN_WIDTH : 0) - styles.borderLeftWidth - styles.borderRightWidth - DEFAULT_ITEM_SPACE) / (DEFAULT_ITEM_WIDTH + DEFAULT_ITEM_SPACE));

        //create item and insert into items
        var $item = $('<div class="' + doms.item + '" data-id="' + data[options.id] + '" title="' + formatParse(options.format, data) + '"><span>' + formatParse(SEPARATOR + options.multiField + SEPARATOR, data) + '</span><a class="' + doms.close + '" data-id="' + data[options.id] + '" href="javascript:void(0);"></a></div>');
        $item.css({
            'height': styles.sightHeight - DEFAULT_ITEM_SPACE * 2,
            'width': DEFAULT_ITEM_WIDTH,
            'margin-bottom': DEFAULT_ITEM_SPACE * 2,
            'margin-right': DEFAULT_ITEM_SPACE
        });

        var lineNum = parseInt(idArr.length / maxLineItem);
        $input.css('padding-left', deletePx($input.css('padding-left')) + DEFAULT_ITEM_WIDTH + DEFAULT_ITEM_SPACE);
        if (idArr.length % maxLineItem == 0) {
            $input.css('padding-left', styles.paddingLeft);
            $input.css('height', styles.height + lineNum * styles.sightHeight);
            $input.css('padding-top', lineNum * styles.sightHeight);
            $magicsearch_box.css('top', styles.height + lineNum * styles.sightHeight);
        } else {
            if (lineNum == 0) {
                var minWidth = (idArr.length % maxLineItem + 1) * (DEFAULT_ITEM_WIDTH + DEFAULT_ITEM_SPACE) + DEFAULT_ITEM_SPACE * 2 + styles.borderLeftWidth + styles.borderRightWidth + (options.dropdownBtn ? DROPDOWN_WIDTH : 0);
                $input.css('min-width', minWidth);
                $magicsearch_wrapper.css('min-width', minWidth);
            }
        }

        //bind click event on delete button
        $item.find('.' + doms.close).click(function() {
            that.deleteData($(this).attr('data-id'));
        });
        $magicsearch_wrapper.find('.' + doms.items).append($item);
    }
}

$.fn.magicsearch = function(options) {
    var hasDropdownBtn = false;
    var searchTimeout = null;
    var preInput = '';
    var jqo = this.each(function() {
        var $this = $(this);
        var magicSearch = $.data(this, 'magicsearch');
        if (magicSearch) {
            magicSearch.destroy();
        }
        magicSearch = new MagicSearch(this, options);
        if (magicSearch.init() === false) {
            return;
        }
        $.data(this, 'magicsearch', magicSearch);
        var selfOptions = magicSearch.options;
        var $magicsearch_wrapper = $this.parent(),
            $magicsearch_box = $magicsearch_wrapper.find('.' + doms.box);
        var blurFunc = function() {
            magicSearch.hideSearchBox();
            if (selfOptions.multiple && selfOptions.showMultiSkin) {
                $magicsearch_wrapper.find('.' + doms.item + '.current').removeClass('current');
            }
        };
        var dropdown = function() {
            if ($magicsearch_wrapper.hasClass('disabled')) {
                return false;
            }
            if ($magicsearch_box.is(':visible')) {
                magicSearch.hideSearchBox();
            } else {
                $magicsearch_box.css({
                    'max-height': selfOptions.dropdownMaxItem * 30 + 8
                });
                $magicsearch_box.unbind('scroll');
                $this.data('page', 1);
                magicSearch.searchData(true).showSearchBox(function() {
                    $magicsearch_box.on('scroll', function(e) {
                        if ((this.scrollHeight - $(this).scrollTop()) < 300) {
                            magicSearch.searchData(true, true);
                        }
                    });
                });
            }
        };
        $this.off().on('keyup', function(e) {
            var $_this = $(this);
            if (e.which == KEY.ESC) {
                $_this.val('').focus();
                magicSearch.hideSearchBox();
            } else if (e.which == KEY.DOWN) {
                var $li = $magicsearch_box.find('li');
                var $ishover = $magicsearch_box.find('li.ishover');
                if ($li.length > 0) {
                    if ($ishover.length > 0) {
                        $ishover.toggleClass('ishover');
                        if ($ishover.next().length > 0) {
                            $ishover.next().toggleClass('ishover');
                        } else {
                            $magicsearch_box.find('li:first').toggleClass('ishover');
                        }
                    } else {
                        $magicsearch_box.find('li:first').toggleClass('ishover');
                    }
                }
                return false;
            } else if (e.which == KEY.UP) {
                var $li = $magicsearch_box.find('li');
                var $ishover = $magicsearch_box.find('li.ishover');
                if ($li.length > 0) {
                    if ($ishover.length > 0) {
                        $ishover.toggleClass('ishover');
                        if ($ishover.prev().length > 0) {
                            $ishover.prev().toggleClass('ishover');
                        } else {
                            $magicsearch_box.find('li:last').toggleClass('ishover');
                        }
                    } else {
                        $magicsearch_box.find('li:last').toggleClass('ishover');
                    }
                }
                return false;
            } else if (e.which == KEY.ENTER) {
                var $ishover = $magicsearch_box.find('li.ishover');
                if ($ishover.length > 0) {
                    magicSearch.setData().hideSearchBox();
                }
            } else if (e.which == KEY.LEFT || e.which == KEY.RIGHT) {
                return true;
            } else {
                var currentInput = $_this.val();
                if ($.trim(preInput) == $.trim(currentInput)) {
                    return true;
                }
                if (currentInput != '') {
                    if ($.trim(currentInput) == '') {
                        magicSearch.hideSearchBox((e.which == KEY.BACKSPACE || e.which == KEY.SPACE) ? false : undefined);
                        return false;
                    }
                    //hide search box when key up
                    if (! selfOptions.multiple && $_this.attr('data-id') != '') {
                        magicSearch.hideSearchBox();
                        return;
                    } else if (selfOptions.multiple && selfOptions.showMultiSkin) {
                        $magicsearch_wrapper.find('.' + doms.items + ' .' + doms.item + '.current').removeClass('current');
                    }
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(function() {
                        magicSearch.searchData().showSearchBox();
                    }, SEARCH_DELAY);
                } else {
                    magicSearch.hideSearchBox();
                }
            }
        }).on('keydown', function(e) {
            var $_this = $(this);
            if (e.which == KEY.ESC) {
            } else if (e.which == KEY.UP) {
                return false;
            } else if (e.which == KEY.DOWN) {
                return false;
            } else if (e.which == KEY.ENTER) {
                return ! $magicsearch_box.is(':visible');
            } else if (e.which == KEY.BACKSPACE) {
                preInput = $_this.val();
                if (selfOptions.multiple) {
                    var $last_multi_item = $magicsearch_wrapper.find('.' + doms.items + ' .' + doms.item + ':last');
                    if (selfOptions.showMultiSkin && $_this.val() == '') {
                        if ($last_multi_item.hasClass('current')) {
                            magicSearch.deleteData($last_multi_item.attr('data-id'));
                        } else {
                            $last_multi_item.addClass('current');
                        }
                    }
                } else {
                    if ($(this).attr('data-id') != '') {
                        $(this).val('');
                        $(this).attr('data-id', '');
                        magicSearch.hideSearchBox();
                    }
                }
            } else if (e.which == KEY.LEFT || e.which == KEY.RIGHT) {
                return true;
            } else {
                preInput = $_this.val();
                if (preInput != '') {
                    //set empty value when key down
                    if (! selfOptions.multiple && $_this.attr('data-id') != '') {
                        $_this.val('');
                        $_this.attr('data-id', '');
                        return;
                    }
                }
            }
        }).on('focus', function() {
            if ($(this).val() != '') {
                magicSearch.searchData().showSearchBox();
            } else if (selfOptions.focusShow) {
                dropdown();
            }
        }).on('blur', blurFunc);

        $magicsearch_box.off().on('mouseenter','ul', function() {
            $this.unbind('blur');
        }).on('mouseleave','ul', function() {
            $this.blur(blurFunc);
        }).on('mouseenter','li', function() {
            $(this).parent().find('li.ishover').removeClass('ishover');
            $(this).addClass('ishover');
        }).on('mouseleave','li', function() {
            $(this).removeClass('ishover');
        }).on('click','li', function() {
            magicSearch.setData().hideSearchBox();
        });

        //When the option of dropdownBtn is true,bind the related event
        if (selfOptions.dropdownBtn) {
            hasDropdownBtn = true;
            $magicsearch_wrapper.on('click', '.' + doms.arrow, function() {
                dropdown();
            });
        }
        $this.on('clear', function() {
            $this.val('');
            if (selfOptions.multiple) {
                if (selfOptions.showMultiSkin) {
                    magicSearch.deleteData($this.attr('data-id'));
                } else {
                    $this.attr('data-id', '');
                }
            } else {
                $this.attr('data-id', '');
            }
        }).on('update', function(e, options) {
            //update dataSource
            if (options.dataSource !== undefined) {
                var tmpDataSource = options.dataSource;
                if (isString(tmpDataSource)) {
                    if (options.dataSource.toLowerCase() == 'null') {
                        tmpDataSource = [];
                    } else {
                        try {
                            tmpDataSource = $.parseJSON(options.dataSource);
                            if (! $.isArray(tmpDataSource)) {
                                var dataSource = [];
                                for (var id in tmpDataSource) {
                                    dataSource.push(tmpDataSource[id]);
                                }
                                tmpDataSource = dataSource;
                            }
                        } catch (err) {
                            tmpDataSource = [];
                            console.error('magicsearch: The dataSource you updated is wrong,please check.');
                        }
                    }
                }
                magicSearch.props.isFirstGetDataSource = true;
                magicSearch.options.dataSource = tmpDataSource;
            }
        }).on('destroy', function() {
            $.data(this, 'magicsearch').destroy();
        });
        $magicsearch_wrapper.on('click', '.' + doms.items, function(e) {
            if ($(e.target).is('.' + doms.items)) {
                $this.focus();
            }
        });
    });

    if (hasDropdownBtn && ! window.MagicSearch.hasBindBody) {
        $('body').on('mousedown', function(e) {
            var $target = $(e.target),
                $magicsearch_wrapper = $(this).find('.' + doms.wrapper + ' .' + doms.box + ':visible').first().parent(),
                $input = $magicsearch_wrapper.find('input:text');
            var index = $magicsearch_wrapper.attr('data-index');
            if (index !== undefined && ! $target.is('.' + doms.wrapper + '[data-index="' + index + '"] *')) {
                $.data($input.get(0), 'magicsearch').hideSearchBox();
            }
        });
        window.MagicSearch.hasBindBody = true;
    }
    return jqo;
};

window.MagicSearch = {
    v: '2.0.0',
    index: 0,
    hasBindBody: false
};

}));
