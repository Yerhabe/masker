let should = require('chai').should();
let expect = require('chai').expect;
let masker = require('../index')

let testData;

function resetTestData() {
	testData = {
		highestOne: {
			middleOne: "middleOneVal"
		},
		highestTwo: null,
		highestThree: [
			'arrOne',
			{ 'arrTwo': 'arrTwoVal' },
			{ 'arrThree': { 'arrThreeChild': ['arrThreeArrOne'] } }
		],
		highestFour: {
			middleFour: null
		},
		highestFive: {
			middleFive: {
				lowestFive: 'lowestFiveVal'
			}
		},
		highestSix: undefined
	};
}

describe('mask', function () {
	beforeEach('reset testData', resetTestData);

	it('should not blow up when given an undefined object', function () {
		let maskedData = masker()
			.fields('highestOne', 'lowestFive')
			.mask(undefined)

		expect(maskedData).to.be.undefined;
	});

	it('should mask the given fields', function () {
		let maskedData = masker()
			.fields('highestOne', 'lowestFive')
			.mask(testData)

		maskedData.should.not.have.property('highestOne');
		maskedData.should.not.have.deep.property('highestFive.middleFive.lowestFive');
	});

	it('should mask the given fields without affecting the passed in object', function () {
		let maskedData = masker()
			.fields('highestOne', 'lowestFive')
			.mask(testData)

		maskedData.should.not.have.property('highestOne');
		maskedData.should.not.have.deep.property('highestFive.middleFive.lowestFive');

		testData.should.have.property('highestOne');
		testData.should.have.deep.property('highestFive.middleFive.lowestFive');
	});

	it('should mask all except the give fields', function () {
		let maskedData = masker()
			.allExcept('highestOne', 'middleOne', 'highestThree', 'arrThree')
			.mask(testData)

		maskedData.should.not.have.property('highestTwo');
		maskedData.should.not.have.property('highestFour');
		maskedData.should.not.have.property('highestFive');
		maskedData.should.not.have.property('highestSix');
		maskedData.should.not.have.deep.property('highestThree.arrTwo');
		maskedData.should.not.have.deep.property('highestThree.arrThree.arrThreeChild');
	});

	it('should mask the given dotted fields', function () {
		let testData = {
			a: 'parentA',
			b: {
				a: 'childA'
			}
		};

		let maskedData = masker()
			.fields('b.a')
			.mask(testData)

		maskedData.should.have.property('a');
		maskedData.should.not.have.deep.property('b.a');
	});

	it('should mask all except the given dotted fields', function () {
		let testData = {
			a: 'parentA',
			b: {
				a: 'childA'
			},
			c: null,
			d: {
				a: undefined
			}
		};

		let maskedData = masker()
			.allExcept('b', 'b.a')
			.mask(testData)

		maskedData.should.not.have.property('a');
		maskedData.should.not.have.property('c');
		maskedData.should.not.have.property('d');
		maskedData.should.have.deep.property('b.a');
	});
});

describe('maxDepth', function () {
	beforeEach('reset testData', resetTestData);

	it('should not recurse past the max depth', function () {
		let maskedData = masker()
			.maxDepth(1)
			.fields('lowestFive')
			.mask(testData)

		maskedData.should.have.deep.property('highestFive.middleFive.lowestFive');
	});
});
