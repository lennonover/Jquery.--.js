/**
 * 注：这个日期插件参考oasis和网上众多日期插件
 * 根据公司现有模块化规范兼容AMD
 * 版本0.1
 * [description]
 * @return {[type]}  
 */
;(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(jQuery);
  }

})(function($) {
  'use strict';

  var incal = false;
  //为了拿到整个对象做标记
  var namespace = 'calendar-id';
  var _slice    = Array.prototype.slice;
  var _toString = Object.prototype.toString;

  var dateTemplate = 'yyyy-MM-dd hh:mm:ss';
  var dataDateTemp = 'yyyyMMdd';
  var weekText = '日 一 二 三 四 五 六';
  var monthText = '一月 二月 三月 四月 五月 六月 七月 八月 九月 十月 十一月 十二月';
  var config = {
      style          : null,         // 主题类型
      size           : 0,            // 赋值格式(年，月，日，时，分，秒)的前几位
      active         : false,        // 是否自动打开
      closable       : true,         // 是否能关闭日期视窗
      enable         : new Array(2), // 可触发事件日期，可设置为区间，闭合区间 [undefined, new Date]
      zIndex         : 999,
      format         : dateTemplate,
      date           : null,         // 默认初始化视窗日期，文本框调用时无效
      weekStart      : 0,            // 视图中星期起始
      weekText       : weekText,
      monthText      : monthText,
      timeText       : '时分秒',
      time           : false,        // 是否显示时分秒编辑视窗
      todayBtn       : false,        // 是否显示今天按钮
      todayText      : '今天',
      clearBtn       : false,        // 是否显示清除按钮,
      clearText      : '清除',
      sureBtn        : false,        // 是否显示确定按钮
      sureText       : '确定',

      clear          : null,         // 清除方法
      change         : null,         // 值变化后方法
      after          : null,         // 生成月试图之后，对每日做特殊处理
      dateClick      : null,         // 日期点击事件
      dateMouseover  : null,         // 日期鼠标悬停
      dateMouseleave : null          // 日期鼠标离开
    };

  var viewMode = {
    'month': 'VIEW_MODE_MONTH',
    'year': 'VIEW_MODE_YEAR',
    'ten': 'VIEW_MODE_TEN',
    'century': 'VIEW_MODE_CENTURY'
  };

  var today = new Date;

  var Utils = {

    /**
     * 生成随机字符串
     * @param prefix 在随机字符串前面添加指定前缀
     * @returns {string}
     */
    random: function (prefix) {
      return (prefix || '') + Math.random().toString(36).substr(2);
    },

    /**
     * 判断是否为Date类型
     */
    isDate: function (target) {
      return _toString.call(target) === '[object Date]';
    },

    /**
     * 数字格式化
     * @param  {[type]} target [description]
     * @return {[type]}        [description]
     */
    lenNum: function (target) {
      return target > 9 ? '' + target : '0' + target;
    },

    /**
     * 转化日期为指定格式字符串
     */
    formatDate: function (target, format) {
      format = format || dateTemplate;
      var result = format.replace(/yyyy/, target.getFullYear());
      result = result.replace(/MM/, this.lenNum(target.getMonth() + 1));
      result = result.replace(/dd/, this.lenNum(target.getDate()));
      result = result.replace(/hh/, this.lenNum(target.getHours()));
      result = result.replace(/mm/, this.lenNum(target.getMinutes()));
      return result.replace(/ss/, this.lenNum(target.getSeconds()));
    },

    /**
     * 根据格式转字符串为日期对象
     */
    toDate: function (target, format) {
      var result = new Date;
      if (!target) {
        return result;
      }
      target = target.toString();
      format = format || dateTemplate;

      var yearIndex = format.indexOf('yyyy');
      var monthIndex = format.indexOf('MM');
      var dateIndex = format.indexOf('dd');
      var hourIndex = format.indexOf('hh');
      var minuteIndex = format.indexOf('mm');
      var secondIndex = format.indexOf('ss');
      var length = target.length + 1;

      var year = 1970, month = 0, date = 1, hour = 0, minute = 0, second = 0;

      if (yearIndex > -1 && length > yearIndex + 4) {
        year = target.substr(yearIndex, 4) - 0;
      }
      if (monthIndex > -1 && length > monthIndex + 2) {
        month = target.substr(monthIndex, 2) - 1;
      }
      if (dateIndex > -1 && length > dateIndex + 2) {
        date = target.substr(dateIndex, 2) - 0;
      }
      if (hourIndex > -1 && length > hourIndex + 2) {
        hour = target.substr(hourIndex, 2) - 0;
      }
      if (minuteIndex> -1 && length > minuteIndex + 2) {
        minute = target.substr(minuteIndex, 2) - 0;
      }
      if (secondIndex > -1 && length > secondIndex + 2) {
        second = target.substr(secondIndex, 2) - 0;
      }
      result.setFullYear(year, month, date);
      result.setHours(hour, minute, second);
      return result;
    },

    /**
     * 转换日期为指定格式的日期
     */
    date2Str: function (date, format, size) {
      format = format || dateTemplate;
      size = size || 6;
      var reg = null;
      switch (size) {
        case 1: reg = /[^a-zA-Z]*MM.*/;
          break;
        case 2: reg = /[^a-zA-Z]*dd.*/;
          break;
        case 3: reg = /[^a-zA-Z]*hh.*/;
          break;
        case 4: reg = /[^a-zA-Z]*mm.*/;
          break;
        case 5: reg = /[^a-zA-Z]*ss.*/;
          break;
      }
      if (reg) {
        format = format.replace(reg, '');
      }
      return this.formatDate(date, format);
    },

    /**
     * 转换日期时间为纯数字
     * @param date
     * @returns {string}
     */
    fullDate: function (date) {
      return this.date2Str(date, dateTemplate, 6).match(/\d/g).join('');
    },

    /**
     * 比较两个日期，可以为字符串比较
     */
    compareDate: function (source, target, size) {
      size = size || 6;
      var d1 = this.isDate(source) ? this.date2Str(source, null, size) : source;
      var d2 = this.isDate(target) ? this.date2Str(target, null, size) : target;
      return d1.match(/\d/g).join('') - d2.match(/\d/g).join('');
    },

    isToday: function (date) {
      return this.isDate(date) ? this.compareDate(date, today, 3) === 0 : false;
    },

    /**
     * 判断DOM元素是否为INPUT:TEXT
     */
    isTextElement: function (el) {
      return (el && el.nodeName && el.nodeName === 'INPUT' && el.type === 'text');
    },

    /**
     * 计算当前年所在的10年范围
     */
    tenScope: function (year) {
      var s = Math.floor(year / 10);
      return s + '0' + '-' + s + '9';
    },

    /**
     * 计算当前年所在的100年范围
     */
    centuryScope: function (year) {
      var s = Math.floor(year / 100);
      return s + '00' + '-' + s + '99';
    },

    /**
     * 月份加法
     */
    addMonths: function (knownDate, scale) {
      var resultDate = new Date(knownDate);
      resultDate.setMonth(knownDate.getMonth() + scale + 1, 0); // 设置为预期月最后一天

      var kd = knownDate.getDate();
      var rd = resultDate.getDate();
      if (rd > kd) { // 最大日期大于预期，取预期日期
        resultDate.setDate(kd);
      }
      return resultDate;
    },

    /**
     * 年份加法
     */
    addYears: function (knownDate, scale) {
      var resultDate = new Date(knownDate);
      resultDate.setFullYear(knownDate.getFullYear() + scale, knownDate.getMonth() + 1, 0);

      var kd = knownDate.getDate();
      var rd = resultDate.getDate();
      if (rd > kd) {
        resultDate.setDate(kd);
      }
      return resultDate;
    }
  };
  /**
   * 设置弹出框位置
   */
  function setPosition (target, modal, zIndex) {
    var pos = target.offset();
    var height = target.outerHeight();
    var width = target.outerWidth();
    var $w = $(window);
    var wh = $w.outerHeight();
    var ww = $w.outerWidth();

    // 元素距离浏览器顶部的相对距离
    var relativeTop = pos.top - $w.scrollTop();

    var csser = {
      'position': 'absolute',
      'zIndex': zIndex
    };
    // target higher than half page
    if ( relativeTop < wh / 2) {
      csser.top = (pos.top + height + 1) + 'px';
      csser.bottom = 'auto';
      // target on right side
      if (pos.left > ww /2) {
        csser.right = (ww - width - pos.left) + 'px';
        csser.left = 'auto';
      } else {
        csser.right = 'auto';
        csser.left = pos.left + 'px';
      }
    } else {
      // target lower than half page
      csser.top = 'auto';
      csser.bottom = (wh - pos.top + 1) + 'px';
      // target on right side
      if (pos.left > ww /2) {
        csser.right = (ww - width - pos.left) + 'px';
        csser.left = 'auto';
      } else {
        csser.right = 'auto';
        csser.left = pos.left + 'px';
      }
    }

    modal.css(csser);
  }

  /**
   * 计算跨度时间
   */
  function span(scopes, direct, date) {
    var unit = scopes[0];
    var scale = scopes[1] - 0;
    var resultDate = new Date(date);

    if (unit === 'date') {
      resultDate.setDate(date.getDate() + (direct * scale));
    } else if (unit === 'month') {
      resultDate = Utils.addMonths(date, direct * scale);
    } else {
      resultDate = Utils.addYears(date, direct * scale);
    }
    return resultDate;
  }

  /**
   * 区间日期联动
   */
  function freshEnable(enable, date, touchable, scope, isStart) {
    var minDate = enable[0];
    var maxDate = enable[1];
    var tempDate = null;
    // 起始日期设定后控制结束日期
    if (isStart) {
      if (scope.length === 2) {
        tempDate = span(scope, 1, date);
        // 计算后值在最大预期范围内
        if (!maxDate || Utils.compareDate(tempDate, maxDate, 3) < 0) {
          maxDate = tempDate;
        }
      }
      minDate = touchable ? date : date.setDate(date.getDate() + 1);
    } else {
      if (scope.length === 2) {
        tempDate = span(scope, -1, date);
      }
      if (!minDate || Utils.compareDate(tempDate, minDate, 3) > 0) {
        minDate = tempDate;
      }
      maxDate = touchable ? date : date.setDate(date.getDate() - 1);
    }
    return [minDate, maxDate];
  }
  /**
   * 日期视图
   */
  function CalendarView(element, options) {
    this.element = element;
    this.$element = $(element);
    this.options = options;
    this.init();
  }
  CalendarView.prototype = {
    constructor: CalendarView,
    init: function () {
      // 判断触发元素是否为input:text
      // 是：日历插入body根元素
      // 否：日历插入触发元素内
      this.isText = Utils.isTextElement(this.element);

      // 初始化视图月份
      if (this.isText) {
        if (this.element.value) {
          this.calendar = new Calendar(this.element.value);
        }
      } else {
        this.calendar = new Calendar(this.options.date || new Date);
      }

      if (this.options.time && this.isText && this.calendar) {
        var datestr = this.calendar.toStr(dateTemplate, 6).match(/\d/g).join('');
        // 已经设定的时分秒
        this.hms = datestr.substring(8);
        // 已经设定的年月日
        this.ymd = datestr.substr(0, 8);
      }

      // 最小,最大日期
      this.minDate = this.options.enable[0];
      this.maxDate = this.options.enable[1];
      this.wrap();
    },

    // 生成html
    wrap: function () {
      var id = Utils.random('calendar');
      var btnCount = !!this.options.todayBtn + !!this.options.clearBtn + !!this.options.sureBtn;
      var h = [
        '<div class="calendar" id="' + id + '">',
        ' <div class="calendar-top"></div>',
        ' <div class="calendar-body"></div>',
        ' <div class="calendar-foot calendar-btn-count-' + btnCount + '"></div>',
        '</div>'
      ];

      if (this.isText) {
        $('body').append(h.join(''));
      } else {
        this.$element.append(h.join(''));
      }

      this.$wrap = $('#' + id);
      this.$top = this.$wrap.find('.calendar-top');
      this.$body = this.$wrap.find('.calendar-body');
      this.$foot = this.$wrap.find('.calendar-foot');

      if (this.options.closable) {
        this.$wrap.addClass('calendar-closable');
      }

      if (this.options.style) {
        this.$wrap.addClass('calendar-theme-' + this.options.style);
      }

      if (this.options.time) {
        this.addTime();
      }

      if (this.options.todayBtn) {
        this.addToday();
      }

      if (this.options.clearBtn) {
        this.addClear();
      }
      if (this.options.sureBtn) {
        this.addSure();
      }
      // 自动打开，添加打开状态样式
      if (this.options.active) {
        this.open();
      }
      this.listen();
    },

    getTimeText: function (time, type) {
      var attr = 'type="text" maxlength="2" readonly="readonly"';
      return '<input ' + attr + ' value="' + time + '" class="calendar-' + type + '"/>';
    },
    addTime: function () {
      var html = [
        '<div class="calendar-time">',
        ' <div class="calendar-time-box calendar-hour">',
        this.getTimeText(this.hms ? this.hms.substr(0, 2) : '00', 'hour'),
        '  <span>' + this.options.timeText.charAt(0) + '</span>',
        ' </div>',
        '<span class="calendar-time-Sbox">:</span>',
        ' <div class="calendar-time-box calendar-minute">',
        this.getTimeText(this.hms ? this.hms.substr(2, 2) : '00', 'minute'),
        '  <span>' + this.options.timeText.charAt(1) + '</span>',
        ' </div>',
        '<span class="calendar-time-Sbox">:</span>',
        ' <div class="calendar-time-box calendar-second">',
        this.getTimeText(this.hms ? this.hms.substr(4, 2) : '00', 'second'),
        '  <span>' + this.options.timeText.charAt(2) + '</span>',
        ' </div>',
        '</div>',
        '<ul class="calendar-setHour">',
        '<a href="javascript:;" class="calendar-setHour-close">x</a>'
      ];
      var setHArray=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
      var setMSArray=[0,5,10,15,20,25,30,35,40,45,50,55];
      for (var i = 0; i < setHArray.length; i++) {
        var returnNewDate = Utils.lenNum(setHArray[i]);
        html.push('<li class="calendar-cell-hours">' + returnNewDate + '</li>');
      }
      html.push('</ul>');
      html.push('<ul class="calendar-setM">');
      html.push('<a href="javascript:;" class="calendar-setM-close">x</a>');
      for (var i = 0; i < setMSArray.length; i++) {
        var returnMSDate = Utils.lenNum(setMSArray[i]);
        html.push('<li class="calendar-cell-minute">' + returnMSDate + '</li>');
      }
      html.push('</ul>');
      html.push('<ul class="calendar-setS">');
      html.push('<a href="javascript:;" class="calendar-setS-close">x</a>');
      for (var i = 0; i < setMSArray.length; i++) {
        var returnMSDate = Utils.lenNum(setMSArray[i]);
        html.push('<li class="calendar-cell-second">' + returnMSDate + '</li>');
      }
      html.push('</ul>');
      //html.push('<div class="calendar-cell-triangle"></div>');
      this.$foot.append(html.join(''));

      this.timeBox = this.$foot.find('input[type="text"]');
      this.listenTimes();
    },

    listenTimes: function () {
      var that = this;
      var min, max;
      var minTime = '000000', minDate = 0, maxDate = 0, maxTime = '235959';

      if (this.minDate) {
        min = Utils.fullDate(this.minDate);
        minDate = min.substr(0, 8);
        minTime = min.substring(8);
      }
      if (this.maxDate) {
        max = Utils.fullDate(this.maxDate);
        maxDate = max.substr(0, 8);
        maxTime = max.substring(8);
      }
      $('.calendar-setHour-close').on('click.close-time', function () {
        $('.calendar-setHour').css('display','none');
      })
      $('.calendar-setM-close').on('click.close-time', function () {
        $('.calendar-setM').css('display','none');
      })
      $('.calendar-setS-close').on('click.close-time', function () {
        $('.calendar-setS').css('display','none');
      })
      this.timeBox.off('mouseover.focus-time').off('keydown.control-time')
        .off('click.focus-time').off('mouseout.blur-time');
      this.timeBox
        .on('click.focus-time', function () {
          this.focus();
          //console.log(this.className)
          if(this.className == "calendar-hour"){
            $('.calendar-setM').css('display','none');
            $('.calendar-setS').css('display','none');
            $('.calendar-setHour').css('display','block');
          }else if(this.className == "calendar-minute"){
            $('.calendar-setS').css('display','none');
            $('.calendar-setHour').css('display','none');
            $('.calendar-setM').css('display','block');
          }else{
            $('.calendar-setHour').css('display','none');
            $('.calendar-setM').css('display','none');
            $('.calendar-setS').css('display','block');
          }
        })
        .on('mouseover.focus-time', function () {
          this.focus();
          //$(this).addClass('calendar-time-focus');
        })
        .on('mouseout.blur-time', function () {
          //$(this).removeClass('calendar-time-focus');
        })
        .on('keydown.control-time', function (e) {
          this.focus();
          if (e.keyCode === 38) { // up
            e.preventDefault();
            that.addTimes(this, this.className, maxDate, maxTime);
          } else if (e.keyCode === 40) { // down
            e.preventDefault();
            that.reduceTimes(this, this.className, minDate, minTime);
          }
        });
    },

    addTimes: function (input, className, maxDate, maxTime) {
      var isToday = this.ymd - maxDate === 0;
      // 今天的时分秒小于最晚时分秒要求
      if (isToday && this.hms - maxTime >= 0) {
        return false;
      }
      var temp = $.map(this.timeBox, function (el) {
        return el.value;
      });
      var v = Utils.lenNum(input.value - 0 + 1);

      if (className.indexOf('calendar-hour') > -1) {
        if (v > 23) {
          return false;
        }
        temp[0] = v;
      } else if (className.indexOf('calendar-minute') > -1)  {
        if (v > 59) {
          return false;
        }
        temp[1] = v;
      } else if (className.indexOf('calendar-second') > -1) {
        if (v > 59) {
          return false;
        }
        temp[2] = v;
      }

      input.value = v;

      if (this.isText && this.$element.val() && this.ymd) {
        this.set(Utils.toDate(this.ymd, dataDateTemp));
      }
    },

    reduceTimes: function (input, className, minDate, minTime) {
      var isToday = this.ymd - minDate === 0;
      // 今天的时分秒大于最早时分秒要求
      if (isToday && this.hms - minTime <= 0) {
        return false;
      }

      var temp = $.map(this.timeBox, function (el) {
        return el.value;
      });
      var v = input.value - 1;
      if (v < 0) {
        return false;
      }
      v = Utils.lenNum(v);

      if (className.indexOf('calendar-hour') > -1) {
        temp[0] = v;
      } else if (className.indexOf('calendar-minute') > -1)  {
        temp[1] = v;
      } else if (className.indexOf('calendar-second') > -1) {
        temp[2] = v;
      }

      input.value = v;

      if (this.isText && this.$element.val() && this.ymd) {
        this.set(Utils.toDate(this.ymd, dataDateTemp));
      }
    },

    addToday: function () {
      var html = '<span class="calendar-btn calendar-today">' + this.options.todayText + '</span>';
      this.$foot.append(html);
    },

    addClear: function () {
      var html = '<span class="calendar-btn calendar-clear">' + this.options.clearText + '</span>';
      this.$foot.append(html);
    },
    addSure: function () {
      var html = '<span class="calendar-btn calendar-sure">' + this.options.sureText + '</span>';
      this.$foot.append(html);
    },
    listen: function () {
      var that = this;
      if (this.isText) {
        this.$element.on('click.toggle-calendar', function () {
          if (that.$wrap.hasClass('open')) {
            closeCalendar();
          } else {
            closeCalendar();
            that.open();
          }
          incal = true;
        });
      }

      // 只有点击可关闭的日期视图时，才会阻止关闭日历, 否则都会关闭任何已经打开的日历
      this.$wrap.on('click.stop-close-calendar', function (e) {
        if (that.$wrap.hasClass('calendar-closable')) {
          e.stopPropagation();
        }
      });

      this.$top
        // 显示上一个同级视图
        .on('click.show-prev', '.calendar-left', function () {
          if ($(this).hasClass('calendar-prev-disable')) {
            return false;
          }
          that.viewCalendar = that.viewCalendar.prev(that.viewMode);
          that.change();
        })
        // 显示下一个同级视图
        .on('click.show-next', '.calendar-right', function () {
          if ($(this).hasClass('calendar-next-disable')) {
            return false;
          }
          that.viewCalendar = that.viewCalendar.next(that.viewMode);
          that.change();
        })
        .on('click.show-parent', '.calendar-text', function () {
          that.parent();
        });

      this.$body
        .on('click.show-month', '.calendar-cell-month', function () {
          var $this = $(this);
          if ($this.hasClass('calendar-cell-ignore')) {
            return false;
          }
          var date = new Date(that.viewCalendar.year, $(this).data('month'), 1);
          if (that.options.size === 2) {
            that.dateClick(date, $this);
            return false;
          }
          that.viewMode = viewMode.month;
          that.viewCalendar = new Calendar(date);
          that.change();
        })
        .on('click.show-year', '.calendar-cell-year', function () {
          var $this = $(this);
          if ($this.hasClass('calendar-cell-ignore')) {
            return false;
          }
          that.viewMode = viewMode.year;
          var date = new Date($(this).data('year'), 0, 1);
          that.viewCalendar = new Calendar(date);
          that.change();
        })
        .on('click.show-ten', '.calendar-cell-ten', function () {
          var $this = $(this);
          if ($this.hasClass('calendar-cell-ignore')) {
            return false;
          }
          that.viewMode = viewMode.ten;
          var date = new Date($(this).data('ten'), 0, 1);
          that.viewCalendar = new Calendar(date);
          that.change();
        })
        .on('click.date-click', '.calendar-cell-day', function () {
          var $this = $(this);
          var date = Utils.toDate($this.data('date'), dataDateTemp);
          that.dateClick(date, $this);
        });

      var _mouseover = this.options.dateMouseover;
      if ($.isFunction(_mouseover)) {
        this.$body.on('mouseover.date-mouseover', '.calendar-cell-day', function () {
          var $this = $(this);
          var date = Utils.toDate($this.data('date'), dataDateTemp);
          _mouseover(date, $this);
        });
      }

      var _mouseleave = this.options.dateMouseleave;
      if ($.isFunction(_mouseleave)) {
        this.$body.on('mouseleave.date-mouseleave', '.calendar-cell-day', function () {
          var $this = $(this);
          var date = Utils.toDate($this.data('date'), dataDateTemp);
          _mouseleave(date, $this);
        });
      }

      this.$foot
        .on('click.select-today', '.calendar-today', function () {
          that.clear().set(today).close();
        })
        .on('click.clear-calendar', '.calendar-clear', function () {
          that.clear().close();
        })
        .on('click.clear-sure', '.calendar-sure', function () {
          var $this = $(".calendar-cell-today");
          var date = Utils.toDate($this.data('date'), dataDateTemp);
          that.dateClick(date, $this);
        })
        .on('click.select-hours', '.calendar-cell-hours', function () {
          var $this = $(this);
          $(".calendar-hour").val($this[0].innerText);
          $('.calendar-setHour').css('display','none');
        })
        .on('click.select-minute', '.calendar-cell-minute', function () {
          var $this = $(this);
          $(".calendar-minute").val($this[0].innerText);
          $('.calendar-setM').css('display','none');
        })
        .on('click.select-second', '.calendar-cell-second', function () {
          var $this = $(this);
          $(".calendar-second").val($this[0].innerText);
          $('.calendar-setS').css('display','none');
        });
    },

    // 切换视图
    change: function () {
      switch(this.viewMode) {
      case viewMode.month:
        this.month();
        break;
      case viewMode.year:
        this.year();
        break;
      case viewMode.ten:
        this.tenYears();
        break;
      case viewMode.century:
        this.century();
        break;
      }
    },

    // 切换到父视图
    parent: function () {
      if (this.viewMode === viewMode.month) {
        this.year();
      } else if (this.viewMode === viewMode.year) {
        this.tenYears();
      } else if (this.viewMode === viewMode.ten) {
        this.century();
      }
    },

    /**
     * 生成顶部 | <  yyyy年MM月   > |
     */
    top: function () {
      var viewText = this.viewCalendar.toStr('MM月yyyy年', 2);
      if (this.viewMode === viewMode.year) {
        viewText = this.viewCalendar.year;
      } else if (this.viewMode === viewMode.ten) {
        viewText = Utils.tenScope(this.viewCalendar.year);
      } else if (this.viewMode === viewMode.century) {
        viewText = Utils.centuryScope(this.viewCalendar.year);
      }

      var year = this.viewCalendar.year - 0;
      var leftcls = year <= 1000 ? ' calendar-prev-disable' : '';
      var rightcls = year >= 9999 ? ' calendar-next-disable' : '';

      // 月视图下最小、最大年只有临界月份不可点
      if (year === 1000 && this.viewMode === viewMode.month && this.viewCalendar.month > 1) {
        leftcls = '';
      } else if (year === 9999 && this.viewMode === viewMode.month && this.viewCalendar.month < 12) {
        rightcls = '';
      }

      var h = [
        '<div class="calendar-border">',
        '<span class="calendar-left' + leftcls + '">',
        '<span></span><em></em>',
        '</span>',
        '<div class="calendar-text">' + viewText + '</div>',
        '<span class="calendar-right' + rightcls + '">',
        '<span></span><em></em>',
        '</span>',
        '</div>'
      ];
      this.$top.html(h.join(''));
    },

    // 生成指定月的日期视图
    month: function () {
      this.viewMode = viewMode.month;
      this.top();

      var that = this,html = [];
      html[0] = '<div class="calendar-position">';
      html[1] = '<ul class="calendar-week">' + this.week().join('') + '</ul>';
      html[2] = '<ul class="calendar-month">';

      var count = this.viewCalendar.count(),
        firstDay = this.viewCalendar.firstDay(),
        year_month = this.viewCalendar.toStr(dataDateTemp, 2),
        // 根据星期起始日和当月第一天的星期，得出计算上一月显示天数的数组
        array = (function () {
          var w = [1,2,3,4,5,6,7,1,2,3,4,5,6,7];
          return (w.slice(6 - that.options.weekStart).slice(0, 7));
        })();
      // 计算上一月显示天数
      var prevMonth = this.viewCalendar.prev(),
        prevLeft = array[firstDay],
        prevCount = prevMonth.count();
      for (var i = prevCount - prevLeft + 1; i <= prevCount; i++) {
        html.push('<li class="calendar-cell-ignore">' + i + '</li>');
      }

      // 当月日期
      for (i = 1; i <= count; i++) {
        html.push(this.day(year_month, i));
      }

      // 计算下一月显示天数
      var len = 42 - count - prevLeft;
      for (i = 1; i <= len; i++) {
        html.push('<li class="calendar-cell-ignore">' + i + '</li>');
      }

      html.push('</ul>');
      html.push('</div>');
      this.$body.html(html.join(''));

      this.after();
    },

    day: function (year_month, date) {
      var d1 = year_month + Utils.lenNum(date),
        day_cls = 'calendar-cell-day';
      if (this.minDate && Utils.compareDate(d1, this.minDate, 3) < 0) {
        day_cls = 'calendar-cell-ignore';
      }
      if (this.maxDate && Utils.compareDate(d1, this.maxDate, 3) > 0) {
        day_cls = 'calendar-cell-ignore';
      }
      return '<li class="' + day_cls + '" data-date="' + d1 + '">' + date + '</li>';
    },

    /**
     * 生成月份视图之后的修饰操作
     */
    after: function () {
      var _after = this.options.after || function() {},
        date = this.viewCalendar.d,
        dateList = null,
        year = this.viewCalendar.year,
        month = this.viewCalendar.month,
        that = this;

      if ($.isFunction(this.options.after)) {
        dateList = [];
      }
      this.$body.find('[data-date]').each(function (i) {
        var $this = $(this);
        date.setDate(i + 1);
        if (dateList) {
          dateList.push({
            date: new Date(date),
            target: $this
          });
        }

        if (Utils.isToday(date)) {
          $this.addClass('calendar-cell-today');
        }
        if (that.calendar && that.isText &&
          Utils.compareDate(date, that.calendar.d, 3) === 0) {
          $this.addClass('calendar-cell-selected');
        }

      });
      _after(year, month, dateList);
    },

    /**
     * 生成星期列表
     */
    week: function () {
      return $.map(this.options.weekText.split(/\s+/), function (day) {
        return '<li>' + day + '</li>';
      });
    },

    // 生成年的月份视图
    year: function () {
      this.viewMode = viewMode.year;
      this.top();
      var minDate = this.minDate ? Utils.formatDate(this.minDate, 'yyyyMM') : 0;
      var maxDate = this.maxDate ? Utils.formatDate(this.maxDate, 'yyyyMM') : 1000000;
      var year = this.viewCalendar.year;
      var h = $.map(this.options.monthText.split(/\s+/), function (m, i) {
        var cls = 'calendar-cell-month';
        var ym = year + '' + Utils.lenNum(i + 1);
        if (ym < minDate || ym > maxDate) {
          cls += ' calendar-cell-ignore';
        }
        return '<div class="' + cls + '" data-month="' + i + '">' + m + '</div>';
      });
      this.$body.html(h.join(''));
    },

    /**
     * 生成10年的视图
     */
    tenYears: function () {
      this.viewMode = viewMode.ten;
      this.top();
      var minYear = this.minDate ? this.minDate.getFullYear() : 0;
      var maxYear = this.maxDate ? this.maxDate.getFullYear() : 10000;
      var decade = Math.floor(this.viewCalendar.year/10); // 201(0)
      var startYear = ('' + decade + 0) - 1; // 2009
      var h = [], i = 0, len = 12, c, d;
      for (; i < len; i++) {
        c = 'calendar-cell-year';
        d = startYear + i;
        if (i === 0 || i === 11 || d < minYear || d > maxYear) {
          c += ' calendar-cell-ignore';
        }
        if (d < 1000 || d > 9999) {
          h.push('<div class="' + c + '"></div>')
        } else {
          h.push('<div class="' + c + '" data-year="' + d + '">' + d + '</div>');
        }
      }
      this.$body.html(h.join(''));
    },

    /**
     * 生成100年的世纪视图
     */
    century: function () {
      this.viewMode = viewMode.century;
      this.top();
      var minYear = this.minDate ? this.minDate.getFullYear() : 0;
      var maxYear = this.maxDate ? this.maxDate.getFullYear() : 10000;
      var cen = Math.floor(this.viewCalendar.year/100);
      var startYear = ('' + cen + '00') - 10;
      var h = [], i = 0, len = 12, c, s, ten;
      for (; i < len; i++) {
        c = 'calendar-cell-ten';
        s = (startYear + i * 10);
        if (i === 0 || i === 11 || s < minYear || s > maxYear) {
          c += ' calendar-cell-ignore';
        }
        ten = '<p>' + s + '-</p><p>' + (s + 9) + '</p>';
        if (s < 1000 || s > 9999) {
          h.push('<div class="' + c + '"></div>')
        } else {
          h.push('<div class="' + c + '" data-ten="' + s + '">' + ten + '</div>');
        }
      }
      this.$body.html(h.join(''));
    },

    // 每日点击事件
    dateClick: function (date, $dateObj) {
      var fn = this.options.dateClick;

      if (this.isText) {
        this.set(date);
        this.close();
      }

      if (typeof fn === 'function') {
        fn(date, $dateObj);
      }
    },

    // 计算指定日期和enable间的差距
    getErrors: function (date) {
      var min = 0, max = 0;
      if (Utils.isDate(this.minDate)) {
        min = Utils.compareDate(date, this.minDate, 3);
      }
      if (Utils.isDate(this.maxDate)) {
        max = Utils.compareDate(this.maxDate, date, 3);
      }
      return [min, max];
    },

    enable: function (deep, start, end) {
      // 日期为undefined时，是否覆盖配置参数中的值
      if ($.type(deep) !== 'boolean' ) {
        end = start;
        start = deep;
        deep = false;
      }
      if (deep) {
        this.minDate = start;
        this.maxDate = end;
      } else {
        if (Utils.isDate(start)) {
          this.minDate = start;
        }
        if (Utils.isDate(end)) {
          this.maxDate = end;
        }
      }

      if (this.calendar &&
          this.getErrors(this.calendar.d).join('').indexOf('-') > -1) {
        this.clear();
      }

      if (!this.$wrap.hasClass('open')) {
        return this;
      }

      var viewDate = this.viewCalendar.d;
      var viewErrors = this.getErrors(viewDate);

      // 视图日期比最小日期早
      if (viewErrors[0] < 0) {
        this.viewCalendar = new Calendar(this.minDate);
      }
      // 视图日期比最大日期晚
      if (viewErrors[1] < 0) {
        this.viewCalendar = new Calendar(this.maxDate);
      }

      if (this.viewMode === viewMode.month) {
        this.month();
      }
      this.listenTimes();
      return this;
    },

    clear: function () {
      this.calendar = null;

      if (this.isText) {
        this.element.value = '';
      }

      if (this.$wrap.hasClass('open')) {
        this.$body.find('.calendar-cell-selected')
                  .removeClass('calendar-cell-selected');
      }

      if (this.options.time) {
        this.$foot.find('.calendar-hour').val(Utils.lenNum(today.getHours()));
        this.$foot.find('.calendar-minute').val(Utils.lenNum(today.getMinutes()));
        this.$foot.find('.calendar-second').val(Utils.lenNum(today.getSeconds()));
      }
      (this.options.clear || function () {})();

      return this;
    },
    sure: function (date) {
      
      return this;
    },
    set: function (date) {
      if (!date) {
        return this;
      }
      if (!Utils.isDate(date)) {
        date = Utils.toDate(date, this.options.format);
      }
      // 时分秒赋值
      if (this.options.time) {
        var times = this.$foot.find('.calendar-time').find('input');
        date.setHours(times[0].value);
        date.setMinutes(times[1].value);
        date.setSeconds(times[2].value);

        // 当处于临界日时，需要另外判断一次时间的准确性
        if (this.minDate && Utils.compareDate(this.minDate, date, 6) > 0) {
          date = new Date(this.minDate);
        }
        if (this.maxDate && Utils.compareDate(date, this.maxDate, 6) > 0) {
          date = new Date(this.maxDate);
        }

        times[0].value = Utils.lenNum(date.getHours());
        times[1].value = Utils.lenNum(date.getMinutes());
        times[2].value = Utils.lenNum(date.getSeconds());
      }

      var datestr = Utils.fullDate(date);
      this.hms = datestr.substring(8);
      this.ymd = datestr.substr(0, 8);
      this.calendar = new Calendar(date);
      var scls = 'calendar-cell-selected';
      // 文本框触发
      if (this.isText) {
        this.element.value = Utils.date2Str(date, this.options.format, this.options.size);
      }

      // 当前日期如果是显示状态，添加选择样式
      if (this.$wrap.hasClass('open')) {
        var d = this.viewCalendar.d,
          that = this;
        this.$body.find('.' + scls).removeClass(scls);
        this.$body.find('[data-date]').each(function (i) {
          d.setDate(i + 1);
          if (Utils.compareDate(d, that.calendar.d, 3) === 0) {
            $(this).addClass(scls);
          }
        });
      }

      (this.options.change || function () {})(date);
      return this;
    },

    open: function () {
      var currentDate = null;
      if (!this.calendar) {
        currentDate = new Date();
      } else {
        currentDate = this.calendar.d;
      }
      // 当前视图月份默认为插件指定或文本值
      this.viewCalendar = new Calendar(currentDate);
      this.viewMode = this.options.size === 2 ? viewMode.year : viewMode.month;

      var errors = this.getErrors(currentDate),
        moreThanMin = errors[0] > -1,
        lessThanMax = errors[1] > -1;

      this.$wrap.addClass('open');

      if (this.isText) {
        setPosition(this.$element, this.$wrap, this.options.zIndex);
      }
      if (this.options.time) {
        this.$foot.find('.calendar-hour').val(Utils.lenNum(currentDate.getHours()));
        this.$foot.find('.calendar-minute').val(Utils.lenNum(currentDate.getMinutes()));
        this.$foot.find('.calendar-second').val(Utils.lenNum(currentDate.getSeconds()));
      }

      // 当前视图早于最小日期
      if (!moreThanMin) {
        this.viewCalendar = new Calendar(this.minDate);
      }
      // 当前视图晚于最大日期
      if (!lessThanMax) {
        this.viewCalendar = new Calendar(this.maxDate);
      }
      if (this.viewMode === viewMode.month) {
        this.month();
      } else if (this.viewMode === viewMode.year) {
        this.year();
      }
      return this;
    },

    close: function () {
      this.$wrap.removeClass('open');
      return this;
    },

    noop: function () {
      return this;
    }
  };
  
  function closeCalendar() {
    $('.calendar-closable.open').removeClass('open');
  }
  /**
   * 日期封装类
   */
  function Calendar(date) {
    this.init(date);
  }
  Calendar.prototype = {
    constructor: Calendar,
    init: function (date) {
      this.bus = new Date;
      this.d = Utils.isDate(date) ? new Date(date) : Utils.toDate(date, null);
      this.year = this.d.getFullYear() + '';
      this.month = Utils.lenNum(this.d.getMonth() + 1);
      this.date = Utils.lenNum(this.d.getDate());
    },
    toStr: function (format, size) {
      return Utils.date2Str(this.d, format, size);
    },
    setBus: function (y, m, d) {
      this.bus.setFullYear(y, m, d);
    },
    // 该月有多少天
    count: function () {
      this.setBus(this.year, this.month, 0);
      return this.bus.getDate();
    },
    // 第一天是星期几
    firstDay: function () {
      this.setBus(this.year, this.month - 1, 1);
      return this.bus.getDay();
    },
    // 上个同级
    prev: function (mode) {
      if (!mode) {
        mode = viewMode.month;
      }
      switch(mode) {
      case viewMode.month:
        this.setBus(this.year, this.month - 1, 0);
        break;
      case viewMode.year:
        this.setBus(this.year - 1, 0, 1);
        break;
      case viewMode.ten:
        this.setBus(this.year - 10, 0, 1);
        break;
      case viewMode.century:
        this.setBus(this.year - 100, 0, 1);
        break;
      }
      return new Calendar(this.bus);
    },
    // 下个同级
    next: function (mode) {
      if (!mode) {
        mode = viewMode.month;
      }
      switch(mode) {
      case viewMode.month:
        this.setBus(this.year, this.month, 1);
        break;
      case viewMode.year:
        this.setBus(this.year - -1, 0, 1);
        break;
      case viewMode.ten:
        this.setBus(this.year - -10, 0, 1);
        break;
      case viewMode.century:
        this.setBus(this.year - -100, 0, 1);
        break;
      }
      return new Calendar(this.bus);
    }
  };

  function CalendarPair(start, end, option) {
    this.element = {
      start: start,
      end: end
    };
    this.options = $.extend({}, config ,option);
    // 起始和结束日期是否可以为同一天
    this.touchable = option.touchable;
    if (option.touchable == undefined) {
      this.touchable = true;
    }
    this.init();
  }
  CalendarPair.prototype = {
    constructor: CalendarPair,
    init: function () {
      var start = this.options.start;
      var end = this.options.end;

      var startDate, endDate;

      var enable = this.options.enable;
      var touchable = this.touchable;
      // 范围限制
      // 如果限制三个月，如果开始日期选定之后，结束日期只能选择从开始日期起的最大三个月时间
      // 参数'month,3'
      var scope = (this.options.scope || '').split(',');

      var startOption = $.extend(true, {}, this.options, {
        clearBtn: true,
        change: function (date) {
          var en = freshEnable(enable, date, touchable, scope, true);
          end.calendar().enable(true, en[0], en[1]);
        },
        clear: function () {
          // 重置结束日期的最小值限定
          end.calendar().enable(true, enable[0], enable[1]);
        }
      });

      if (end.val()) {
        endDate = Utils.toDate(end.val(), this.options.format);
        startOption.enable = freshEnable(enable, endDate, touchable, scope, false);
      }

      var endOption = $.extend(true, {}, this.options, {
        clearBtn: true,
        change: function (date) {
          var en = freshEnable(enable, date, touchable, scope, false);
          start.calendar().enable(true, en[0], en[1]);
        },
        clear: function () {
          start.calendar().enable(true, enable[0], enable[1]);
        }
      });

      if (start.val()) {
        startDate = Utils.toDate(start.val(), this.options.format);
        endOption.enable = freshEnable(enable, startDate, touchable, scope, true);
      }

      start.calendar(startOption);
      end.calendar(endOption);
    }
  };

  $.fn.calendar = function () {
    var params = _slice.call(arguments, 0),
        options = params[0],
        data = this.data(namespace),
        isCommand = typeof options === 'string',
        command = 'noop';

    if (isCommand) {
      command = options;
      options = {};
    }
    if (!data) {
      options = $.extend({}, config, options || {});
      data = new CalendarView(this[0], options);
      this.data(namespace, data);
    }
    if (isCommand) {
      return data[command].apply(data, params.slice(1));
    }
    return data;
  };

  $.calendarPair = function (option) {
    return new CalendarPair(option.start, option.end, option);
  };
  //点击空白区域关闭
  $(document)
    .on('click.calendar-api', function () {
      incal ? (incal = false) : closeCalendar();
    })
    .on('click.calendar', function () {
      $('.calendar-setHour').css('display','none');
      $('.calendar-setM').css('display','none');
      $('.calendar-setS').css('display','none');
    })
    //给图标增减input的单击时间
    /*.on('click.calendar-a', '.calendar-date-icon', function(){
      $(this).prev("input[type=text]").trigger("click"); 
      this.open();
    })*/;
});