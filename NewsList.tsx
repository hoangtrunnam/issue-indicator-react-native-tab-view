import analytics from '@react-native-firebase/analytics';
import I18n from 'i18n-js';
import {
  TabView,
  TabBar,
  SceneRendererProps,
  NavigationState,
  TabBarItem,
  TabBarItemProps,
} from 'react-native-tab-view';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { 
  Dimensions, 
  FlatList, 
  StyleSheet, 
  Text, 
  TextProps, 
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useLocale } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { AppActions, NewsActions } from '../../actions';
import {
  MAIN_CONTENT_COLOR,
  ORIENTATION_LANDSCAPE,
  ORIENTATION_LANDSCAPE_LEFT,
  ORIENTATION_LANDSCAPE_RIGHT,
} from '../../configs/setting';
import { useWidth } from '../../hooks/useWidth';
import { OTabName } from '../../navigation/app-navigation-container.constant';
import { colors } from '../../resources';
import { newsSelector } from '../../stores/selectors/news-selector';
import { NewsGroup, NewsItemType } from '../../types/news';
import { testProperties } from '../../utilities/test-utils';
import Spacing from '../components/spacing';
import { ThemeContext } from '../providers/theme-provider';
import ItemNews from './components/item-news';
import ItemTopNews from './components/item-top-news';
import { homeNewsContentList } from './news.test-ids';
import { OPEN_NEWS_DETAIL_FROM_NEWS_LIST_PARENT_ID } from '../../constant/browser';
import { navigate } from '../../navigation/helpers/root-navigation';
import { TabBarIndicator } from './components/custom-indicator';
import { IStore } from '../../stores/store';

interface WrapNewsGroup extends NewsGroup {
  realIndex?: number;
}

interface CustomTabBarItemProps extends TabBarItemProps<Route> {
  labelProps?: TextProps;
}

type Route = { key: string; title: string };

const customTabInficator = (props: SceneRendererProps & { navigationState: NavigationState<Route> }) => {
  return <TabBarIndicator {...props} />;
};

const CustomTabBarItem = (props: CustomTabBarItemProps) => {
  return <TabBarItem {...props} />;
};

// Optimize styles - extract inline styles to prevent re-creation
const landscapeContainerStyle = { flex: 1, flexDirection: 'row' as const };
const landscapeImageContainerStyle = { flex: 1 };
const landscapeListContainerStyle = { flex: 1 };
const portraitContainerStyle = { flex: 1 };
const landscapeImageStyle = { width: '100%' as any, height: 180 };
const portraitImageStyle = { width: 360, height: 200 };
const flatListContentStyle = { paddingBottom: 24 };

// Memoized empty component
const EmptyComponent = memo(({ themeContext }: { themeContext: any }) => (
  <View style={styles.noItemsView}>
    <Text style={[styles.noItemsText, themeContext.theme?.views?.text]}>
      {I18n.t('no_items_to_show')}
    </Text>
  </View>
));

// Memoized news item component
const NewsListItem = memo(({ 
  item, 
  index, 
  onOpenNews, 
  themeContext 
}: { 
  item: NewsItemType; 
  index: number; 
  onOpenNews: (news: NewsItemType) => void;
  themeContext: any;
}) => {
  return <ItemNews index={index} news={item} themeContext={themeContext} onOpenNews={onOpenNews} />;
});

// Memoized header component
const NewsListHeader = memo(({ 
  contentData, 
  onOpenNews, 
  themeContext,
  isLandscape
}: { 
  contentData: NewsItemType[];
  onOpenNews: (news: NewsItemType) => void;
  themeContext: any;
  isLandscape?: boolean;
}) => {
  if (contentData.length === 0) return null;
  return (
    <ItemTopNews 
      index={0} 
      news={contentData[0]} 
      imageStyle={isLandscape ? landscapeImageStyle : portraitImageStyle} 
      onOpenNews={onOpenNews}
      themeContext={themeContext}
    />
  );
});

