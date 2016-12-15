"use strict";

module.exports = function() {
	return function() {
		let _fields = [];
		let _except = [];
		let _maxDepth = 5;

		return {
			fields(...args) {
				if (_except.length > 0) {
					throw new Error('Cannot set "fields" when "allExcept" is set');
				}

				_fields = _fields.concat(args);
				return this;
			},

			allExcept(...args) {
				if (_fields.length > 0) {
					throw new Error('Cannot set "allExcept" when "fields" is set');
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
				if (_fields.length === 0 && _except.length === 0) {
					return objIn;
				}

				let objOut;

				try {
					objOut = JSON.parse(JSON.stringify(objIn));
				} catch (e) {
					objOut = Object.assign(objIn);
				}

				let shouldDelete = field => _fields.length > 0 ? _fields.includes(field) : !_except.includes(field);

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
