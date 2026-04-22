import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0f1117',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#58a6ff', fontSize: 32, fontWeight: '700' }}>
        € --,--
      </Text>
      <Text style={{ color: '#8b949e', fontSize: 14, marginTop: 8 }}>
        Safe to spend today — coming soon
      </Text>
    </View>
  );
}
