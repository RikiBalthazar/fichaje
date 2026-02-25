import { convertMunitesToCentesimal, convertSecondsToCentesimal } from './time';

/**
 * Tests unitarios para conversion centesimal
 * Ejecutar en Node.js con: node --test src/utils/time.test.ts
 */

// Test 1: 1 hora 30 minutos = 1:50
const test1 = convertMunitesToCentesimal(90);
if (test1 !== '1:50') {
  console.error(`❌ Test 1 failed: expected '1:50', got '${test1}'`);
} else {
  console.log('✓ Test 1 passed: 90 min → 1:50');
}

// Test 2: 15 minutos = 0:25
const test2 = convertMunitesToCentesimal(15);
if (test2 !== '0:25') {
  console.error(`❌ Test 2 failed: expected '0:25', got '${test2}'`);
} else {
  console.log('✓ Test 2 passed: 15 min → 0:25');
}

// Test 3: 45 minutos = 0:75
const test3 = convertMunitesToCentesimal(45);
if (test3 !== '0:75') {
  console.error(`❌ Test 3 failed: expected '0:75', got '${test3}'`);
} else {
  console.log('✓ Test 3 passed: 45 min → 0:75');
}

// Test 4: 60 minutos = 1:00
const test4 = convertMunitesToCentesimal(60);
if (test4 !== '1:00') {
  console.error(`❌ Test 4 failed: expected '1:00', got '${test4}'`);
} else {
  console.log('✓ Test 4 passed: 60 min → 1:00');
}

// Test 5: 30 minutos = 0:50
const test5 = convertMunitesToCentesimal(30);
if (test5 !== '0:50') {
  console.error(`❌ Test 5 failed: expected '0:50', got '${test5}'`);
} else {
  console.log('✓ Test 5 passed: 30 min → 0:50');
}

// Test 6: 5400 segundos (90 min) = 1:50
const test6 = convertSecondsToCentesimal(5400);
if (test6 !== '1:50') {
  console.error(`❌ Test 6 failed: expected '1:50', got '${test6}'`);
} else {
  console.log('✓ Test 6 passed: 5400 sec → 1:50');
}

// Test 7: 0 minutos = 0:00
const test7 = convertMunitesToCentesimal(0);
if (test7 !== '0:00') {
  console.error(`❌ Test 7 failed: expected '0:00', got '${test7}'`);
} else {
  console.log('✓ Test 7 passed: 0 min → 0:00');
}

console.log('\n✨ All centesimal conversion tests completed!');
