/**
 * Wallet Connect Screen
 * Enter Tron address to load virtual balance
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useWallet } from '@/hooks';

interface WalletScreenProps {
  onConnected: () => void;
}

export function WalletScreen({ onConnected }: WalletScreenProps) {
  const {
    address,
    setAddress,
    isLoading,
    error,
    connect,
    pasteFromClipboard,
    isValid,
  } = useWallet();

  const handleConnect = async () => {
    const success = await connect();
    if (success) {
      onConnected();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Icon */}
        <Text style={styles.icon}>👛</Text>

        {/* Title */}
        <Text style={styles.title}>Connect Tron</Text>
        <Text style={styles.subtitle}>
          Enter your Tron address{'\n'}to load virtual balance
        </Text>

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            isValid && styles.inputValid,
          ]}
          placeholder="TxxxxxxxxxxxxxxxxxxxxxxxxxxxxB"
          placeholderTextColor="#666"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        {/* Error */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Connect Button */}
        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={isLoading || !isValid}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>✨ Start Betting</Text>
          )}
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={pasteFromClipboard}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>📋 Paste</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {}}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>📷 Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 70,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#f87171',
  },
  inputValid: {
    borderColor: '#667eea',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    backgroundColor: '#667eea',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
