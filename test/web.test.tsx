import { renderHook, act } from '@testing-library/react-hooks';
import { useGoogleSignIn } from '../src';

test('should increment counter', () => {
  const { result } = renderHook(() => useGoogleSignIn({}));

  act(() => {
    result.current.signIn();
  });

  expect(result.current.userInfo).toBe(1);
});
