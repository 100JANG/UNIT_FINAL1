import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

type ScreenProps = {
  appBar?: ReactNode;
  children: ReactNode;
  scrollClass?: string;
  scrollable?: boolean;
  edges?: readonly Edge[];
  bgClass?: string;
};

export function Screen({
  appBar,
  children,
  scrollClass = '',
  scrollable = true,
  edges = ['top'],
  bgClass = 'bg-white',
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 ${bgClass}`}>
      {appBar}
      {scrollable ? (
        <ScrollView className={`flex-1 ${scrollClass}`}>{children}</ScrollView>
      ) : (
        <View className={`flex-1 ${scrollClass}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function FullScreen({
  appBar,
  children,
  scrollClass = '',
  scrollable = true,
  bgClass = 'bg-white',
}: Omit<ScreenProps, 'edges'>) {
  return (
    <Screen
      appBar={appBar}
      scrollClass={scrollClass}
      scrollable={scrollable}
      bgClass={bgClass}
      edges={['top', 'bottom']}
    >
      {children}
    </Screen>
  );
}
