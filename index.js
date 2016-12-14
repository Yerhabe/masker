"use strict";

module.exports = function() {
	return function() {
		let _only = [];
		let _except = [];
		let _maxDepth = 5;

		return {
			only(...args) {
				if (_except.length > 0) {
					throw new Error('Cannot set "only" when "except" is set');
				}

				_only = _only.concat(args);
				return this;
			},

			except(...args) {
				if (_only.length > 0) {
					throw new Error('Cannot set "except" when "only" is set');
				}

				_except = _except.concat(args);
				return this;
			},

			maxDepth(depth) {
				if (depth) {
					_maxDepth = depth;
				}
				return this;
			},

			mask(objIn) {
				if (_only.length === 0 && _except.length === 0) {
					return objIn;
				}

				let objOut;

				try {
					objOut = JSON.parse(JSON.stringify(objIn));
				} catch (e) {
					objOut = Object.assign(objIn);
				}

				let shouldDelete = field => _only.length > 0 ? _only.includes(field) : !_except.includes(field);

				return function _mask(objOut, depth) {
					depth = depth + 1;
					if (typeof objOut !== 'object' || depth > _maxDepth) {
						return objOut;
					}

					for (let field of Object.keys(objOut)) {
						if (shouldDelete(field)) {
							delete objOut[field];
						} else if (typeof objOut[field] === 'object') {
							_mask(objOut[field], depth);
						}
					}

					return objOut;
				}(objOut, 0);
			}
		};
	}();
};
