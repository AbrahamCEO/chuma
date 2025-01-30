import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type StatusBarComponentProps = {
  backgroundColor?: string;
  barStyle?: 'light' | 'dark';
};

const StatusBarComponent: React.FC<StatusBarComponentProps> = ({ backgroundColor = '#FF4785', barStyle = 'light' }) => {
  return (
    <>
      <StatusBar style={barStyle} backgroundColor={backgroundColor} />
      <View style={[styles.statusBarBackground, { backgroundColor }]} />
    </>
  );
};

const styles = StyleSheet.create({
  statusBarBackground: {
    height: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

export default StatusBarComponent;