// Piotr Falba, 2012, http://falba.pro
// Plugin inspired by: http://tympanus.net/Tutorials/3DHoverEffects

(function($) {
	
	var css3d = false;
		
	if(!styleSupport) {
		var styleSupport = function(prop) {
			var vendorProp, supportedProp,
			capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
			prefixes = ["Moz", "Webkit", "O", "ms"],
			div = document.createElement( "div" );
			
			if(prop in div.style) {
				supportedProp = prop;
			} else {
				for(var i = 0; i < prefixes.length; i++) {
					vendorProp = prefixes[i] + capProp;
					if(vendorProp in div.style) {
						supportedProp = vendorProp;
						break;
					}
				}
			}
			div = null;
			$.support[prop] = supportedProp
			return supportedProp;
		}
	}
		
	// ---- CSS dynamic hook generator ----
	if(!dynamicHook) {
		var dynamicHook = function(name) {
			eval("var "+ name +"=styleSupport('"+ name +"');if("+ name +" && "+ name +"!=='"+ name +"'){$.cssHooks."+ name +"={get:function(elem,computed,extra){return $.css(elem,"+ name +");},set:function(elem,value){elem.style["+ name +"]=value;}}}");
		}
	}
	
	// ---- Dynamic hook generate ----
	var hook = [
		'perspective',
		'transform',
		'transformStyle',
		'transformOrigin',
		'transition'
	]
	
	for(var i = 0; i < hook.length; i++) dynamicHook(hook[i]);
		
	$.fn.shutterHover = function(config) {
		
		var Config = $.extend( {
			deg : 40,
			folds : 5,
			start : 1
		}, config);
		
		// ---- 3D support test ----
		(function(){
			var $d = $('<div>');
			$('body').append($d);
			$d.css({
				'position' : 'absolute',
				'left' : 0,
				'transform-style' : 'preserve-3d',
				'transform': 'translate3d(100px,0,0)'
			});
			css3d = ($d.offset().left == 100);
			$d.remove();
		})();
						
		this.each(function() {
			var // Default values
				$t = $(this),
				width = $t.width(),
				height = $t.height(),
				url = $t.attr('src'),
				title = $t.attr('title'),
				$c = $('<div>'),
				$d = $('<div>');
						
			$c.css({
				'width' : width,
				'height' : height,
				'position' : 'relative',
				'display' : 'inline-block',
			}).addClass('magicHover');
			
			if(css3d) {
				$c.css({
					'perspective' : '600px'
				});
			} else {
				$c.css({
					'overflow' : 'hidden'
				});
			}
			
			$t.before($c.append($d.addClass('description').html(title)));
			
			$t.remove();
			var	
				panel = [],
				gradient = [];
						
			for(i = 0; i < Config.folds; i++) {
				panel[i] = $('<div>').css({
					'width' : width,
					'height' : height/Config.folds,
					'position' : 'absolute',
					'top' : height/Config.folds,
					'background-image' : 'url('+url+')',
					'background-position' : '0 '+(-height/Config.folds*i)+'px'
				});
												
				if(css3d) {
					panel[i].css({
						'transform-origin' : 'top center',
						'transform-style' : 'preserve-3d',
						'transition' : '0.15s ease-in-out'
					});
					
					gradient[i] = $('<span>').css({
						'display' : 'block',
						'width' : width,
						'height' : height/Config.folds,
						'position' : 'absolute',
						'top' : 0,
						'opacity' : 0,
						'transition' : '0.2s ease-in-out'
					});
					
					function g(m) {
						if(i == Config.start) gradient[i].css('background-image', 'linear-gradient(top, rgba(0, 0, 0, 0.0) 0%, rgba(255, 255, 255, 0.35) 100%)');
						else if(i%2 == m) gradient[i].css('background-image', 'linear-gradient(top, rgba(0, 0, 0, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)');
						else gradient[i].css('background-image', 'linear-gradient(top, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%)');
					}
					
					if(Config.start%2==1) g(1); else g(0);
					panel[i].append(gradient[i]);
				}
							
				if(i==0) $c.append(panel[0].css('top', 0));
				else panel[i-1].append(panel[i]);
			}
			
			if(css3d) {
				var $shadow = $('<div>').css({
					'width' : width,
					'height' : 0,
					'position' : 'absolute',
					'top' : height/Config.folds+1,
					'background-image' : 'linear-gradient(top, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 100%)',
					'transform-origin' : 'top center',
					'transform-style' : 'preserve-3d',
					'transform' : 'translate3d(0,-1px,0) rotate3d(1,0,0,'+ Config.deg +'deg)'
				});
			
				panel[Config.folds-1].append($shadow);
			}
									
			$c.hover(
				function() {
					if(css3d) {
						var rX = Config.deg;
						var s = 1;
						for(i = Config.start; i < Config.folds; i++) {
							if(i > Config.start) rX = s*Config.deg*2;
							s = -s;
							panel[i].css({ 'transform' : 'translate3d(0,-1px,0) rotate3d(1,0,0,'+ rX +'deg)' });
							gradient[i].css({ 'opacity' : 1 });
						}
						
						$shadow.stop().animate({ 'height' : 20 }, 150);
					} else {
						for(i = Config.start; i < Config.folds; i++) {
							panel[i].animate({
								'top' : '-=15px'
							}, 200);
						}
					}
				},
				function() {
					if(css3d) {				
						for(i = 0; i < Config.folds; i++) {
							panel[i].css({ 'transform' : 'translate3d(0,0,0) rotate3d(1,0,0,0)' });
							gradient[i].css({ 'opacity' : 0 });
						}
						
						$shadow.stop().animate({ 'height' : 0 }, 150);
					} else {
						for(i = Config.start; i < Config.folds; i++) {
							panel[i].animate({
								'top' : '+=15px'
							}, 200);
						}
					}
				}
			);
			
		});
	}
		
})(jQuery);