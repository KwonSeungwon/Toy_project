/**
 * Ngineeus Lucia Javascript Utility Library
 *
 * @Author: Ngineeus DevGroup
 * @Version: 1.3.6
 * @Support: Modern Browsers and IE9+
 *
 * @Optional_Dependencies:
 *   - ua-parser (v0.7.17) : https://github.com/faisalman/ua-parser-js
 *   - handlebars (v4.0.11) : http://handlebarsjs.com
 *   - axios (v0.18.0) : https://github.com/axios/axios
 *   - sockjs (v1.1.4) : https://github.com/sockjs
 */

var utils = (function(win, doc) {
	'use strict';

	var luciaHostElem = doc.getElementById('lucia-host');
	var lucaiTokenElem = doc.getElementById('lucia-token');
	var luciaMemberElem = doc.getElementById('lucia-member');

	var host = (luciaHostElem && luciaHostElem.content) || (win.location.protocol + '//' + win.location.host);
	var memberInfo = luciaMemberElem.content && luciaMemberElem.content !== 'null' ? JSON.parse(luciaMemberElem.content) : null;

	var TOKEN_SOURCE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	var KEY_CODES = {ALT:18,ARROW_DOWN:40,ARROW_LEFT:37,ARROW_RIGHT:39,ARROW_UP:38,BACKSPACE:8,CTRL:17,DELETE:46,END:35,ENTER:13,ESC:27,HOME:36,PAGE_DOWN:34,PAGE_UP:33,SHIFT:16,SPACE:32,TAB:9};

	function addClassOnDomElement(elems, classNames) {
		return toggleClassOnDomElement(elems, classNames, true);
	}

	function asArray(obj) {
		return isArrayish(obj) ? obj : [obj];
	}

	function attribute(obj, name, value) {
		obj = obj || {};

		if (isString(name) && !value) {
			return obj[name];
		}
		var attrs = name;

		if (!isObject(attrs)) {
			attrs = {};
			attrs[name] = value;
		}
		each(attrs, function(v, k) {
			obj[k] = v;
		});

		return true;
	}

	function buildDate(time) {
		if (time === null || time === undefined) {
			return new Date();
		} else if (isNumber(time)) {
			return new Date(time);
		} else if (isArrayish(time)) {
			return new Date(time[0], parseNumber(time[1], 1) - 1, time[2], time[3] || 0, time[4] || 0, time[5] || 0, time[6] || 0);
		} else if (time instanceof Date) {
			return new Date(time);
		} else if (time instanceof Time) {
			return time.toDate();
		} else if (!isString(time)) {
			return new Date(NaN);
		} else if (isMatched(time, /^(\d{4})-?(\d{2})-?(\d{2})[T|\s]?((\d{2}):?(\d{2}):?((\d{2})\.?(\d{3})?)?)?/)) {
			time = /^(\d{4})-?(\d{2})-?(\d{2})[T|\s]?((\d{2}):?(\d{2}):?((\d{2})\.?(\d{3})?)?)?/.exec(time);
			return buildDate([time[1], time[2], time[3], time[5], time[6], time[8], time[9]]);
		} else {
			return buildDate(time + ' 00:00:00');
		}
	}

	function buildTictac(time) {
		if (time === null || time === undefined) {
			var date = new Date();
			return ((date.getHours() * 60 + date.getMinutes()) * 60	+ date.getSeconds()) * 1000 + date.getMilliseconds();
		} else if (isNumber(time)) {
			return time % 86400000;
		} else if (isArrayish(time)) {
			return ((parseNumber(time[0], 0) * 60 + parseNumber(time[1], 0)) * 60 + parseNumber(time[2], 0)) * 1000 + parseNumber(time[3], 0);
		} else if (time instanceof Date) {
			return time.getTime() % 86400000;
		} else if (time instanceof Time) {
			return time.epoch() % 86400000;
		} else if (time instanceof Clock) {
			return time._tictac;
		} else if (isMatched(time, /^(\d{2}):?(\d{2})(:?(\d{2})(\.?(\d{3}))?)?/)) {
			time = /^(\d{2}):?(\d{2})(:?(\d{2})(\.?(\d{3}))?)?/.exec(time);
			return buildTictac([time[1], time[2], time[4], time[6]]);
		} else {
			return NaN;
		}
	}

	function buildUrl(url, params) {
		if (isEmpty(params)) {
			return url;
		}
		var qs = [];

		each(params, function(value, name) {
			if (isArrayish(value)) {
				each(value, function(v) {
					qs.push(name + '=' + encodeURIComponent(v));
				});
			} else {
				qs.push(name + '=' + encodeURIComponent(value));
			}
		});

		return qs.length ? url + '?' + qs.join('&') : url;
	}

	function calcGcd(n1, n2) {
		n1 = Math.abs(n1);
		n2 = Math.abs(n2);

		var max = Math.max(n1, n2);
		var min = Math.min(n1, n2);

		while (true) {
			if (min === 0) {
				return max;
			}
			max %= min;

			if (max === 0) {
				return min;
			}
			min %= max;
		}
	}

	function calcLcm(n1, n2) {
		return n1 * n2 / calcGcd(n1, n2);
	}

	function clearAuthInfo() {
		luciaMemberElem.content = null;
		memberInfo = null;
	}

	function clock(time) {
		return new Clock(time);
	}

	clock.glossary = function(name, value) {
		if (!name) {
			return clone(Clock.glossary);
		}
		var result = attribute(Clock.glossary, name, value);

		return isBoolean(result) ? this : clone(result);
	};

	function clone(obj) {
		var cloned = obj;

		if (obj instanceof Date) {
			cloned = new Date(obj);
		} else if (obj instanceof RegExp) {
			cloned = new RegExp(obj);
		} else if (Array.isArray(obj)) {
			cloned = [];

			each(obj, function(v) {
				cloned.push(clone(v));
			});
		} else if (isObject(obj)) {
			cloned = {};

			each(obj, function(v, k) {
				cloned[k] = clone(v);
			});
		}
		return cloned;
	}

	function contains(all, obj) {
		var from = 2;
		var found = 0;

		if (!isBoolean(all)) {
			obj = all;
			all = true;
			from = 1;
		}
		var args = extractVarArgs(arguments, from);

		if (isString(obj) || isArrayish(obj)) {
			each(args, function(arg) {
				if (obj.indexOf(arg) >= 0) {
					found++;

					if (!all) {
						return false;
					}
				}
			});
		} else if (isObject(obj)) {
			each(args, function(arg) {
				if (obj[arg] != undefined) {
					found++;

					if (!all) {
						return false;
					}
				}
			});
		}
		return all ? found === args.length : found > 0;
	}

	function diffEpoch(t1, t2, base, floor) {
		var diff = t1.epoch() - t2.epoch();
		return floor ? Math.floor(diff / base) : diff / base;
	}

	function diffMonth(t1, t2, preventTruncating) {
		if (t1.isBefore(t2)) {
			return -1 * diffMonth(t2, t1, preventTruncating);
		}
		var day1 = t1.digits(['Y', 'M', 'D']);
		var day2 = t2.digits(['Y', 'M', 'D']);
		var daysInMonth1 = t1.daysInMonth();
		var daysInMonth2 = t2.daysInMonth();
		var diff = (day1.year - day2.year) * 12 + (day1.month - day2.month);

		if (day1.dayOfMonth === daysInMonth1 && day2.dayOfMonth === daysInMonth2) {
			return diff;
		}
		var delta = day1.dayOfMonth - day2.dayOfMonth;

		if (delta >= 0) {
			return diff + (preventTruncating ? delta / t1.daysInMonth() : 0);
		}
		var daysInMonth3 = t1.minus(1, 'M').slipTo(day2.dayOfMonth).daysInMonth();
		delta = day1.dayOfMonth / daysInMonth1 + (daysInMonth3 - day2.dayOfMonth) / daysInMonth3;

		return diff - 1 + (preventTruncating ? delta : Math.floor(delta));
	}

	function diffTictac(c1, c2, base, floor) {
		var diff = c1._tictac - c2._tictac;
		return floor ? Math.floor(diff / base) : diff / base;
	}

	function diffYear(t1, t2, preventTruncating) {
		var diff = diffMonth(t1, t2, true);
		return preventTruncating ? diff / 12 : Math.floor(diff / 12);
	}

	function displayFraction(n, d) {
		var gcd = calcGcd(n, d);
		var frac = (n * d < 0 ? '-' : '') + Math.abs(n / gcd);

		d = Math.abs(d);

		if (gcd !== d) {
			frac += '/' + (d / gcd);
		}
		return frac;
	}

	function each(obj, fn) {
		if (isArrayish(obj)) {
			for (var i = 0; i < obj.length; i++) {
				if (fn(obj[i], i, obj) === false) {
					break;
				}
			}
		} else if (isObject(obj)) {
			for ( var k in obj) {
				if (!obj.hasOwnProperty(k)) {
					continue;
				}
				if (fn(obj[k], k, obj) === false) {
					break;
				}
			}
		}
		return obj;
	}

	function escape(s) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	function extend(deep, obj) {
		var from = 2;

		if (!isBoolean(deep)) {
			obj = deep;
			deep = false;
			from = 1;
		}
		each(extractVarArgs(arguments, from), function(src) {
			each(deep ? clone(src) : src, function(value, key) {
				if (value !== undefined) {
					obj[key] = value;
				}
			});
		});

		return obj;
	}

	function extractVarArgs(args, from, forces) {
		var firstArg = args[from];
		return forces || !isArrayish(firstArg) ? Array.prototype.slice.call(args, from) : firstArg;
	}

	function findKeyCodeFromEvent(ev) {
		ev = ev || win.event;
		return ev.which || ev.keyCode;
	}

	function form(elem, fieldSelector) {
		return new Form(elem, fieldSelector);
	}

	/**
	 * @deprecated since v1.2.0
	 */
	form.read = function(form, readers) {
		return new Form(form).read(readers);
	};

	/**
	 * @deprecated since v1.2.0
	 */
	form.write = function(form, data, writers) {
		new Form(form).write(data, writers);
		return this;
	};

	function Form(elem, fieldSelector) {
		if (isString(elem)) {
			elem = doc.querySelector(elem);
		}
		if (!elem) {
			throw new ReferenceError('invalid elem for Form object');
		}
		this.elem = elem;
		this.fieldSelector = fieldSelector || '[name]';
	}

	Form.prototype.read = function(readers) {
		readers = readers || {};
		var values = {};

		each(this.elem.querySelectorAll(this.fieldSelector), function(field) {
			if (field.type !== 'radio' || field.checked) {
				readFieldToValues(values, field, readers);
			}
		});

		return values;
	};

	Form.prototype.write = function(data, writers) {
		data = data || {};
		writers = writers || {};

		each(this.elem.querySelectorAll(this.fieldSelector), function(field) {
			var path = field.name;
			var value = property(data, path);
			var write = writers[path];

			if (isFunction(write)) {
				write(field, value);
			} else if (field.type === 'checkbox' || field.type === 'radio') {
				field.checked = field.value == String(value);
			} else {
				field.value = value || '';
			}
		});

		return this;
	};

	function format(pattern) {
		var args = extractVarArgs(arguments, 1);

		return pattern.replace(/\{(\d+)}/g, function(holder, d) {
			var arg = args[parseNumber(d)];
			return arg !== undefined ? arg : holder;
		});
	}

	function formatCurrency(n) {
		if (isNumber(n)) {
			n = n.toString();
		} else if (isString(n)) {
			n = (n[0] === '-' ? '-' : '') + weed(n, /[^0-9]/g);
		} else {
			n = (parseNumber(n) || 0).toString();
		}
		if (isEmpty(n)) {
			return '';
		}
		return parseNumber(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	function formatPhoneNumber(p, withCountry) {
		return (withCountry ? p.country + '-' : '') + p.numbers.join('-');
	}

	function formatTimezoneOffset(offset) {
		if (offset === 0) {
			return 'Z';
		}
		var timezone = [offset > 0 ? '-' : '+'];
		offset = Math.abs(offset);

		timezone.push(padZero(Math.floor(offset / 3600000)), ':', padZero(offset % 3600000));

		return timezone.join('');
	}

	function getMemberInfo() {
		return memberInfo || {};
	}

	function getHost() {
		return host;
	}

	function getUserToken() {
		return (isAuthenticated() && lucaiTokenElem && lucaiTokenElem.content) || null;
	}

	function hasClassOnDomElement(elem, className) {
		return !isEmpty(elem) && hasWord((isArrayish(elem) ? elem[0] : elem).className, className);
	}

	function hasWord(s, word) {
		return !!(s || '').match(new RegExp('(\\s|^)' + word + '(\\s|$)'));
	}

	function insert(s, t) {
		var indexes = extractVarArgs(arguments, 2);

		if (isEmpty(indexes)) {
			return s;
		}
		var result = [];
		var start = 0;

		each(indexes, function(end) {
			result.push(s.slice(start, end));
			start = end;
		});

		result.push(s.slice(start));

		return result.join(t);
	}

	function isAuthenticated() {
		return !!memberInfo;
	}

	function isElementActivated(elem, ev) {
		var keyCode = findKeyCodeFromEvent(ev);

		switch (((isArrayish(elem) ? elem[0] : {}).tagName || '').toLowerCase()) {
		case 'a':
			return keyCode === KEY_CODES.ENTER;
		case 'button':
			return keyCode === KEY_CODES.ENTER || keyCode === KEY_CODES.SPACE;
		default:
			return keyCode === KEY_CODES.SPACE;
		}
	}

	function isArrayish(obj) {
		if (isString(obj)) {
			return false;
		}
		if (Array.isArray(obj)) {
			return true;
		}
		switch (Object.prototype.toString.call(obj)) {
		case '[object HTMLCollection]':
		case '[object NodeList]':
			return true;
		default:
			return obj && isNumber(obj.length) && (obj.length === 0 || obj[0] !== undefined);
		}
	}

	function isBoolean(obj) {
		return isTypeOf(obj, 'boolean');
	}

	function isEmpty(obj) {
		if (obj === undefined || obj === null || obj === NaN) {
			return true;
		}
		if (isString(obj)) {
			return obj.trim().length === 0;
		}
		if (isArrayish(obj)) {
			return obj.length === 0;
		}
		if (obj instanceof HTMLElement) {
			return false;
		}
		if (isObject(obj)) {
			for (var key in obj) {
				if (!isFunction(obj[key])) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	function isEqual(a, b) {
		if (!isTypeOf(a, typeof b)) {
			return false;
		}
		if (isArrayish(a) && isArrayish(b)) {
			if (a.length !== b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				item = a[i];

				if (!isEqual(item, b[i])) {
					return false;
				}
			}
			return true;
		}
		if (isObject(a) && isObject(b)) {
			var keys = Object.keys(a);

			for (var j = 0, k; j < keys.length; j++) {
				k = keys[j];

				if (!isEqual(a[k], b[k])) {
					return false;
				}
			}
			return true;
		}
		return a === b;
	}

	function isFunction(f) {
		return isTypeOf(f, 'function');
	}

	function isMatched(s, pattern) {
		return isString(s) && pattern.test(s);
	}

	function isNumber(n) {
		return isTypeOf(n, 'number');
	}

	function isNumberStrokedEventEmitted(keyCode) {
		var shiftKey = false;

		if (isString(keyCode)) {
			keyCode = parseNumber(keyCode);
		} else if (!isNumber(keyCode)) {
			shiftKey = keyCode.shiftKey;
			keyCode = findKeyCodeFromEvent(keyCode);
		}
		return (!shiftKey && 48 <= keyCode && keyCode <= 57) || (96 <= keyCode && keyCode <= 105);
	}

	function isObject(o) {
		return isTypeOf(o, 'object');
	}

	function isRegExp(o) {
		return o instanceof RegExp;
	}

	function isString(s) {
		return isTypeOf(s, 'string');
	}

	function isTypeOf(v, type) {
		return typeof v === type;
	}

	function isValidDate(s) {
		s = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(s);
		return time.isValidDate(s[1], s[2], s[3]);
	}

	function isValidEmail(s) {
		return isMatched(s, /^.+@.+(\..+)+$/);
	}

	function isValidPhoneNumber(s) {
		return isMatched(s, /^([A-Z]{2})(-\d+)+$/);
	}

	function matches(obj, matcher) {
		var matched = false;

		each(obj, function(v) {
			if (matcher(v)) {
				matched = true;
				return false;
			}
		});

		return matched;
	}

	function noop() {
		// DO NOTHING
	}

	function normalize(s, defaultValue) {
		if (isString(s)) {
			return s.replace(/[A-Z]/g, function($1) {
				return '-' + $1.toLowerCase();
			}).replace(/[<|>|~|\+|\*|#|\s|_|,|\.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
		}
		return defaultValue;
	}

	function openWebSocket(endpoint, options) {
		if (!win.SockJS) {
			throw new ReferenceError('no sockjs included.');
		}
		if (!isAuthenticated()) {
			throw new Error('user not authenticated');
		}
		if (isMatched(endpoint, /^\//)) {
			endpoint = getHost() + endpoint;
		} else if (!isMatched(endpoint, /^(http:\/\/|https:\/\/)/)) {
			endpoint = getHost() + '/' + endpoint;
		}
		options = extend({
			open: noop,
			close: noop,
			receive: noop,
		}, options || {});

		var socket = new win.SockJS(endpoint + '?userToken=' + getUserToken(), {}, token());

		socket.onopen = options.open;
		socket.onclose = options.close;

		socket.onmessage = function(message) {
			options.receive(JSON.parse(message.data));
		};

		return {
			close: function(code, reason) {
				this.instance.close(code, reason);
				return this;
			},
			instance: socket,
			send: function(channel, data) {
				if (!isAuthenticated()) {
					throw new Error('user not authenticated');
				}
				if (!data) {
					data = channel;
					channel = null;
				}
				this.instance.send(JSON.stringify({
					participant: {
						memberId: getMemberInfo().id,
						channel: channel,
					},
					data: data,
					published: time().format()
				}));

				return this;
			}
		};
	}

	function padZero(value, length) {
		length = (length || 2) - value.toString().length;
		return (length > 0 ? (new Array(length + (/\./.test(value) ? 2 : 1))).join('0') : '') + value;
	}

	function pager(page, total, length) {
		var last = total - 1;
		var start = Math.floor(page / length) * length;
		// var calEnd = length === 10 ? start + length : start + 10 ;
		// var end = Math.min(calEnd, total);
		var end = Math.min(start + length, total);
		var serise = [];

		for (var i = start; i < end; i++) {
			serise.push(i);
		}
		return {
			page: page,
			total: total,
			length: length,
			first: start === 0 ? -1 : 0,
			prev: page - 1,
			serise: serise,
			next: total === 0 || page === last ? -1 : page + 1,
			last: last === end - 1 ? -1 : last
		}
	}

	function parallel(fns, callback) {
		var results = [];
		var count = 0;

		each(fns, function(fn, i) {
			fn(function(err, result) {
				results[i] = {
					err: err,
					result: result
				};
				if (++count === fns.length) {
					callback(results);
				}
			});
		});
	}

	function parseAxiosResponse(res) {
		if (!axios) {
			throw new ReferenceError('no axios incluced.');
		}
		var response = (res && res.response) || res || {};
		var data = response.data || {};

		var payload = {
			result: {
				status: -1,
				code: -1,
				message: 'Invalid Response'
			},
			data: res,
			info: {}
		};

		if (!isEmpty(data.result)) {
			payload.result = data.result;
		}
		if (!isEmpty(data.data)) {
			payload.data = data.data;
		}
		if (!isEmpty(data.info)) {
			payload.info = data.info;
		}
		payload.result.status = (response && response.status) || -1;

		return payload;
	}

	function parseNumber(s, defaultValue) {
		if (isNumber(s)) {
			return s;
		}
		if (!isString(s)) {
			return isNumber(defaultValue) ? defaultValue : NaN;
		}
		s = s.replace(/,/g, '');

		if (isNaN(s) || isEmpty(s)) {
			return isNumber(defaultValue) ? defaultValue : NaN;
		}
		return s.search(/\./) < 0 ? parseInt(s, 10) : parseFloat(s);
	}

	function parsePhoneNumber(s) {
		var phoneNumber = {
			country: 'XX',
			numbers: []
		};

		if (!isValidPhoneNumber(s)) {
			return phoneNumber;
		}
		each(s.split(/-/), function(v, i) {
			if (i === 0) {
				phoneNumber.country = v;
			} else {
				phoneNumber.numbers[i - 1] = v;
			}
		});

		return phoneNumber;
	}

	function parseTimezoneOffset(offset) {
		if (offset === 'UTC' || offset === 'utc' || offset === 'U' || offset === 'u') {
			return 0;
		} else if (isNumber(offset)) {
			return offset;
		} else if (offset instanceof Date) {
			return offset.getTimezoneOffset() * 60000;
		} else if (offset instanceof Time) {
			return offset.offset();
		} else if (isEmpty(offset) || !isMatched(offset, /^(Z|z|(([+|-])(\d{2}):(\d{2})))$/)) {
			return new Date().getTimezoneOffset() * 60000;
		}
		offset = /^(Z|z|(([+|-])(\d{2}):(\d{2})))$/.exec(offset);

		if (offset[1].toUpperCase() === 'Z') {
			return 0;
		}
		return (offset[3] === '-' ? 60000 : -60000) * (parseNumber(offset[4], 0) * 60 + parseNumber(offset[5], 0));
	}

	function property(obj, path, value) {
		obj = obj || {};
		path = splitString(path || '', '.');

		if (path.length === 0) {
			return value === undefined ? undefined : false;
		}
		if (path.length === 1) {
			if (value === undefined) {
				return obj[path[0]];
			}
			obj[path[0]] = value;
			return true;
		}
		for (var i = 0, lastIndex = path.length - 1, parent = obj; i < lastIndex; i++) {
			if (parent[path[i]] !== undefined) {
				parent = parent[path[i]];
				continue;
			}
			if (value === undefined) {
				return undefined;
			}
			parent[path[i]] = {};
			parent = parent[path[i]];
		}
		if (value === undefined) {
			return parent[path[lastIndex]];
		}
		parent[path[lastIndex]] = value;
		return true;
	}

	function proxy(obj, fn) {
		return function() {
			return fn.apply(obj, utils.extractVarArgs(arguments, 0, true));
		};
	}

	function readCookie(name) {
		var result = {};

		each(splitString(doc.cookie, /;\s*/), function(cookie) {
			var nameAndValue = cookie.split(/\s*=\s*/);
			var cookieName = decodeURIComponent(nameAndValue[0]);
			var cookieValue = decodeURIComponent(nameAndValue[1]);

			if (name && name === cookieName) {
				result = cookieValue;
				return false;
			}
			if (!name) {
				result[cookieName] = cookieValue;
			}
		});

		return name && isEmpty(result) ? undefined : result;
	}

	function readFieldToValues(values, field, readers) {
		var path = field.name;
		var read = (readers || {})[path];
		var value = isFunction(read) ? read(field) : field.value;

		property(values, path, isEmpty(value) ? null : value);
	}

	function ready(callback) {
		function onReady() {
			callback(win, doc);
		}
		if (doc.readyState === 'complete' || (doc.readyState !== 'loading' && !doc.documentElement.doScroll)) {
			onReady();
		} else {
			doc.addEventListener('DOMContentLoaded', onReady);
		}
	}

	function removeAndAddClassOnDomElement(elems, removals, additions) {
		additions = splitString(additions || [], /\s+/);
		removals = splitString(removals || [], /\s+/).concat(additions);

		additions = additions.length && (' ' + additions.join(' '));
		removals = removals.length && ('(' + removals.join(')|(') + (')'));

		each(asArray(elems), function(elem) {
			var elemClassNames = elem.className || '';

			if (removals) {
				elemClassNames = elemClassNames.replace(new RegExp(removals, 'g'), '');
			}
			if (additions) {
				elemClassNames += additions;
			}
			elem.className = elemClassNames.trim();
		});

		return elems;
	}

	function removeClassOnDomElement(elems, classNames) {
		return toggleClassOnDomElement(elems, classNames, false);
	}

	function removeCookie(name) {
		return writeCookie(name, '', {
			expires: -24
		});
	}

	function removeProperty(obj) {
		each(extractVarArgs(arguments, 1), function(arg) {
			if (isArrayish(obj)) {
				var i =  obj.indexOf(arg);

				if (i >= 0) {
					obj.splice(i, 1);
				}
			} else if (isObject(obj)) {
				delete obj[arg];
			} else {
				return false;
			}
		});

		return obj;
	}

	function showDefaultAlert(options) {
		alert(isString(options) ? options : (options && options.text));
		((options && options.close) || noop)();

		return win;
	}

	function showDefaultConfirm(options) {
		if (confirm(isString(options) ? options : (options && options.text))) {
			options.yes();
		} else {
			(options.no || $.noop)();
		}
		return win;
	}

	function splitString(s, sep) {
		return isString(s) ? (isEmpty(s) ? [] : s.split(sep)) : asArray(s);
	}

	function storage(name) {
		return new Storage(name);
	}

	function time(date) {
		return new Time(date);
	}

	time.daysInMonth = function(year, month) {
		if (year instanceof Date) {
			return new Date(year.getFullYear(), year.getMonth() + 1, 0).getDate();
		} else if (year instanceof Time) {
			return year.daysInMonth();
		} else {
			return new Date(year, month, 0).getDate();
		}
	};

	time.glossary = function(name, value) {
		if (!name) {
			return clone(Time.glossary);
		}
		var result = attribute(Time.glossary, name, value);

		return isBoolean(result) ? this : clone(result);
	};

	time.isValidDate = function(year, month, dayOfMonth) {
		year = parseNumber(year);
		month = parseNumber(month) - 1;
		dayOfMonth = parseNumber(dayOfMonth);

		var date = new Date(year, month, dayOfMonth);

		return date.getFullYear() === year && date.getMonth() === month && date.getDate() === dayOfMonth;
	};

	function timestamp(pattern) {
		return time().format(pattern);
	}

	function toggleClassOnDomElement(elems, classNames, toggle) {
		classNames = splitString(classNames, /\s+/);
		toggle = isFunction(toggle) ? toggle() : toggle;

		each(asArray(elems), function(elem) {
			var elemClassNames = splitString(elem.className, /\s+/);

			each(classNames, function(className) {
				var exists = contains(elemClassNames, className);

				if (isBoolean(toggle) ? toggle : !exists) {
					if (!exists) {
						elemClassNames.push(className);
					}
				} else {
					if (exists) {
						elemClassNames.splice(elemClassNames.indexOf(className), 1);
					}
				}
			});

			elem.className = elemClassNames.join(' ');
		});

		return elems;
	}

	function token(prefix, length) {
		if (isNumber(prefix)) {
			length = prefix;
			prefix = undefined;
		}
		length = length || 32;
		var tokens = [prefix || ''];

		for (var i = 0; i < length; i++) {
			tokens.push(TOKEN_SOURCE[Math.floor(Math.random() * TOKEN_SOURCE.length)]);
		}
		return tokens.join('');
	}

	function unescape(s) {
		return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'');
	}

	function waterfall(fns, callback) {
		fns = clone(fns);

		fns.shift()(function(err, result) {
			waterfallInternal(fns, err, result, callback);
		});
	}

	function waterfallInternal(fns, err, result, callback) {
		(fns.shift() || callback)(err, result, function(e, r) {
			waterfallInternal(fns, e, r, callback);
		});
	}

	function weed(s, pattern) {
		if (!isRegExp(pattern)) {
			pattern = new RegExp(pattern || '', 'g');
		}
		return (s || '').replace(pattern, '');
	}

	function writeCookie(name, value, options) {
		options = extend({
			path: '/',
			expires: 8760,
		}, options);

		if (isNumber(options.expires)) {
			var date = now();
			date.setHours(date.getHours() + options.expires);
			options.expires = date;
		}
		doc.cookie = [
			encodeURIComponent(String(name)), '=', encodeURIComponent(String(value)),
			options.expires && ';expires=' + options.expires.toString(),
			options.path && ';path=' + options.path,
			options.domain && ';domain=' + options.domain,
			options.secure && ';secure=' + options.secure
		].join('');

		return true;
	}

	function Clock(time) {
		this._tictac = buildTictac(time);
	}

	Clock.glossary = {
		am: 'am',
		pm: 'pm'
	};

	Clock.prototype.clone = function() {
		return new Clock(this);
	};

	Clock.prototype.diff = function(clock, unit, preventTruncating) {
		if (isBoolean(unit)) {
			preventTruncating = unit;
			unit = 'm';
		}
		if (!(clock instanceof Clock)) {
			clock = new Clock(clock);
		}
		switch (unit || 'm') {
		case 'hour':
		case 'h':
			return diffTictac(this, clock, 3600000, !preventTruncating);
		case 'minute':
		case 'm':
			return diffTictac(this, clock, 60000, !preventTruncating);
		case 'second':
		case 's':
			return diffTictac(this, clock, 1000, !preventTruncating);
		case 'millisecond':
		case 'S':
			return diffTictac(this, clock, 1, !preventTruncating);
		default:
			return NaN;
		}
	};

	Clock.prototype.digits = function(units) {
		if (!this.isValid()) {
			return {};
		}
		if (units === undefined) {
			units = ['h', 'm', 's', 'S'];
		}
		units = asArray(units);

		var digits = {};
		var values = {};
		var tictac = this._tictac;

		values.millisecond = tictac % 1000;
		tictac = Math.floor(tictac / 1000);
		values.second = tictac % 60;
		tictac = Math.floor(tictac / 60);
		values.minute = tictac % 60;
		values.hour = Math.floor(tictac / 60);

		each(asArray(units), function(unit) {
			switch (unit) {
			case 'hour':
			case 'h':
				digits.hour = values.hour;
				break;
			case 'minute':
			case 'm':
				digits.minute = values.minute;
				break;
			case 'second':
			case 's':
				digits.second = values.second;
				break;
			case 'millisecond':
			case 'S':
				digits.millisecond = values.millisecond;
				break;
			}
		});

		return units.length === 1 ? digits[Object.keys(digits)[0]] : digits;
	};

	Clock.prototype.tictac = function() {
		return this._tictac;
	};

	Clock.prototype.format = function(format) {
		if (format === true) {
			format = 'HH:mm:ss.SSS';
		} else if (!isString(format)) {
			format = 'HH:mm';
		}
		var digits = this.digits();

		return format
			.replace(/HHN/g, digits.hour)
			.replace(/HH/g, padZero(digits.hour))
			.replace(/hhn/g, digits.hour % 12 || 12)
			.replace(/hh/g, padZero(digits.hour % 12 || 12))
			.replace(/AA/g, (digits.hour < 12 ? Time.glossary.am : Time.glossary.pm).toUpperCase())
			.replace(/aa/g, digits.hour < 12 ? Time.glossary.am : Time.glossary.pm)
			.replace(/mmn/g, digits.minute)
			.replace(/mm/g, padZero(digits.minute))
			.replace(/ssn/g, digits.second)
			.replace(/ss/g, padZero(digits.second))
			.replace(/SSSN/g, padZero(digits.millisecond, 3))
			.replace(/SSS/g, padZero(digits.millisecond, 3));
	};

	Clock.prototype.isAfter = function(clock) {
		return this._tictac > clock._tictac;
	};

	Clock.prototype.isBefore = function(clock) {
		return this._tictac < clock._tictac;
	};

	Clock.prototype.isEqual = function(clock) {
		return this._tictac === clock._tictac;
	};

	Clock.prototype.isEqualOrAfter = function(clock) {
		return this._tictac >= clock._tictac;
	};

	Clock.prototype.isEqualOrBefore = function(clock) {
		return this._tictac <= clock._tictac;
	};

	Clock.prototype.isValid = function() {
		return !isNaN(this._tictac);
	};

	Clock.prototype.minus = function(value, unit) {
		return this.plus(-1 * value, unit);
	};

	Clock.prototype.plus = function(value, unit) {
		if (!this.isValid()) {
			new Clock(NaN);
		}
		var tictac = this._tictac;

		switch (unit || 'm') {
		case 'hour':
		case 'h':
			tictac += value * 3600000;
			break;
		case 'minute':
		case 'm':
			tictac += value * 60000;
			break;
		case 'second':
		case 's':
			tictac += value * 1000;
			break;
		case 'millisecond':
		case 'S':
			tictac += value;
			break;
		}
		return new Clock(tictac >= 0 ? tictac : 86400000 + tictac);
	};

	Clock.prototype.slipTo = function(digits, unit) {
		if (!this.isValid()) {
			new Clock(NaN);
		}
		var values = this.digits();
		var options = digits;

		if (!isObject(digits)) {
			options = {};
			options[unit || 'm'] = digits;
		}
		each(options, function(value, name) {
			switch (name) {
			case 'hour':
			case 'h':
				values.hour = value;
				break;
			case 'minute':
			case 'm':
				values.minute = value;
				break;
			case 'second':
			case 's':
				values.second = value;
				break;
			case 'millisecond':
			case 'S':
				values.millisecond = value;
				break;
			}
		});

		return new Clock([values.hour, values.minute, values.second, values.millisecond]);
	};

	Clock.prototype.startOf = function(unit) {
		if (!this.isValid()) {
			new Clock(NaN);
		}
		var digits = this.digits();

		switch (unit || 'D') {
		case 'dayOfMonth':
		case 'day':
		case 'D':
			digits.hour = 0;
			// THRU INTENTIONALLY
		case 'hour':
		case 'h':
			digits.minute = 0;
			// THRU INTENTIONALLY
		case 'minute':
		case 'm':
			digits.second = 0;
			// THRU INTENTIONALLY
		case 'second':
		case 's':
			digits.millisecond = 0;
		}
		return new Clock([digits.hour, digits.minute, digits.second, digits.millisecond]);
	};

	function Storage(name) {
		this._name = name;
		this._data = {};
	}

	Storage.prototype.clear = function() {
		this._data = {};
	};

	Storage.prototype.load = function(path) {
		return property(this._data, path);
	};

	Storage.prototype.remove = function(path) {
		var value = this.load(path);
		var paths = splitString(path, '.');
		var name = paths.pop();
		var obj = paths.length ? (this.load(paths.join('.')) || {}) : this._data;

		delete obj[name];

		return value;
	};

	Storage.prototype.store = function(path, value) {
		return prototype(this._data, path, value);
	};

	Storage.prototype.pop = function() {
		if (!win.localStorage) {
			return false;
		}
		var data = win.localStorage.getItem(this._name);

		if (!isString(data)) {
			return false;
		}
		this._data = JSON.parse(data) || {};

		return true;
	};

	Storage.prototype.push = function() {
		if (!win.localStorage) {
			return false;
		}
		win.localStorage.setItem(this._name, JSON.stringify(this._data));

		return true;
	};

	function Time(date, offset) {
		this._date = buildDate(date);
	}

	Time.glossary = {
		am: 'am',
		months: {
			full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			abbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
		},
		pm: 'pm',
		weekdays: {
			full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thus', 'Fri', 'Sat']
		}
	};

	Time.prototype.clone = function() {
		return new Time(this._date);
	};

	Time.prototype.diff = function(time, unit, preventTruncating) {
		if (isBoolean(unit)) {
			preventTruncating = unit;
			unit = 'D';
		}
		if (!(time instanceof Time)) {
			time = new Time(time);
		}
		switch (unit || 'D') {
		case 'year':
		case 'Y':
			return diffYear(this, time, preventTruncating);
		case 'month':
		case 'M':
			return diffMonth(this, time, preventTruncating);
		case 'dayOfMonth':
		case 'day':
		case 'D':
			return diffEpoch(this, time, 86400000, !preventTruncating);
		case 'hour':
		case 'h':
			return diffEpoch(this, time, 3600000, !preventTruncating);
		case 'minute':
		case 'm':
			return diffEpoch(this, time, 60000, !preventTruncating);
		case 'second':
		case 's':
			return diffEpoch(this, time, 1000, !preventTruncating);
		case 'millisecond':
		case 'S':
			return diffEpoch(this, time, 1, !preventTruncating);
		case 'week':
		case 'W':
			return diffEpoch(this, time, 604800000, !preventTruncating);
		default:
			return NaN;
		}
	};

	Time.prototype.digits = function(units) {
		if (units === undefined) {
			units = ['Y', 'M', 'D', 'h', 'm', 's', 'S', 'W'];
		}
		units = asArray(units);

		var digits = {};
		var date = this._date;

		each(asArray(units), function(unit) {
			switch (unit) {
			case 'year':
			case 'Y':
				digits.year = date.getFullYear();
				break;
			case 'month':
			case 'M':
				digits.month = date.getMonth() + 1;
				break;
			case 'dayOfMonth':
			case 'day':
			case 'D':
				digits.dayOfMonth = date.getDate();
				break;
			case 'hour':
			case 'h':
				digits.hour = date.getHours();
				break;
			case 'minute':
			case 'm':
				digits.minute = date.getMinutes();
				break;
			case 'second':
			case 's':
				digits.second = date.getSeconds();
				break;
			case 'millisecond':
			case 'S':
				digits.millisecond = date.getMilliseconds();
				break;
			case 'dayOfWeek':
			case 'W':
				digits.dayOfWeek = date.getDay();
				break;
			}
		});

		return units.length === 1 ? digits[Object.keys(digits)[0]] : digits;
	};

	Time.prototype.epoch = function() {
		return this._date.getTime();
	};

	Time.prototype.format = function(format) {
		if (format === true) {
			format = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
		} else if (!isString(format)) {
			format = 'YYYY-MM-DDTHH:mm:ssZZ';
		}
		var digits = this.digits();

		return format
			.replace(/YYYY/g, padZero(digits.year, 4))
			.replace(/YY/g, padZero(digits.year % 100))
			.replace(/MMF/g, Time.glossary.months.full[digits.month - 1])
			.replace(/MMA/g, Time.glossary.months.abbr[digits.month - 1])
			.replace(/MMN/g, digits.month)
			.replace(/MM/g, padZero(digits.month))
			.replace(/DDN/g, digits.dayOfMonth)
			.replace(/DD/g, padZero(digits.dayOfMonth))
			.replace(/WWF/g, Time.glossary.weekdays.full[digits.dayOfWeek])
			.replace(/WWA/g, Time.glossary.weekdays.abbr[digits.dayOfWeek])
			.replace(/HHN/g, digits.hour)
			.replace(/HH/g, padZero(digits.hour))
			.replace(/hhn/g, digits.hour % 12 || 12)
			.replace(/hh/g, padZero(digits.hour % 12 || 12))
			.replace(/AA/g, (digits.hour < 12 ? Time.glossary.am : Time.glossary.pm).toUpperCase())
			.replace(/aa/g, digits.hour < 12 ? Time.glossary.am : Time.glossary.pm)
			.replace(/mmn/g, digits.minute)
			.replace(/mm/g, padZero(digits.minute))
			.replace(/ssn/g, digits.second)
			.replace(/ss/g, padZero(digits.second))
			.replace(/SSSN/g, padZero(digits.millisecond, 3))
			.replace(/SSS/g, padZero(digits.millisecond, 3))
			.replace(/ZZ/g, this.offset(true));
	};

	Time.prototype.daysInMonth = function() {
		var digits = this.digits(['Y', 'M']);
		return new Date(digits.year, digits.month, 0).getDate();
	};

	Time.prototype.isAfter = function(time) {
		return this.epoch() > new Time(time).epoch();
	};

	Time.prototype.isBefore = function(time) {
		return this.epoch() < new Time(time).epoch();
	};

	Time.prototype.isEqual = function(time) {
		return this.epoch() === new Time(time).epoch();
	};

	Time.prototype.isEqualOrAfter = function(time) {
		return this.epoch() >= new Time(time).epoch();
	};

	Time.prototype.isEqualOrBefore = function(time) {
		return this.epoch() <= new Time(time).epoch();
	};

	Time.prototype.isLastDayOfMonth = function() {
		return this.digits('D') === this.daysInMonth();
	};

	Time.prototype.isValid = function() {
		return !isNaN(this.epoch());
	};

	Time.prototype.minus = function(value, unit) {
		return this.plus(-1 * value, unit);
	}

	Time.prototype.offset = function(asString) {
		if (!this.isValid()) {
			return NaN;
		}
		var offset = this._date.getTimezoneOffset() * 60000;

		return asString ? formatTimezoneOffset(offset) : offset;
	};

	Time.prototype.plus = function(value, unit) {
		if (!this.isValid()) {
			new Time(NaN);
		}
		var date = this.toDate();

		switch (unit || 'D') {
		case 'year':
		case 'Y':
			date.setFullYear(date.getFullYear() + value);
			break;
		case 'month':
		case 'M':
			date.setMonth(date.getMonth() + value);
			break;
		case 'dayOfMonth':
		case 'day':
		case 'D':
			date.setDate(date.getDate() + value);
			break;
		case 'hour':
		case 'h':
			date.setHours(date.getHours() + value);
			break;
		case 'minute':
		case 'm':
			date.setMinutes(date.getMinutes() + value);
			break;
		case 'second':
		case 's':
			date.setSeconds(date.getSeconds() + value);
			break;
		case 'millisecond':
		case 'S':
			date.setMilliseconds(date.getMilliseconds() + value);
			break;
		case 'dayOfWeek':
		case 'W':
			date.setDate(date.getDate() + value * 7);
			break;
		}
		return new Time(date);
	};

	Time.prototype.slipTo = function(digits, unit) {
		if (!this.isValid()) {
			new Time(NaN);
		}
		var date = this.toDate();
		var options = digits;

		if (!isObject(digits)) {
			options = {};
			options[unit || 'D'] = digits;
		}
		each(options, function(value, name) {
			switch (name) {
			case 'year':
			case 'Y':
				date.setFullYear(value);
				break;
			case 'month':
			case 'M':
				date.setMonth(value - 1);
				break;
			case 'dayOfMonth':
			case 'day':
			case 'D':
				date.setDate(value);
				break;
			case 'hour':
			case 'h':
				date.setHours(value);
				break;
			case 'minute':
			case 'm':
				date.setMinutes(value);
				break;
			case 'second':
			case 's':
				date.setSeconds(value);
				break;
			case 'millisecond':
			case 'S':
				date.setMilliseconds(value);
				break;
			}
		});

		return new Time(date);
	};

	Time.prototype.startOf = function(unit) {
		if (!this.isValid()) {
			new Time(NaN);
		}
		var date = this.toDate();

		switch (unit || 'D') {
		case 'week':
		case 'W':
			return this.minus(date.getDay()).startOf();
		case 'year':
		case 'Y':
			date.setMonth(0);
			// THRU INTENTIONALLY
		case 'month':
		case 'M':
			date.setDate(1);
			// THRU INTENTIONALLY
		case 'dayOfMonth':
		case 'day':
		case 'D':
			date.setHours(0);
			// THRU INTENTIONALLY
		case 'hour':
		case 'h':
			date.setMinutes(0);
			// THRU INTENTIONALLY
		case 'minute':
		case 'm':
			date.setSeconds(0);
			// THRU INTENTIONALLY
		case 'second':
		case 's':
			date.setMilliseconds(0);
		}
		return new Time(date);
	};

	Time.prototype.toDate = function() {
		return new Date(this._date);
	};

	var cache = storage('__cache__');

	var env = (function(ua) {
		var HTMLs = doc.getElementsByTagName('html');

		var component = {
			browser: {
				name: 'unknown',
				version: 0
			},
			device: {
				model: 'unknown',
				type: 'unknown'
			},
			isMobile: function() {
				throw new ReferenceError('no ua-parser included.');
			},
			isNormal: function() {
				throw new ReferenceError('no ua-parser included.');
			},
			isTablet: function() {
				throw new ReferenceError('no ua-parser included.');
			},
			os: {
				name: 'unknown',
				version: 'unknown',
				architecture: 'unknown'
			},
			ua: null
		};

		if (!ua) {
			removeAndAddClassOnDomElement(HTMLs, ['no-js'], ['js', 'no-env']);
			return component;
		}
		var browser = ua.getBrowser() || {};
		var device = ua.getDevice() || {};
		var os = ua.getOS() || {};
		var cpu = ua.getCPU() || {};
		var classNames = [];

		extend(component, {
			browser: {
				name: normalize((browser.name || 'unknown').toLowerCase()),
				version: parseNumber(browser.major, 0)
			},
			device: {
				model: normalize((device.model || 'unknown').toLowerCase()),
				type: normalize((device.type || 'unknown').toLowerCase())
			},
			isMobile: function() {
				return this.device.type === 'mobile';
			},
			isNormal: function() {
				return this.device.type === 'normal';
			},
			isTablet: function() {
				return this.device.type === 'tablet';
			},
			os: {
				name: normalize((os.name || 'unknown').toLowerCase()),
				version: normalize((os.version || 'unknown').toLowerCase()),
				architecture: normalize((cpu.architecture || 'unknown').toLowerCase()),
			},
			ua: ua
		});

		if (component.browser.name === 'ie' && component.browser.version < 9) {
			throw Error('IE8- browsers are not supported.');
		}
		if (component.browser.name === 'ie' && component.browser.version < 12) {
			for (var i = 11; i > component.browser.version; i--) {
				classNames.unshift('lt-ie' + i);
			}
			classNames.unshift('is-ie', 'is-ie' + component.browser.version);
		}
		classNames.unshift('js');
		classNames.push(
			'browser-name-' + component.browser.name,
			'browser-version-' + component.browser.version,
			'device-model-' + component.device.model,
			'device-type-' + component.device.type,
			'os-name-' + component.os.name,
			'os-version-' + component.os.version,
			'os-architecture-' + component.os.architecture
		);

		removeAndAddClassOnDomElement(HTMLs, ['no-js'], classNames);
		return component;
	})(win.UAParser && new win.UAParser());

	var template = (function(handlebars) {
		if (!handlebars) {
			return {
				build: function() {
					throw new ReferenceError('no handlebars included.');
				},
				help: function(helpers) {
					throw new ReferenceError('no handlebars included.');
				},
				handlebars: null
			};
		}

		handlebars.registerHelper('select', function( value, options ){
			var $el = $('<select />').html( options.fn(this) );
			$el.find('[value="' + value + '"]').attr({'selected':'selected'});
			return $el.html();
		});

		handlebars.registerHelper( {
			add: function() {
				for (var i = 0, result = 0; i < arguments.length - 1; i++) {
					result += arguments[i];
				}
				return result;
			},
			and: function() {
				for (var i = 0, result = true; i < arguments.length - 1; i++) {
					result = result && !!arguments[i];
				}
				return result;
			},
			clock: function(c, format) {
				return clock(c).format(format);
			},
			contains: function(obj, item) {
				return contains(obj, item);
			},
			currency: function(n) {
				return formatCurrency(n);
			},
			divide: function(a, b) {
				return a / b;
			},
			empty: function(v) {
				return isEmpty(v);
			},
			eq: function(a, b) {
				return isEqual(a, b);
			},
			exists: function(v) {
				return !isEmpty(v);
			},
			gt: function(a, b) {
				return a > b;
			},
			gte: function(a, b) {
				return a >= b;
			},
			json: function(o) {
				return JSON.stringify(o);
			},
			length: function(c) {
				return (c && c.length) || 0;
			},
			lt: function(a, b) {
				return a < b;
			},
			lte: function(a, b) {
				return a <= b;
			},
			mod: function(a, b) {
				return a % b;
			},
			multiply: function() {
				for (var i = 0, result = 1; i < arguments.length - 1; i++) {
					result *= arguments[i];
				}
				return result;
			},
			ne: function(a, b) {
				return !isEqual(a, b);
			},
			not: function(v) {
				return !v;
			},
			phoneNumber: function(phoneNumber, withCountry) {
				return isEmpty(phoneNumber) ? '' : formatPhoneNumber(isString(phoneNumber) ? parsePhoneNumber(phoneNumber) : phoneNumber, withCountry === true);
			},
			or: function() {
				for (var i = 0, result = false; i < arguments.length - 1; i++) {
					result = result || !!arguments[i];
				}
				return result;
			},
			substract: function(a, b) {
				return a - b;
			},
			time: function(t, format) {
				return utils.isEmpty(t) ? "" : time(t).format(format);
			},
			weed: function(s, pattern) {
				return weed(s, pattern);
			}
		});

		return {
			build: function(templateId, data) {
				return (this.handlebars.compile(doc.getElementById(templateId).innerHTML)(data) || '').trim().replace(/>\s+</g, '><');
			},
			handlebars: handlebars,
			help: function(helpers) {
				this.handlebars.registerHelper(helpers);
				return this.handlebars.helpers;
			}
		};
	})(win.Handlebars);

	return {
		asArray: asArray,
		attr: attribute,
		auth: {
			member: getMemberInfo,
			token: getUserToken,
			isAuthenticated: isAuthenticated
		},
		cache: cache,
		clock: clock,
		clone: clone,
		consts: {
			KEY_CODE: KEY_CODES,
			MAX_PAGE_SIZE: 2147483647
		},
		contains: contains,
		cookie: {
			read: readCookie,
			remove: removeCookie,
			write: writeCookie
		},
		drop: removeProperty,
		each: each,
		element: {
			addClass: addClassOnDomElement,
			hasClass: hasClassOnDomElement,
			ready: ready,
			removeAndAddClass: removeAndAddClassOnDomElement,
			removeClass: removeClassOnDomElement,
			toggleClass: toggleClassOnDomElement
		},
		env: env,
		extractVarArgs: extractVarArgs,
		extend: extend,
		event: {
			isActivated: isElementActivated,
			isNumber: isNumberStrokedEventEmitted,
			keyCode: findKeyCodeFromEvent
		},
		form: form,
		formatter: {
			currency: formatCurrency,
			escape: escape,
			format: format,
			hasWord: hasWord,
			insert: insert,
			isDate: isValidDate,
			isEmail: isValidEmail,
			isMatched: isMatched,
			isPhoneNumber: isValidPhoneNumber,
			normalize: normalize,
			padZero: padZero,
			phoneNumber: formatPhoneNumber,
			timezone: formatTimezoneOffset,
			unescape: unescape,
			weed: weed
		},
		host: getHost,
		isEmpty: isEmpty,
		isEqual: isEqual,
		keyCode: KEY_CODES,
		matches: matches,
		math: {
			frac: displayFraction,
			gcd: calcGcd,
			lcm: calcLcm
		},
		mbox: {
			alert: showDefaultAlert,
			confirm: showDefaultConfirm
		},
		noop: noop,
		pager: pager,
		parallel: parallel,
		parser: {
			number: parseNumber,
			phoneNumber: parsePhoneNumber,
			split: splitString,
			timezone: parseTimezoneOffset
		},
		payload: parseAxiosResponse,
		prop: property,
		proxy: proxy,
		socket: openWebSocket,
		template: template,
		time: time,
		timestamp: timestamp,
		token: token,
		type: {
			isArrayish: isArrayish,
			isBoolean: isBoolean,
			isFunction: isFunction,
			isNumber: isNumber,
			isObject: isObject,
			isString: isString
		},
		url: buildUrl,
		waterfall: waterfall
	};
})(window, document);