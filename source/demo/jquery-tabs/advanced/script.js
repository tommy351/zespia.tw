(function($){
	var trigger = false;

	// 使內容高度等於第一頁籤內容高度 + 上下padding
	$('#container').css('height', $('#contents div').eq(0).height() + 20);

	// 用each遍歷頁籤
	var tabs = $('#tabs li').each(function(i){
		var _i = i;

		// 為每個頁籤新增tabid屬性
		// 綁定click事件到頁籤上，若要改為滑鼠移入切換頁籤的話，將click改為mouseenter
		$(this).attr('tabid', i).click(function(){
			// 當trigger為false時才作用，避免重複點按造成瀏覽器crash
			if (trigger == false){
				// 取得目前的tabid，以計算動畫的間距值（內容寬度 * 頁籤間距）
				var now = parseInt($(this).parent().children('.enable').attr('tabid')),
					gap = 500 * (_i - now);
					trigger = true;

				// 移除其他頁籤的class，並將class新增至目前頁籤
				$(this).parent().children().removeClass('enable').eq(_i).addClass('enable');
				// 使內容移動一定間距
				$('#contents').animate({left: '-='+gap}, 500);
				// 使內容高度符合所選頁籤內容的高度（所選頁籤內容高度 + 上下padding），動畫全部結束後，使trigger值返回false
				$('#container').animate({height: $('#contents').children().eq(_i).height() + 20}, 500, function(){
					trigger = false;
				});
			}
		});
	});
})(jQuery);