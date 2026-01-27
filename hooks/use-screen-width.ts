import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { COLUMN_BREAKPOINT } from '@/constants/config';

export function useScreenWidth() {
  const [width, setWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  return width;
}

export function useIsColumnMode() {
  const width = useScreenWidth();
  return width >= COLUMN_BREAKPOINT;
}
