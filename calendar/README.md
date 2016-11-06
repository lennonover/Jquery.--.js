##jQuery-calendar


[演示](https://lennonover.github.io/Jquery.--.js/calendar/calendar.html)

### Demo

#### Demo1

        $.calendarPair({
          start: $('.start-date'),    //开始时间
          end: $('.end-date'),        //结束时间
          size: 6,                    //显示年月日时分秒最大6
          sureBtn: true,              //显示确定按钮
          todayBtn: true,             //显示今天按钮
          clearBtn: true,             //显示清除按钮
          todayText:"今天",           //计划想做成国际化的i18n 先做成自定义
          clearText:"清除",           //自定义名称
          sureText:"确定",            //自定义名称
          time: true,                 //显示时分秒编辑框
          format:"yyyy-MM-dd hh",//设置年月日时分秒的显示顺序和显示方式
          scope: 'month,1',           //设置开始时间和结束时间选择范围逗号隔开，逗号前一个字符串为`year` 、`month` 、`day`
          dateClick:function(){},     //日期点击事件
          dateMouseover:function(){}, //日期鼠标悬停事件
          dateMouseleave:function(){} //日期鼠标离开事件
        });
        $('.start-date').calendar({
        });
        $('.end-date').calendar({
        });


#### Demo2

        var md = new Date;
        var mad = new Date;
        md.setHours(8, 10, 10);
        mad.setHours(10, 20, 20);
        $('.idate').calendar({
          //time: true,
          size: 3,
          format:"MM月dd日yyyy年",
          todayBtn: true,
          sureBtn: true,
          clearBtn: true,
          //todayText:"today",       //自定义名称
          //clearText:"clear",       //自定义名称
          //sureText:"sure" ,        //自定义名称
          //enable: [md, mad],       //设置可点击选择的日期范围，数组长度为2，元素为`undefined`时表示没有限制，
                                     //例如设置只能选今天之前的日期可以设置为`enable: [undefined, new Date]`
          //enable: [undefined, new Date],
          //enable: [new Date, undefined],
           dateClick:function(){}
        });
        //对外方法
        $('.idate').calendar('set',new Date) //设置时间
        $('.idate').calendar('enable',undefined,new Date) //只能选今天之前的日期
        $('.idate').calendar('set').$element[0].value//


### API

|API|说明|类型|   
|---|---|---| 
|size|是否显示年月日时分秒最大6|Number|  
|time|是否显示时分秒 |Boolean|    
|todayBtn|是否显今天按钮 |Boolean|   
|sureBtn|是否显示确定按钮 |Boolean|   
|clearBtn|是否显示清除按钮 |Boolean|   
|todayText|自定义今天按钮名称 |String|   
|clearText|自定义清除按钮名称 |String|   
|sureText|自定义确定按钮名称 |String|   
|enable|设置可点击选择的日期范围，数组长度为2,为`undefined`时表示没有限制|Array|   
|format|设置时间显示类型 `MM月dd日yyyy年` |String|   
|start|开始时间 `$('.start-date')`只有在连级别选择有效||   
|end|结束时间 `$('.end-date')` 只有在连级别选择有效||   
|dateClick|日期点击事件|Function|  
|dateMouseover|日期鼠标悬停事件|Function|  
|dateMouseleave|日期鼠标离开事件|Function|  