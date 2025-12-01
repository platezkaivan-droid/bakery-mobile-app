import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface Props {
  title: string;
  subtitle: string;
  discount: string;
  imageUrl: string;
}

export function PromoBanner({ title, subtitle, discount, imageUrl }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.discount}>{discount}</Text>
      </View>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 48,
    height: 140,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 16,
  },
  textContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontStyle: 'italic',
  },
  subtitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  discount: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginTop: 8,
  },
  image: {
    width: 140,
    height: '100%',
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.text,
  },
});
