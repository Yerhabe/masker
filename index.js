"use strict";

module.exports = function () {
	return function () {
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
				if (
					(_fields.length === 0 && _except.length === 0) ||
					objIn == undefined ||
					objIn == null
				) {
					return objIn;
				}

				let shouldDelete = path => _fields.length > 0 ? includes(_fields, path) : !includes(_except, path);
				let includes = (arr, path) => arr.includes(path) || arr.includes([...path.split('.')].pop());

				function _mask(objOut, path, depth) {
					if (
						objOut === undefined ||
						objOut === null ||
						typeof objOut !== 'object' ||
						depth > _maxDepth
					) {
						return {
							returnedObj: objOut,
							shouldDelete: path ? shouldDelete(path) : false
						};
					}

					depth = depth + 1;
					let cloned = new objOut.constructor();

					for (let field of Object.keys(objOut)) {
						let returnedObj;
						let shouldDelete = true;
						let _path = path ? `${path}.${field}` : field;

						if (objOut.hasOwnProperty(field)) {
							({ returnedObj, shouldDelete } = _mask(objOut[field], _path, depth));
						}

						if (!shouldDelete) {
							cloned[field] = returnedObj;
						}
					}

					return cloned;
				}

				return _mask(objIn, undefined, 0);
			}
		};
	}();
};
