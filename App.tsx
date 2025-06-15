/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useState, useMemo, memo } from 'react';
import type {PropsWithChildren} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
  InteractionManager,
  TextProps,
} from 'react-native';
import { TabView, SceneMap, TabBar, SceneRendererProps, NavigationState, TabBarItemProps, TabBarItem } from 'react-native-tab-view';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { useOrientation } from './src/useOrientation';
import { agents, groupedNews } from './src/constaint';
import ItemTopNews from './src/ItemTopNews';
import { TabBarIndicator } from './src/TabBarIndicator';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

type Route = { key: string; title: string };


interface CustomTabBarItemProps extends TabBarItemProps<Route> {
  labelProps?: TextProps;
}

// Tạo component riêng để tránh re-render
const NewsListItem = memo(({ item, index }: { item: any; index: number }) => {
  return <ItemTopNews index={index} news={item} />;
});

const CustomTabBarItem = (props: CustomTabBarItemProps) => {
  return <TabBarItem {...props} />;
};

const customTabInficator = (props: SceneRendererProps & { navigationState: NavigationState<Route> }) => {
  return <TabBarIndicator {...props} />;
};

const NewsListHeader = memo(({ contentData }: { contentData: any[] }) => {
  if (contentData.length === 0) return null;
  return (
    <ItemTopNews
      index={0}
      news={contentData[0]}
      imageStyle={{ width: 360, height: 200 }}
    />
  );
});

const EmptyComponent = memo(() => (
  <View style={styles.noItemsView}>
    <Text style={[styles.noItemsText]}>{'no_items_to_show'}</Text>
  </View>
));

// Optimize styles - extract inline styles
const landscapeContainerStyle = { flex: 1, flexDirection: 'row' as const };
const landscapeImageContainerStyle = { flex: 1 };
const landscapeListContainerStyle = { flex: 1 };
const portraitContainerStyle = { flex: 1 };
const landscapeImageStyle = { width: '100%' as any, height: 180 };
const portraitImageStyle = { width: 360, height: 200 };
const flatListContentStyle = { paddingBottom: 24 };

// Scene component với memo
const TabScene = memo(({ route, realGroupedNewsData, isLandscape }: { 
  route: Route; 
  realGroupedNewsData: any[];
  isLandscape: boolean;
}) => {
  const group = realGroupedNewsData.find((g) => `tab_${g.realIndex}` === route.key);

  if (!group) {
    return <EmptyComponent />;
  }

  const contentData = group.data;
  
  if (!contentData || contentData.length === 0) {
    return <EmptyComponent />;
  }

  if (isLandscape) {
    return (
      <View style={landscapeContainerStyle}>
        <View style={landscapeImageContainerStyle}>
          {contentData[0] && (
            <ItemTopNews
              index={0}
              news={contentData[0]}
              imageStyle={landscapeImageStyle}
            />
          )}
        </View>
        <View style={landscapeListContainerStyle}>
          <FlatList
            style={styles.newsList}
            contentContainerStyle={flatListContentStyle}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => `#${item.id}`}
            data={contentData.slice(1)}
            renderItem={({ item, index }) => <NewsListItem item={item} index={index} />}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            initialNumToRender={5}
            ListEmptyComponent={EmptyComponent}
            getItemLayout={(data, index) => ({
              length: 100, // estimated item height
              offset: 100 * index,
              index
            })}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={portraitContainerStyle}>
      <FlatList
        style={styles.newsList}
        contentContainerStyle={flatListContentStyle}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `#${item.id}`}
        data={contentData.slice(1)}
        renderItem={({ item, index }) => <NewsListItem item={item} index={index} />}
        ListHeaderComponent={<NewsListHeader contentData={contentData} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        ListEmptyComponent={EmptyComponent}
        getItemLayout={(data, index) => ({
          length: 100, // estimated item height
          offset: 100 * index + 200, // plus header height
          index
        })}
      />
    </View>
  );
});

