// Source: easy_grid.js
// Author: ecluzhang@tencent.com
//   Mail: zxteloiv@gmail.com
// BSD license
//

//this.EasyGrid = this.EasyGrid || {};


(function(jq, scope) {

	// easy_grid is a closure ensure data members are private
	// and not visible for an object
	scope.easy_grid = function(conf) {
		var _data = conf.data || {}
		, _holder = conf.holder || {}
		, _fields = conf.fields || []
		, _paging = conf.paging || 20
		, _grid_name = conf.name || ''
		, _cur_page = 1
		, _sort_field = ''
		, _sort_type = 'asc'
		, _graph;

		var _meaning_map = {
			'date':'日期',
			'interest_id':'兴趣类目ID',
			'interest_name':'兴趣类目名称',
			'user_count':'覆盖用户数',
		};

		var _dynamicSortAsc = function(property) {
			return function(a,b) {
				return (a[property] < b[property]) ? -1 : ((a[property] > b[property]) ? 1 : 0);
			}
		};
		
		var _dynamicSortDesc = function(property) {
			return function(a,b) {
				return (a[property] > b[property]) ? -1 : ((a[property] < b[property]) ? 1 : 0);
			}
		};

		var _ascClick = function(obj) {
			return function() {
				var el = jq(this);
				var name = el.parent('td').find('.head_field').attr('name');
				obj.sortDataAsc(name).cleanView().show().showPlot();
			}
		};

		var _descClick = function(obj) {
			return function() {
				var el = jq(this);
				var name = el.parent('td').find('.head_field').attr('name');
				obj.sortDataDesc(name).cleanView().show().showPlot();
			}
		};

		var _movePrevClick = function(obj) {
			return function() { obj.movePrev().cleanView().show().showPlot(); }
		};
		
		var _moveNextClick = function(obj) {
			return function() { obj.moveNext().cleanView().show().showPlot(); }
		};

		return {
			bindData: function(data) { _data = data; return this; },
			bindGraph: function(g) { _graph = g; return this; },

			getHolder: function() { return _holder; },

			cleanView: function() { _holder.empty(); return this; },

			getFields: function() { return _fields; },
			setFields: function(fields) { _fields = fields; return this; },

			detectFields: function() {
				if (_data
					&& typeof _data === 'array'
					&& _data.length > 0
					&& typeof(_data[0]) === 'object') {
					_fields = [];
					for (var key in _data[0])
						_fields.push(key);
				}
				return this;
			},

			sortDataAsc: function(on_field) {
				_sort_field = on_field;
				_data.sort(_dynamicSortAsc(_sort_field));
				_sort_type = 'asc';
				return this;
			},

			sortDataDesc: function(on_field) {
				_sort_field = on_field;
				_data.sort(_dynamicSortDesc(_sort_field));
				_sort_type = 'desc';
				return this;
			},

			movePrev: function() { if (_cur_page > 0) _cur_page--; return this; },
			moveNext: function() { if (this.getShowPage() < this.getPageCount()) _cur_page++; return this; },

			getPageCount: function() { return Math.ceil(_data.length / _paging); },

			getShowPage: function() { return _cur_page + 1; },
			setShowPage: function(show_page) { _cur_page = show_page || _cur_page || 0; return this; },

			getPageSize: function() { return _paging; },
			setPageSize: function(paging) { _paging = paging; return this; },

			_getPagingHtml: function() {
				var html = '';
				if (_cur_page > 0)
					html += '<a href="#" type="move_prev">&lt;--</a>&nbsp;';
				html += this.getShowPage() + ' of ' + this.getPageCount();
				if (this.getShowPage() < this.getPageCount())
					html += '&nbsp;<a href="#" type="move_next">--&gt;</a>';
				return html;
			},

			_getSortHtml: function(field_name) {
				var html = '';
				html += '<a href="#" type="asc_sort"><span style="font-size:9px">ASC</span></a>&nbsp;';
				html += '<a href="#" type="desc_sort"><span style="font-size:9px">DESC</span></a>';
				return html;
			},

			show: function(show_page) {
				var key = '';
				var fi = 0;
				var id = 0;
				_cur_page = show_page ? (show_page - 1) : (_cur_page || 0);

				if (this.getPageCount() === 0) {
					_holder.append('no data');
					_cur_page = 0;
					return this;
				}
				_holder.empty();

				var new_html = '';

				new_html += '<div class="easy_grid_style">';
				//new_html += '<div>'
				new_html += this._getPagingHtml() + '<br/>';
				new_html += '<table>';

				// write header
				new_html += '<tr>';
				if (_fields && typeof(_fields) == 'array')
					for (fi = 0; fi < _fields.length; fi++)
						new_html += '<td><span class="head_field" name="'+_fields[fi]+'">' + _meaning_map[_fields[fi]] + '</span></td>';
				else
					for (key in _data[id])
						new_html += '<td><span class="head_field" name='+key+'>' + _meaning_map[key] + '</span></td>';
				new_html += '</tr>';

				// write body
				for (id = _paging * _cur_page; id < _data.length && id < (_cur_page + 1) * _paging; id++) {
					new_html += '<tr>';
					if (_fields && typeof(_fields) == 'array')
						for (fi = 0; fi < _fields.length; fi++)
							new_html += '<td>' + _data[id][_fields[fi]] + '</td>';
					else
						for (key in _data[id])
							new_html += '<td>' + _data[id][key] + '</td>';
					new_html += '</tr>';
				}

				new_html += '</table>';
				new_html += '</div>';

				var obj = this;
				_holder.append(new_html);
				_holder.find('a[type="move_prev"]').click(_movePrevClick(obj));
				_holder.find('a[type="move_next"]').click(_moveNextClick(obj));
				return this;
			},

			showPlot: function(graph_obj) {
				_graph = graph_obj || _graph;
				if (!_graph) return this;
				_holder.find('td .head_field').each(function(){
					var el = jq(this);
					var name = el.attr('name');
					var check = jq('<input type="checkbox" name="' + name + '" >');
					var label = jq('<span>plot</span>');
					label.css('font-size','9px');
					el.parent('td').append(check).append(label);
				});
				_holder.find('td input[type="checkbox"]').click(function(){
					_graph.setSeries([]);
					_holder.find('td input[type="checkbox"]:checked')
						.each(function(){
							_graph.appendSeries(jq(this).attr('name'));
						});
					_graph.show();
				});
				return this;
			}
		};
	};

	scope.oa_line_chart = function(conf) {
		var _path = "http://chart.oa.com/chart.php?"
			, _width = conf.width || 320
			, _height = conf.height || 240
			, _data = conf.data
			, _holder = conf.holder
			, _x_axis = conf.x || ''
			, _series = conf.series || [];

		return {
			getHolder: function() { return _holder; },
			setWidth: function(w) { _width = w; _holder.css('width', w); return this; },
			getWidth: function() { return _width; },
			getHeight: function() { return _height; },
			setHeight: function(h) { _height = h; _holder.css('height', h); return this; },
			setX: function(x) {
				_x_axis = x;
				_data.sort(function(a,b){
					return (a[x] < b[x]) ? -1 : ((a[x] > b[x]) ? 1 : 0);
				});
				return this;
			},
			getX: function() { return _x_axis; },
			setSeries: function(s) {_series = s; return this; },
			getSeries: function() { return _series; },
			appendSeries: function(s) { _series.push(s); return this; },
			bindData: function(d,x) {
				_data = d;
				_x_axis = x || _x_axis;
				if (!_x_axis)
					return;
				_data.sort(function(a,b){
					return (a[_x_axis] < b[_x_axis]) ? -1 : ((a[_x_axis] > b[_x_axis]) ? 1 : 0);
				});
				return this;
			},
			getData: function() { return _data; },
			getUrl: function() {
				if (_series.length === 0 || _data.length === 0)
					return false;
				// line chart
				var param = "cht=lc";
				// width & height
				param += "&chs=" + _width + "x" + _height;
				// x axis values
				param += "&chxl=0:";
				for (var i = 0; i < _data.length; i++)
					param += "|" + _data[i][_x_axis];
				// series list
				param += "&chdl=";
				for (var s = 0; s < _series.length; s++)
					param += _series[s] + "|";
				param = param.replace(/\|$/,"&chd=t:");
				// data for each series
				for (var s = 0; s < _series.length; s++) {
					for (var i = 0; i < _data.length; i++)
						param += _data[i][_series[s]] + ",";
					param = param.replace(/,$/,"|");
				}
				param = param.replace(/\|$/,"");

				return _path + param;
			},
			show: function() {
				var url = this.getUrl();
				if (!url) return;
				var img = jq('<img />');
				img.css('width', _width);
				img.css('height', _height);
				_holder.empty();
				img.attr('src', url);
				_holder.append(img);
			}
		};
	};

	scope.raphael_line = function(conf) {
		var my_chart = scope.oa_line_chart(conf);
		my_chart.autoSize = function() {
			var data = this.getData();
			var len = data.length;
			this.setHeight('240');
			if (len <= 7)
				this.setWidth('640').setHeight('240');
			else if (len <= 14)
				this.setWidth('640').setHeight('240');
			else
				this.setWidth('1024').setHeight('240');

			return this;
		};

		my_chart.show = function() {
			this.getHolder().empty();
			var data = this.getData()
				, width = this.getWidth()
				, height = this.getHeight()
				, series = this.getSeries()
				obj = this;
			var x = [], y = {}, data_label = {};
			var x_interval = (data.length > 14) ? 7 : 4;
			var show_label = (data.length > 7) ? true : false;
			for (var i = 0; i < series.length; i++) {
				y[series[i]] = [];
				data_label[series[i]] = (function(a_series) {
					return function(idx, value) {
						return a_series + "@" + data[idx][obj.getX()] + ":" + value;
					}
				})(series[i]);
				for (var j = 0; j < data.length; j++) {
					x[j] = (j % x_interval === Math.ceil(x_interval / 2)) ? data[j][this.getX()] : '';
					y[series[i]][j] = data[j][series[i]];
				}
			}
			var linegraph = new Grafico.LineGraph($(this.getHolder().attr('id')), y, {
				grid :                  true,
				plot_padding :          0,
				curve_amount :          0,
				start_at_zero :         false,
				stroke_width :          2,
				show_vertical_labels:	show_label,
				show_ticks:				true,
				label_rotation :        -30,
				font_size :             11,
				background_color :      "#fff",
				label_color :           "#444",
				grid_color :            "#ccf",
				markers :               "value",
				meanline:				{'stoke-width':'2px', stroke: '#000' },
				draw_axis :             true,
				labels :                x,
				hide_empty_label_grid : true,
				datalabels:				data_label
			});
		};

		return my_chart;
	};

})(jQuery, this);


