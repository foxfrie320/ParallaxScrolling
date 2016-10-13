(function($) {
	$.fn.parallaxSlider = function(options) {
		var opts = $.extend({}, $.fn.parallaxSlider.defaults, options);
		return this.each(function(){
			var $container = $(this),
				o = $.meta ? $.extend({}, opts, $container.data()):opts;

			// 主要的Slider
			var $slider = $('.slider', $container),
				//slider所有元素
				$elems = $slider.children(),
				//slider元素总数
				total_elems = $elems.length;
				// 上一页 下一页按钮
				$next = $('.next', $container),
				$prev = $('.prev', $container),
				// 背景图片
				$bg1 = $('.bg1', $container),
				$bg2 = $('.bg2', $container),
				$bg3 = $('.bg3', $container),
				//当期那图片
				current = 0,
				//指示小图容器
				$thumbnails = $('.thumbnails', $container),
				//指示小图
				$thumbs = $thumbnails.children(),

				//自动播放时间间隔
				slideshow,
				$loading = $('.loading', $container),
				$slider_wrapper = $('.slider_wrapper', $container);

				//首先预加载图片
				var loaded = 0,
				$images = $slider_wrapper.find('img');
				$images.each(function(){
					var $img = $(this);
					$('<img/>').load(function(){
						++loaded;
						if(loaded == total_elems*2){
							$loading.hide();
							$slider_wrapper.show();

							// 一个图像宽度(假设所有图片有相同的大小)
							var one_image_w = $slider.find('img:first').width();

							// 设置slider和其每一个元素以及上/下一页按钮的宽度
							setWidths($slider, $elems, $total_elems, $bg1, $bg2, $bg3, one_image_w, $next, $prev);
							
							// 均匀设置指示图片的宽度							
							$thumbnails.css({
								'width': one_image_w + 'px',
								'margin-left': one_image_w/2 + 'px'
							});
							var spaces = one_image_w/(total_elems + 1);
							$thumbs.each(function(i){
								var $this = $(this);
								var left = spaces * (i+1) - $this.width()/2;
								$this.css('left', left + 'px');

								if(o.thumbRotation){
									var angle = Math.floor(Math.random()*41 - 20);
									$this.css({
										'transform': 'rotate('+ angle + 'deg)',
										'-webkit-transform': 'rotate('+ angle + 'deg)',
										'-moz-transform': 'rotate('+ angle + 'deg)'
									});
								}

								// 移上指示图片上下移动
								$this.bind('mouseenter', function(){
									$(this).stop().animate({
										top: '-10px'
									}, 100);
								}).bind('mouseleave', function(){
									$this.stop().animate({
										top: '0px'
									}, 100);
								});
							});

							// 使第一张指示图片被选中
							highlight($thumbs.eq(0));

							// 当点击上下页时滑动
							$next.bind('click', function(){
								++current;
								if(current >= total_elems){
									if(o.circular){
										current = 0;
									}
								}else{
									--current;
									return false;
								}
								highlight($thumbs.eq(current));
								slide(current, $slider, bg3, bg2, bg1, o.speed, o.easing, o.easingBg);
							});
							$prev.bind('click', function(){
								--current;
								if(current < 0){
									if(o.circular){
										current = total_elems - 1;
									}
								}else{
									++current;
									return false;
								}
								highlight($thumbs.eq(current));
								slide(current, $slider, bg3, bg2, bg1, o.speed, o.easing, o.easingBg);
							});

							// 点击一个指示小图片滑动到相应的图片
							$thumbs.bind('click', function(){
								var $thumb = $(this);
								highlight($thumb);

								// 如果用户点击，播放终止
								
								if(o.auto){
									clearInterval(slideshow);
								}
								current = $thumb.index();
								slider(current, $slider, bg3, bg2, bg1, o.speed, o.easing, o.easingBg);
							});

							// 如果该选项指定，激活自动播放模式
							 if(o.auto){
							 	o.circular = true;
							 	slideshow = setInterval(function(){
							 		$next.trigger('click');
							 	}, o.auto);
							 }

							 // 当调整窗口大小,我们需要重新计算宽度的滑块元素,基于新窗口的宽度。
							 // 我们需要再次滑动当前,从左边的滑块不再是正确的
							 $(window).resize(function(){
							 	window_w = $(window).width();
							 	setWidths($slider, $elems, total_elems, $bg1, $bg2, $bg3, one_image_w, $next, $prev);
							 	slide(current, $slider, bg3, bg2, bg1, 1, o.easing, o.easingBg);
							 });
						}
					}).error(function(){
						alert('here')
					}).attr('src', $img.attr('src'));
				});
		});
	};

	// 当前window宽度
	var window_w = $(window).width();
	var slide = function(current,
		$slider,
		$bg3,
		$bg2,
		$bg1,
		speed,
		easing,
		easingBg){
		var slide_to = parseInt(-window_w * current);
		$slider.stop().animate({
			left: slide_to + 'px'
		}, speed, easing);
		$bg3.stop().animate({
			left: slide_to/2 + 'px'
		},speed, easingBg);
		$bg2.stop().animate({
			left: slide_to/4 + 'px'
		},speed, easingBg);
		$bg1.stop().animate({
			left: slide_to/8 + 'px'
		},speed, easingBg);
	}

	var highlight = function($elems){
		$elems.siblings().removeClass('selected');
		$elem.addClass('selected');
	}

	var setWidths = function($slider,
		$elems,
		total_elems,
		$bg1,
		$bg2,
		$bg3,
		one_image_w,
		$next,
		$prev){
		// 滑块的宽度是窗户宽度乘以滑块元素的总数
		var slider_w = window_w * total_elems;
		$slider.width(slider_w + 'px');
		// 每个元素宽度=窗口宽度
		$elems.width(window_w + 'px');

		// 我们还设置每个div bg图像的宽度。slider计算值是相同的
		$bg1.width(slider_w + 'px');
		$bg2.width(slider_w + 'px');
		$bg3.width(slider_w + 'px');

		// 导航按钮的左右是:windowWidth / 2 - imgWidth / 2 +一些margin(不触碰图像边界)
		var position_nav = window_w/2 - one_image_w/2 + 3;
		$next.css('right', position_nav + 'px');
		$next.css('left', position_nav + 'px');
	}

	$.fn.parallaxSlider.default = {
		auto: 0,  //多少秒定期幻灯片的内容。如果设置为0,那么播放是关闭的。
		speed: 1000,  //每个幻灯片动画的速度
		easing: 'jswing',  //宽松幻灯片的动画效果
		easingBg: 'jswing', //宽松的背景动画效果
		circular: true,  //循环滑动
		thumbRotation: true //指示小图片将随机旋转
	};
})(jQuery);

var $container	= $('#container');
$container.parallaxSlider();