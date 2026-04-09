import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.text}>Session — Phase 1</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080C10' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#6B8096', fontFamily: 'AvenirNext-Regular', fontSize: 16 },
});
