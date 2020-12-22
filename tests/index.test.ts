import { testing_asserts } from '../dev_deps.ts';

Deno.test('test 1', () => {
  const x = 1 + 2;
  testing_asserts.assertEquals(x, 3);
  testing_asserts.assertArrayIncludes([1, 2, 3, 4, 5, 6], [3], "Expected 3 to be in the array");
});
