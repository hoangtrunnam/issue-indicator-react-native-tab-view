/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
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
} from 'react-native';
import { TabView } from 'react-native-tab-view';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { useOrientation } from './src/useOrientation';

type SectionProps = PropsWithChildren<{
  title: string;
}>;



const routes = [
  { key: "first", title: "First" },
  { key: "second", title: "Second" },
];

const data = [
  { id: "1", title: "Item 1", imageUrl: "https://reactnative.dev/img/tiny_logo.png" },
  { id: "2", title: "Item 2", imageUrl: "https://reactnative.dev/img/tiny_logo.png" },
  { id: "3", title: "Item 3", imageUrl: "https://reactnative.dev/img/tiny_logo.png" },
  { id: "4", title: "Item 4", imageUrl: "https://reactnative.dev/img/tiny_logo.png" },
  { id: "5", title: "Item 5", imageUrl: "https://reactnative.dev/img/tiny_logo.png" },
  { id: "6", title: "Item 6", imageUrl: "https://reactnative.dev/img/tiny_logo.png" },
];

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: !isDarkMode ? Colors.darker : Colors.lighter,
  };

  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const { orientation, isLandscape, isPortrait } = useOrientation();
  const renderScene = () => {
    if (isLandscape) {
      return (
        <View style={{ flex: 1, backgroundColor: "#f0f0f0", flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, margin: 10 }}>Orientation: {orientation}</Text>
            <Image
              source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
              style={{ width: 300, height: 180 }}
            />
          </View>
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <View
                style={{ width: "100%", flexDirection: "row", alignItems: "center", padding: 10 }}
              >
                <Image source={{ uri: item.imageUrl }} style={{ width: 100, height: 100 }} />
                <Text>{item.title}</Text>
              </View>
            )}
          />
        </View>
      );
    }
    return (
      <View>
        <Text style={{ fontSize: 20, margin: 10 }}>Orientation: {orientation}</Text>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={{ width: "100%", flexDirection: "row" }}>
              <Text>{item.title}</Text>
              <Image source={{ uri: item.imageUrl }} style={{ width: 100, height: 100 }} />
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
