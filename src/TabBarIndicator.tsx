import type { Route, SceneRendererProps } from 'react-native-tab-view';
import type { NavigationState } from 'react-native-tab-view';
import * as React from 'react';
import { Animated, Easing, Platform, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useAnimatedValue } from './useAnimatedValue';

export type GetTabWidth = (index: number) => number;

export type Props<T extends Route> = SceneRendererProps & {
  navigationState: NavigationState<T>;
  width?: 'auto' | `${number}%` | number;
  getTabWidth?: GetTabWidth;
  direction?: 'ltr' | 'rtl';
  style?: StyleProp<ViewStyle>;
  gap?: number;
  children?: React.ReactNode;
};

const useNativeDriver = Platform.OS !== 'web';

export function TabBarIndicator<T extends Route>({
  getTabWidth = () => 0,
  layout,
  navigationState,
  position,
  width = 'auto',
  direction = 'ltr',
  gap = 0,
  style,
  children,
}: Props<T>) {
  const isIndicatorShown = React.useRef(false);
  const isWidthDynamic = width === 'auto';
  const opacity = useAnimatedValue(isWidthDynamic ? 0 : 1);
  const isIos: boolean = Platform.OS === 'ios';

  // fade-in logic
  const indicatorVisible = isWidthDynamic
    ? layout.width && navigationState.routes.slice(0, navigationState.index).every((_, r) => getTabWidth(r))
    : true;
  React.useEffect(() => {
    if (!isIndicatorShown.current && isWidthDynamic && indicatorVisible) {
      isIndicatorShown.current = true;
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.linear),
        useNativeDriver,
      }).start();
    }
    return () => opacity.stopAnimation();
  }, [indicatorVisible, isWidthDynamic, opacity]);

  const { routes } = navigationState;

  // Handle case with single route
  if (!routes || routes.length === 0) {
    return null;
  }

  // calculate dynamic dimensions based on layout.height
  const barHeight = layout.height;
  const indicatorHeight = barHeight * 0.8;
  const indicatorTop = barHeight * 0.1;
  const capHeight = barHeight * 0.5;
  const capWidth = 20;
  const capTop = barHeight * 0.25;

  // If there's only one tab, create a simple non-animated version
  if (routes.length === 1) {
    const tabWidth = getTabWidth(0);

    const singlePillStyle = [
      styles.pillBase,
      {
        top: indicatorTop,
        height: indicatorHeight,
        width: isWidthDynamic ? tabWidth : (width as number),
        borderRadius: indicatorHeight / 2,
        left: layout.width / 2 - (isWidthDynamic ? tabWidth : (width as number)) / 2,
      },
      style,
    ];

    return (
      <>
        {/* Main pill body for single tab */}
        <View style={singlePillStyle}>
          <Text>{children}</Text>
        </View>
      </>
    );
  }

  const inputRange = routes.map((_, i) => i);

  // compute base offsets for left edge of each tab
  const offsets = routes.map((_, i) => routes.slice(0, i).reduce((sum, _, j) => sum + getTabWidth(j) + gap, 0));

  // 1) translate for main pill
  const translateBase = position.interpolate({
    inputRange,
    outputRange: offsets,
    extrapolate: 'clamp',
  });
  const translateBaseD = direction === 'rtl' ? Animated.multiply(translateBase, -1) : translateBase;

  // 2) scaleX to stretch pill
  const scaleX = isWidthDynamic
    ? position.interpolate({
        inputRange,
        outputRange: routes.map((_, i) => getTabWidth(i)),
        extrapolate: 'clamp',
      })
    : (width as number);

  // 3) adjust center by ±0.5px
  const adjustCenter = direction === 'rtl' ? -0.5 : 0.5;

  const calculateOffset = (x: number, i: number, isRight: boolean) => {
    const tabWidth = getTabWidth(i);
    const baseOffset = x + adjustCenter - capWidth / 2;

    if (tabWidth > 80) {
      return isRight
        ? x + tabWidth - capWidth / 2 + (isIos ? 0 : -capWidth / 5)
        : baseOffset + (isIos ? 0 : capWidth / 5);
    }

    return isRight ? baseOffset + (tabWidth - adjustCenter) : baseOffset;
  };

  // 4) translate for left cap
  const outputLeft = offsets.map((x, i) => calculateOffset(x, i, false));
  const translateXLeft = position.interpolate({
    inputRange,
    outputRange: outputLeft,
    extrapolate: 'clamp',
  });

  // 5) translate for right cap
  const outputRight = offsets.map((x, i) => calculateOffset(x, i, true));
  const translateXRight = position.interpolate({
    inputRange,
    outputRange: outputRight,
    extrapolate: 'clamp',
  });

  // style list for main pill body
  const styleList: StyleProp<ViewStyle> = [];
  if (Platform.OS === 'web' && isWidthDynamic) {
    styleList.push({ width: scaleX }, { left: translateBaseD });
  } else {
    styleList.push(
      { width: isWidthDynamic ? 1 : (width as number) },
      { transform: [{ translateX: translateBaseD }, { scaleX }, { translateX: adjustCenter }] }
    );
  }

  const pillStyle = [
    styles.pillBase,
    {
      top: indicatorTop,
      height: indicatorHeight,
      borderRadius: indicatorHeight / 2,
    },
    styleList,
    isWidthDynamic ? { opacity } : null,
    style,
    { backgroundColor: '#000' },
  ];

  const leftCapStyle = [
    styles.capBase,
    styles.leftCap,
    {
      top: capTop,
      height: capHeight,
      width: capWidth,
      transform: [{ translateX: translateXLeft }],
    },
    { backgroundColor: '#000' },
  ];

  const rightCapStyle = [
    styles.capBase,
    styles.rightCap,
    {
      top: capTop,
      height: capHeight,
      width: capWidth,
      transform: [{ translateX: translateXRight }],
    },
    { backgroundColor: '#000' },
  ];

  return (
    <>
      {/* Main pill body */}
      <Animated.View style={pillStyle}>{children}</Animated.View>

      {/* Left cap */}
      {/* <Animated.View style={leftCapStyle} /> */}

      {/* Right cap */}
      {/* <Animated.View style={rightCapStyle} /> */}
    </>
  );
}

const styles = StyleSheet.create({
  pillBase: {
    position: 'absolute',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  capBase: {
    position: 'absolute',
    backgroundColor: '#000',
  },
  leftCap: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rightCap: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});
