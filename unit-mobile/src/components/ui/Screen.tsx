import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { C } from '../../theme/tokens';

type ScreenProps = {
  appBar?: ReactNode;
  bottomTab?: ReactNode;
  scrollable?: boolean;
  children: ReactNode;
  bg?: string;
  edges?: readonly Edge[];
  keyboardOffset?: number;
};

export function Screen({
  appBar,
  bottomTab,
  scrollable = true,
  children,
  bg = C.white,
  edges,
  keyboardOffset = 0,
}: ScreenProps) {
  // Default edges depend on whether bottomTab is present
  const computedEdges: readonly Edge[] =
    edges ?? (bottomTab ? (['top'] as const) : (['top', 'bottom'] as const));

  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{children}</View>
  );

  return (
    <SafeAreaView edges={computedEdges} style={[styles.flex, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        {appBar}
        {body}
        {bottomTab}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contentContainer: { flexGrow: 1 },
});