// Optimized tab scene component with better memoization
const TabScene = memo(({
  route,
  realGroupedNewsData,
  isLandscape,
  onOpenNews,
  themeContext,
}: {
  route: Route;
  realGroupedNewsData: WrapNewsGroup[];
  isLandscape: boolean;
  onOpenNews: (news: NewsItemType) => void;
  themeContext: any;
}) => {
  const group = useMemo(
    () => realGroupedNewsData.find((g) => `tab_${g.realIndex}` === route.key),
    [realGroupedNewsData, route.key]
  );

  if (!group || !group.data || group.data.length === 0) {
    return <EmptyComponent themeContext={themeContext} />;
  }

  const contentData = group.data;

  const renderItem = useCallback(({ item, index }: { item: NewsItemType; index: number }) => (
    <NewsListItem item={item} index={index} onOpenNews={onOpenNews} themeContext={themeContext} />
  ), [onOpenNews, themeContext]);

  const keyExtractor = useCallback((item: NewsItemType) => `#${item.id}`, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 100,
    offset: 100 * index + (isLandscape ? 0 : 200),
    index,
  }), [isLandscape]);

  if (isLandscape) {
    return (
      <View style={landscapeContainerStyle}>
        <View style={landscapeImageContainerStyle}>
          {contentData[0] && (
            <ItemTopNews
              index={0}
              news={contentData[0]}
              imageStyle={landscapeImageStyle}
              onOpenNews={onOpenNews}
              themeContext={themeContext}
            />
          )}
        </View>
        <View style={landscapeListContainerStyle}>
          <FlatList
            style={styles.newsList}
            contentContainerStyle={flatListContentStyle}
            showsVerticalScrollIndicator={false}
            keyExtractor={keyExtractor}
            data={contentData.slice(1)}
            renderItem={renderItem}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            initialNumToRender={5}
            ListEmptyComponent={<EmptyComponent themeContext={themeContext} />}
            getItemLayout={getItemLayout}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            {...testProperties(homeNewsContentList)}
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
        keyExtractor={keyExtractor}
        data={contentData.slice(1)}
        renderItem={renderItem}
        ListHeaderComponent={
          <NewsListHeader 
            contentData={contentData} 
            onOpenNews={onOpenNews} 
            themeContext={themeContext}
            isLandscape={false}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        ListEmptyComponent={<EmptyComponent themeContext={themeContext} />}
        getItemLayout={getItemLayout}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        {...testProperties(homeNewsContentList)}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.route.key === nextProps.route.key &&
    prevProps.isLandscape === nextProps.isLandscape &&
    prevProps.realGroupedNewsData === nextProps.realGroupedNewsData &&
    prevProps.onOpenNews === nextProps.onOpenNews &&
    prevProps.themeContext === nextProps.themeContext
  );
});

