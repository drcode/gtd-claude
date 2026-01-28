import { useWindowDimensions } from 'react-native';
import { COLUMN_BREAKPOINT } from '@/constants/config';

export function useScreenWidth() {
  const { width } = useWindowDimensions();
  return width;
}

export function useIsColumnMode() {
  const width = useScreenWidth();
  return width >= COLUMN_BREAKPOINT;
}
