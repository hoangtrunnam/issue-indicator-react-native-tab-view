import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ItemTopNewsProps {
  index?: number;
  news?: any;
  imageStyle?: any['style'] | undefined;
  onOpenNews?: (news: any) => void;
  themeContext?: any;
}

const ItemTopNews = ({ index, news, imageStyle = { width: 300, height: 200 }, onOpenNews, themeContext }: ItemTopNewsProps) => {
  return (
    <TouchableOpacity
      style={styles.firstItemNewsContainer}
      onPress={() => {}}
    >
      <Image style={imageStyle} source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />
      <View
        style={styles.firstItemNewsTextContent}
      >
        <Text
          style={[styles.firstItemNewsTextTitle]}
          numberOfLines={3}
        >
          {news?.title}
        </Text>
        <Text
          style={[styles.firstItemNewsTextDate]}
        >
          {news?.datetime}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  firstItemNewsContainer: {
    flexDirection: 'column',
    borderBottomWidth: 0.33,
    borderColor: 'orange',
    width: '100%',
  },
  firstItemNewsTextContent: {
    paddingVertical: 16,
  },
  firstItemNewsTextTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'blue',
  },
  firstItemNewsTextDate: {
    fontSize: 12,
    fontWeight: '400',
    color: 'gray',
    lineHeight: 21,
  },
});

export default ItemTopNews;
