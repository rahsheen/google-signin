import { renderHook } from '@testing-library/react-hooks';
import { useGoogleSignIn } from '../src';

test('should increment counter', () => {
  const { result } = renderHook(() => useGoogleSignIn({}));

  expect(result.current.signIn).toBeTruthy();
});