const NewsList = () => {
  const { direction } = useLocale();
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const dispatch = useDispatch();
  const themeContext = useContext(ThemeContext);
  
  // Use layout dimensions for better performance
  const layout = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  }, []);

  const groupedNews = useSelector(newsSelector.getAllGroups);
  const agents = useSelector((state: IStore) => state.newsState.agents);
  const deviceOrientation = useSelector((state: IStore) => state?.contentsWindowState.deviceOrientation);

  const isLandscape = useMemo(
    () => [ORIENTATION_LANDSCAPE, ORIENTATION_LANDSCAPE_LEFT, ORIENTATION_LANDSCAPE_RIGHT].includes(deviceOrientation),
    [deviceOrientation]
  );

  // Memoize grouped news data with proper typing
  const realGroupedNewsData = useMemo<WrapNewsGroup[]>(() => 
    groupedNews.map((group, index) => ({
      ...group,
      realIndex: index,
    })), 
    [groupedNews]
  );

  useEffect(() => {
    if (realGroupedNewsData.length > 0 && agents.length > 0) {
      const agentTitleByIndex: Record<number, string> = {};
      agents.forEach((agent) => {
        agentTitleByIndex[agent.data.index] = agent.title;
      });

      const newRoutes: Route[] = realGroupedNewsData.map((g) => {
        const lookupKey = g.realIndex! + 1;
        return {
          key: `tab_${g.realIndex}`,
          title: agentTitleByIndex[lookupKey] ?? g.category,
        };
      });

      setRoutes(newRoutes);
      setIsLoading(false);
    }
  }, [realGroupedNewsData, agents]);

  const onOpenNews = useCallback(
    (news: NewsItemType) => {
      const infoseekNews = !!news.category;
      const eventName = infoseekNews ? 'click_feed_infoseek' : 'click_feed_rss';
      const eventData = infoseekNews
        ? {
            SOURCE: `infoseek_news:${news.category}`,
          }
        : {
            SOURCE: `rss:${news.rssUri}`,
          };

      (async () => {
        await analytics().logEvent(eventName, eventData);
      })().catch(() => {});

      navigate(OTabName.Browser);
      dispatch(AppActions.addNewTab({ url: news.uri, parentId: OPEN_NEWS_DETAIL_FROM_NEWS_LIST_PARENT_ID }));
      dispatch(NewsActions.readNews(news.uri));
    },
    [dispatch]
  );

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      return (
        <TabScene 
          route={route} 
          realGroupedNewsData={realGroupedNewsData} 
          isLandscape={isLandscape}
          onOpenNews={onOpenNews}
          themeContext={themeContext}
        />
      );
    },
    [realGroupedNewsData, isLandscape, onOpenNews, themeContext]
  );

  const renderTabBar = useCallback(
    (props: SceneRendererProps & { navigationState: NavigationState<Route> }) => (
      <TabBar
        {...props}
        scrollEnabled
        style={[styles.containerTabbar, themeContext.theme?.views?.container]}
        contentContainerStyle={{
          justifyContent: routes.length === 1 ? 'center' : 'flex-start',
          paddingRight: 0,
        }}
        tabStyle={{
          width: 'auto',
        }}
        activeColor={colors.WHITE}
        inactiveColor={themeContext.theme?.views?.text.color || colors.DARK_GREEN}
        indicatorStyle={styles.indicatorStyle}
        gap={20}
        direction={direction}
        renderIndicator={customTabInficator}
        renderTabBarItem={(props) => (
          <CustomTabBarItem
            {...props}
            labelStyle={[styles.labelStyle, { maxWidth: layout.width - 100 }]}
            labelProps={{ numberOfLines: 1 }}
          />
        )}
      />
    ),
    [direction, routes.length, themeContext.theme?.views?.container, themeContext.theme?.views?.text.color, layout.width]
  );

  // Memoize initial layout
  const initialLayout = useMemo(() => ({ 
    width: layout.width,
    height: layout.height 
  }), [layout]);

  // Key for TabView to handle orientation changes smoothly
  const tabViewKey = useMemo(() => `tabview-${isLandscape ? 'landscape' : 'portrait'}`, [isLandscape]);

  return (
    <SafeAreaView style={[styles.container, themeContext.theme?.views?.container]} edges={['top', 'left', 'right']}>
      <Text style={[styles.screenTitle, themeContext.theme?.views?.text]}>{I18n.t('news_setting')}</Text>
      <View style={{ width: '100%' }}>
        <Spacing vertical={8} />
      </View>
      {!isLoading && groupedNews.length > 0 && routes.length > 0 && (
        <View style={styles.containerTabview}>
          <TabView
            key={tabViewKey}
            style={styles.containerTabview}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
            swipeEnabled={true}
            initialLayout={initialLayout}
            lazy={{
              lazy: true,
              lazyPreloadDistance: 0,
            }}
            renderLazyPlaceholder={() => <View style={styles.lazyPlaceholder} />}
            overScrollMode="never"
          />
        </View>
      )}
      {isLoading && groupedNews.length === 0 && (
        <View style={styles.noItemsView}>
          <Text style={[styles.noItemsText, themeContext.theme?.views?.text]}>{I18n.t('no_items')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default memo(NewsList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MAIN_CONTENT_COLOR,
  },
  containerTabview: {
    flex: 1,
  },
  containerTabbar: {
    backgroundColor: MAIN_CONTENT_COLOR,
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
    color: colors.NIGHT_RIDER,
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
    color: colors.BLACK,
    fontSize: 15,
  },
  labelStyle: { 
    fontSize: 12, 
    fontWeight: '500' 
  },
  lazyPlaceholder: {
    flex: 1,
    backgroundColor: MAIN_CONTENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 