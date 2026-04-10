import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../lib/hooks/use-auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.content}>
        <Text style={s.title}>Launch Monitor</Text>
        <Text style={s.subtitle}>Sign in</Text>

        <View style={s.form}>
          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#53677A"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor="#53677A"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Pressable style={[s.button, loading && s.buttonDisabled]} onPress={handleSignIn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#080C10" />
            ) : (
              <Text style={s.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <Link href="/(auth)/register" asChild>
          <Pressable style={s.linkRow}>
            <Text style={s.linkText}>No account? </Text>
            <Text style={[s.linkText, s.linkAccent]}>Register</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080C10',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
    fontSize: 13,
    letterSpacing: 2,
    color: '#D2B15C',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
    fontSize: 28,
    color: '#EEF3F7',
    marginBottom: 24,
  },
  form: {
    gap: 12,
  },
  input: {
    height: 52,
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#EEF3F7',
    fontSize: 15,
  },
  error: {
    color: '#E05C5C',
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    height: 52,
    backgroundColor: '#D2B15C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
    fontSize: 15,
    color: '#080C10',
    letterSpacing: 0.5,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    color: '#53677A',
    fontSize: 14,
  },
  linkAccent: {
    color: '#D2B15C',
  },
});
