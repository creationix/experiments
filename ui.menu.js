(function($) {
$.widget("ui.menu", {
	active: false,
	last_activated: null,
	last_menu_level: null,
	last_level: null,
	timer_id: null,
	_init: function() {
		this._menufy();
	},
	
	deactivate: function () {
		this.$sub_menus.addClass('ui-helper-hidden');
		this.$lis.removeClass('ui-state-active');
		this.active = false;
		this.last_activated = null;
	},

	activate: function(li, force) {
		if (force) {
			this.active = true;
		}
		if (!this.active) {
			return;
		}
		var submenu = li.submenu;
		if (!submenu) {
			return;
		}
		if (this.last_activated == li) {this.last_level = null; return;}
		this.last_activated = li;
		this.last_level = submenu.level;
		this.last_menu_level = submenu.level;
		var menu_entry = $(li);
		if (submenu.level == 0)
		{
			this.deactivate();
			this.active = true;
			menu_entry.addClass('ui-state-active');
			submenu.css('left', (menu_entry.offset().left-1)+"px");
			submenu.css('top', (menu_entry.offset().top+menu_entry.outerHeight()+1)+"px");
		}
		else
		{
			this.$sub_menus.each(function (i, sub_menu) {
				if (sub_menu.level  >= submenu.level)
					$(sub_menu).addClass('ui-helper-hidden');
			});
			var parent_menu = $(li.parentNode);
			submenu.css('left', (parent_menu.offset().left+parent_menu.outerWidth()-1)+"px");
			submenu.css('top', (menu_entry.offset().top-1)+"px");
		}
		// IE6 hack for first level submenu widths being way off
		if (submenu.outerWidth() > 500 || submenu.outerWidth() < 10)
		{
			submenu.css('width', "0px");
		}
		submenu.css('width', submenu.innerWidth() + "px");
		submenu.removeClass('ui-helper-hidden');
	},

   _menufy: function() {
		this.top_level = this.element.children('ul:first, ol:first').eq(0);
		this.$lis = $('li', this.top_level);
		this.$sub_menus = $([]);
		
		var self = this, o = this.options;
		
		function getSubmenus($lis, level)
		{
			if ($lis.length == 0) return;
			var menu = $($lis[0].parentNode);

			// Main menu entries are buttons
			var addState = function(state, el) {
				if (el.is(':not(.ui-state-disabled)')) {
					el.addClass('ui-state-' + state);
				}
			};
			var removeState = function(state, el) {
				el.removeClass('ui-state-' + state);
			};
			if (level == 0)
			{
				$lis.addClass('ui-state-default');
				$lis.eq($lis.length-1).addClass('ui-corner-right');

				$lis.bind('mouseover', function() {
					addState('hover', $(this));
				});
				$lis.bind('mouseout', function() {
					removeState('hover', $(this));
				});
			}
			else
			{
				$lis.bind('mouseover.menu', function() {
					addState('hover', $(this));
				});
				$lis.bind('mouseout.menu', function() {
					removeState('hover', $(this));
				});
			}
			
			var has_images = false;
			// Make empty li elements to be separators
			$lis.each(function (i, li) {
				if (li.innerHTML == '')
				{
					$(li).addClass('ui-menu-separator ui-widget-content');
					$(li).unbind('.menu');
				}
				var $imgs = $('img', li);
				if ($imgs.length)
				{
					$imgs.addClass('ui-helper-reset');
					has_images = true;
				}

				$(li).attr('depth', level - 1);
			});
			if (has_images && level > 0)
				menu.addClass('ui-menu-submenu-images');

			var $ids = $lis.map(function() { return $('a', this)[0]; });
			var has_children = false;
			$ids.each(function(i, a) {
  				
				var href = $(a).attr('href');
				var target = $(a).attr('target');
				var fragmentId = /^#.+/; // Safari 2 reports '#' for an empty hash
				// For dynamically created HTML that contains a hash as href IE < 8 expands
				// such href to the full page url with hash and then misinterprets tab as ajax.
				// Same consideration applies for an added tab with a fragment identifier
				// since a[href=#fragment-identifier] does unexpectedly not match.
				// Thus normalize href attribute...
				if (href.split('#')[0] == location.toString().split('#')[0]) {
					href = a.hash;
				}

				//added to make full bar clickable! -Kyle M.
	            if(href.indexOf('#') !== 0 && target != '_blank')
				{
					var li = a.parentNode;
					li.onclick = function(){window.location=href;};
					li.style.cursor = 'pointer';
				}

				// submenu
				if (fragmentId.test(href)) {
					var li = a.parentNode;
					// Nuke the anchor tag
					li.innerHTML = a.innerHTML;
					li.href = href;
					li.target = target;

					var selector = self._sanitizeSelector(href);
					self.$sub_menus = self.$sub_menus.add(selector);
					var submenu = $(selector);
					li.submenu = submenu;
					submenu[0].level = level;
					submenu.level = level;
					submenu.addClass('ui-helper-hidden');
					
					// Add arrow if there is a submenu.
					var row = $(li);
					var arrow = $('<div class="ui-icon ui-icon-triangle-1-e"></div>');
					row.prepend(arrow);
					if (level > 0)
					{
						has_children = true;
					}
					else
					{
						var item = $(li);
						$(li).css('padding-right', '30px');
						var arrow = $('div', item);
						arrow.css('left', (item.innerWidth()-52) + "px");
					}
					getSubmenus($('li', submenu), level + 1);
				}
			});
			if (has_children && level > 0)
				menu.addClass('ui-menu-submenu-children');
				
			if (level == 0)
			{/*
				$lis.bind('click.tabs', function(e) {
					e.stopPropagation();
					if (self.active)
						self.deactivate();
					else
						self.activate(this, true);
						});*/
				
			$lis.bind('mouseover.tabs', function() {
				if(self.timer_id != null)
				{
					clearTimeout(self.timer_id);
					self.timer_id = null;
				}
					
				self.activate(this, true);
			});

									
			self.$lis.bind('mouseout.tabs', function(e) {
					
					if(self.timer_id != null)
					{
						clearTimeout(self.timer_id);
						self.timer_id = null;
					}
						
					self.timer_id = setTimeout(function () { self.deactivate(); }, 500);
				});
			
			}
			else
			{
				$lis.bind('mouseover.tabs', function(e) {

						if(self.timer_id != null)
						{
						
							clearTimeout(self.timer_id);
							self.timer_id = null;
						}
						
						var depth = $(this).attr('depth');
						self.activate(this, true);

						if(this.submenu)
						{
							this.submenu.removeClass('ui-helper-hidden');
						}
						else
						{
							self.$sub_menus.each(function (i, sub_menu) {
								if (sub_menu.level > depth)
								{
									$(sub_menu).addClass('ui-helper-hidden');
								}
							});
						}
					}
					
					);

										
				self.$sub_menus.bind('mouseout.tabs', function(e) {

						if(self.timer_id != null)
						{
							clearTimeout(self.timer_id);
							self.timer_id = null;
						}
						
						self.timer_id = setTimeout(function () { self.deactivate(); }, 500);
				});
			}


		}

		// attach necessary classes for styling
		this.element.addClass('ui-menu ui-widget');
		this.top_level.addClass('ui-menu-toplevel ui-widget-header ui-helper-reset ui-helper-clearfix');

		// Start the recursive processing
		getSubmenus(this.$lis, 0);

		this.$sub_menus.addClass('ui-helper-reset ui-menu-submenu ui-widget ui-widget-content');

		// deactivate the menu when the page is clicked anywhere
		$(document).bind('click', function (e) {
			// Only catch left clicks
			if (e.button > 0) return;
			e.stopPropagation();
			self.deactivate();
		});

   },
	_sanitizeSelector: function(hash) {
		return hash.replace(/:/g, '\\:'); // we need this because an id may contain a ":"
	}
 });
 
})(jQuery);
