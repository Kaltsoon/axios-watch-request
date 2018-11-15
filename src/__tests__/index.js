import test from 'ava';

import createEnhancedAdapter from '../index';

const wait = time => new Promise((resolve) => {
  setTimeout(resolve, time);
})

test('test', async t => {
  t.is(true, true);
});