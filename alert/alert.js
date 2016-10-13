/**
*    jquery 弹窗插件
*    调用方法（中括号的为可选参数）：
*    $.alert(string[,function])
*    $.confirm(string[,function])
*    $.tips(string[,number])
*    version:2016-08-11
*/
!function ($) {
    $.extend({
    	_isalert:0,
		alert:function(){
			if(arguments.length){
				$._isalert=1;
				return $.confirm.apply($,arguments);
			}
		},
		confirm:function(){
			var args=arguments,d;
			if(args.length){
				var fn=args[1],_click = function(e){typeof fn=='function'?(fn.call(d,e.data.r)!=!1&&d.close()):d.close();};
				d = $('<div class="alert_overlay"><div class="alert_msg"><div class="alert_content">'+args[0]+'</div><div class="alert_buttons"><button class="alert_btn alert_btn_ok">确定</button><button class="alert_btn alert_btn_cancel">取消</button></div></div></div>').on('contextmenu',!1).on('click','.alert_btn_ok',{r:!0},_click).on('click','.alert_btn_cancel',{r:!1},_click)
				$._isalert&&d.find('.alert_btn_cancel').css('display','none');
				d.ok =  function(t){d.find('.alert_btn_ok').text(t||'确定');return d}
				d.cancel=function(t){d.find('.alert_btn_cancel').text(t||'取消');return d}
				d.padding=function(p){d.find('.alert_content').css('padding',p||0);return d}
				d.width=function(w){w=!w||w<200?200:w,d.find('.alert_msg').css({width:w,marginLeft:-w/2});return d}
				d.content=function(t){t&&d.find('.alert_content').html(t);return d}
				d.close=d.remove;
				d.appendTo('body').find('.alert_btn_ok').focus()
			}
			$._isalert=0;
			return d;
		},
		tips:function(){
			var args=arguments;
			if(args.length){
				var tipsContainer = $('.alert_tips');
				tipsContainer.length||(tipsContainer=$('<div class="alert_tips"></div>').appendTo('body'));
				$('<div>'+args[0]+'</div>').appendTo(tipsContainer).fadeIn('fast').delay(args[1]*1||2000).slideUp('fast',function(){$(this).remove();});
			}

		}
	});
}($);
