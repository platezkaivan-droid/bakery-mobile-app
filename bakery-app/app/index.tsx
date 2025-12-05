import { View, StyleSheet } from 'react-native';

// Пустой index - вся навигация управляется из _layout.tsx
// Этот экран показывается только на долю секунды пока InitialLayout решает куда редиректить
export default function Index() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