function NewsList(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const { orientation, isLandscape, isPortrait } = useOrientation();
  
  // Memoize để tránh tính toán lại
  const windowWidth = useMemo(() => {
    return Dimensions.get('window').width || layout.width;
  }, [layout.width]);
  
  // Memoize data transformation
  const realGroupedNewsData = useMemo(() => {
    return groupedNews.map((group, index) => ({
      ...group,
      realIndex: index,
    }));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const realGroupedNewsData: any[] = groupedNews.map((group, index) => ({
      ...group,
      realIndex: index,
    }));
    if (realGroupedNewsData.length > 0) {
      const agentTitleByIndex: Record<number, string> = {};
      agents.forEach((agent) => {
        agentTitleByIndex[agent.data.index] = agent.title;
      });

      const newRoutes: any[] = realGroupedNewsData.map((g) => {
        const lookupKey = g.realIndex! + 1;
        return {
          key: `tab_${g.realIndex}`,
          title: agentTitleByIndex[lookupKey] ?? g.category,
        };
      });

      setRoutes(newRoutes);
      setIsLoading(false);
    }
  }, [groupedNews, agents]);

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      return <TabScene route={route} realGroupedNewsData={realGroupedNewsData} isLandscape={isLandscape} />;
    },
    [realGroupedNewsData, isLandscape]
  );

  // Memoize initial layout để tránh re-calculate
  const initialLayout = useMemo(() => ({
    width: windowWidth
  }), [windowWidth]);

  // Delay render TabView để tránh lag khi orientation change
  const [shouldRenderTabView, setShouldRenderTabView] = useState(false);

  useEffect(() => {
    if (!isLoading && routes.length > 0) {
      // Delay render một chút để smooth transition
      InteractionManager.runAfterInteractions(() => {
        setShouldRenderTabView(true);
      });
    }
  }, [isLoading, routes.length]);

  // Reset khi orientation change
  useEffect(() => {
    setShouldRenderTabView(false);
    const timer = setTimeout(() => {
      setShouldRenderTabView(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [orientation]);

  const renderTabBar = (props: SceneRendererProps & { navigationState: NavigationState<Route> }) => (
    <TabBar
      {...props}
      scrollEnabled
      style={[styles.containerTabbar]}
      contentContainerStyle={{
        justifyContent: routes.length === 1 ? 'center' : 'flex-start',
        paddingRight: 0,
      }}
      tabStyle={{
        width: 'auto',
      }}
      activeColor={'#fff'}
      inactiveColor={'#000'}
      indicatorStyle={styles.indicatorStyle}
      gap={20}
      direction={'ltr'}
      renderIndicator={customTabInficator}
      renderTabBarItem={(props) => (
        <CustomTabBarItem
          {...props}
          labelStyle={[styles.labelStyle, { maxWidth: layout.width - 100 }]}
          labelProps={{ numberOfLines: 1 }}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={{ width: '100%' }}>
      </View>
      {!isLoading && routes.length > 0 && groupedNews.length > 0 && shouldRenderTabView && (
        <View style={styles.containerTabview}>
          <TabView
            style={styles.containerTabview}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={renderTabBar}
            swipeEnabled={true}
            initialLayout={initialLayout}
            lazy
            lazyPreloadDistance={0}
            renderLazyPlaceholder={() => <View style={styles.lazyPlaceholder} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerTabview: {
    flex: 1,
  },
  containerTabbar: {
    backgroundColor: 'red',
    marginHorizontal: 20,
    elevation: 0,
    shadowColor: 'transparent',
  },
  indicatorStyle: {
    height: '50%',
    top: '25%',
    bottom: '25%',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'blue',
  },
  newsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noItemsView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noItemsText: {
    color: "#000",
    fontSize: 15,
  },
  labelStyle: { fontSize: 12, fontWeight: '500' },
  lazyPlaceholder: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NewsList;
