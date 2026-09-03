import {
  validateAndFormatAspectRatio,
  getDocumentationItemAspectRatio,
  getHeightFactorFromRatio
} from '../src/lib/aspectRatioUtils.js';
import assert from 'assert';

console.log('====================================================');
console.log('DOCUMENTATION ASPECT RATIO UTILS QA SUITE');
console.log('====================================================\n');

// 1. DATA QA — Valid ratio formats
console.log('1. DATA QA — VALID RATIOS');
assert.strictEqual(validateAndFormatAspectRatio('16 / 9'), '16 / 9');
assert.strictEqual(validateAndFormatAspectRatio('16:9'), '16 / 9');
assert.strictEqual(validateAndFormatAspectRatio('4 / 5'), '4 / 5');
assert.strictEqual(validateAndFormatAspectRatio('4:5'), '4 / 5');
assert.strictEqual(validateAndFormatAspectRatio('3 / 2'), '3 / 2');
assert.strictEqual(validateAndFormatAspectRatio('3:2'), '3 / 2');
assert.strictEqual(validateAndFormatAspectRatio('1 / 1'), '1 / 1');
assert.strictEqual(validateAndFormatAspectRatio('9 / 16'), '9 / 16');
assert.strictEqual(validateAndFormatAspectRatio('21 / 9'), '21 / 9');
assert.strictEqual(validateAndFormatAspectRatio(1.777777), '16 / 9');
assert.strictEqual(validateAndFormatAspectRatio(0.8), '4 / 5');
assert.strictEqual(validateAndFormatAspectRatio(1.5), '3 / 2');
assert.strictEqual(validateAndFormatAspectRatio(1.0), '1 / 1');
assert.strictEqual(validateAndFormatAspectRatio(0.5625), '9 / 16');
console.log('  [PASS] All valid aspect ratios correctly validated and formatted.\n');

// 2. INVALID DATA QA — Fallback triggers
console.log('2. INVALID DATA QA — FALLBACK REJECTION');
assert.strictEqual(validateAndFormatAspectRatio(null), null);
assert.strictEqual(validateAndFormatAspectRatio(undefined), null);
assert.strictEqual(validateAndFormatAspectRatio(''), null);
assert.strictEqual(validateAndFormatAspectRatio('   '), null);
assert.strictEqual(validateAndFormatAspectRatio('0 / 0'), null);
assert.strictEqual(validateAndFormatAspectRatio('1 / 0'), null);
assert.strictEqual(validateAndFormatAspectRatio('-1 / 4'), null);
assert.strictEqual(validateAndFormatAspectRatio('abc / def'), null);
assert.strictEqual(validateAndFormatAspectRatio('NaN'), null);
assert.strictEqual(validateAndFormatAspectRatio('Infinity'), null);
assert.strictEqual(validateAndFormatAspectRatio(-1.5), null);

// Item aspect ratio precedence tests
assert.strictEqual(getDocumentationItemAspectRatio(null), '4 / 5');
assert.strictEqual(getDocumentationItemAspectRatio({}), '4 / 5');
assert.strictEqual(getDocumentationItemAspectRatio({ aspectRatio: '0 / 0' }), '4 / 5');
assert.strictEqual(getDocumentationItemAspectRatio({ aspectRatio: 'invalid' }), '4 / 5');
assert.strictEqual(getDocumentationItemAspectRatio({ aspectRatio: '16 / 9' }), '16 / 9');

// Measured browser ratio precedence
assert.strictEqual(
  getDocumentationItemAspectRatio({ aspectRatio: '4 / 5' }, '16 / 9'),
  '16 / 9'
);
assert.strictEqual(
  getDocumentationItemAspectRatio({ media: [{ aspectRatio: '9 / 16' }] }, '3 / 2'),
  '3 / 2'
);
console.log('  [PASS] All invalid inputs correctly rejected and defaulted to 4 / 5 fallback.\n');

// 3. HEIGHT FACTOR COMPUTATION
console.log('3. HEIGHT FACTOR COMPUTATION');
assert.strictEqual(getHeightFactorFromRatio('16 / 9'), 9 / 16);
assert.strictEqual(getHeightFactorFromRatio('4 / 5'), 5 / 4);
assert.strictEqual(getHeightFactorFromRatio('1 / 1'), 1);
console.log('  [PASS] Height factors correctly derived.\n');

console.log('====================================================');
console.log('SUMMARY: ALL ASPECT RATIO UNIT TESTS PASSED!');
console.log('====================================================');
