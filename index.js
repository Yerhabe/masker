"use strict";

module.exports = function() {
	return function() {
		let _fields = [];
		let _maxDepth = 5;

		return {
			fields(...args) {
				_fields = _fields.concat(args);
				return this;
			},

			maxDepth(depth) {
				if (depth) {
					_maxDepth = depth;
				}
				return this;
			},

			mask(objIn) {
				let objOut;

				try {
					objOut = JSON.parse(JSON.stringify(objIn));
				} catch (e) {
					objOut = Object.assign(objIn);
				}

				return function _mask(objOut, depth) {
					depth = depth + 1;
					if (typeof objOut !== 'object' || depth > _maxDepth) {
						return objOut;
					}

					for (let field of Object.keys(objOut)) {
						if (_fields.includes(field)) {
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
