import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export interface OrientationInfo {
  orientation: 'portrait' | 'landscape';
  isPortrait: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
}

export const useOrientation = (): OrientationInfo => {
  const [orientationInfo, setOrientationInfo] = useState<OrientationInfo>(() => {
    const { width, height } = Dimensions.get('window');
    const orientation = width > height ? 'landscape' : 'portrait';
    
    return {
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      width,
      height,
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const { width, height } = window;
      const orientation = width > height ? 'landscape' : 'portrait';
      
      setOrientationInfo({
        orientation,
        isPortrait: orientation === 'portrait',
        isLandscape: orientation === 'landscape',
        width,
        height,
      });
    });

    return () => subscription?.remove();
  }, []);

  return orientationInfo;
};