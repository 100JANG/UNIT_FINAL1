import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { C, F, R, SHADOW, SP } from '../../theme/tokens';
import { IcPencil } from './icons';

type TabId = 'home' | 'campus' | 'book' | 'bell' | 'me';

type BottomTabProps = {
  active: TabId;
  onTap?: (id: TabId | 'write') => void;
};

type TabDef = {
  id: TabId;
  label: string;
  icon: (color: string, filled: boolean) => React.ReactElement;
};

const TABS: TabDef[] = [
  {
    id: 'home',
    label: '피드',
    icon: (color, f) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill={f ? color : 'none'}>
        <Path
          d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z"
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    id: 'campus',
    label: '캠퍼스',
    icon: (color, f) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill={f ? color : 'none'}>
        <Rect x={4} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
        <Rect x={13} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
        <Rect x={4} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
        <Rect x={13} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
      </Svg>
    ),
  },
  {
    id: 'book',
    label: '강의평',
    icon: (color, f) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill={f ? color : 'none'}>
        <Path
          d="m12 3 2.7 5.5 6 .9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z"
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    id: 'bell',
    label: '알림',
    icon: (color, f) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill={f ? color : 'none'}>
        <Path
          d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16.5h15L18 12.5V9a6 6 0 0 0-6-6Z"
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    id: 'me',
    label: '나',
    icon: (color, f) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill={f ? color : 'none'}>
        <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.6} />
        <Path
          d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
];

export function BottomTab({ active, onTap }: BottomTabProps) {
  return (
    <View style={styles.container}>
      {TABS.slice(0, 2).map((t) => (
        <TabBtn key={t.id} t={t} active={active} onTap={onTap} />
      ))}
      <Pressable
        onPress={() => onTap?.('write')}
        style={[styles.fab, SHADOW.fab]}
      >
        <IcPencil size={22} color={C.white} />
      </Pressable>
      {TABS.slice(2).map((t) => (
        <TabBtn key={t.id} t={t} active={active} onTap={onTap} />
      ))}
    </View>
  );
}

function TabBtn({
  t,
  active,
  onTap,
}: {
  t: TabDef;
  active: TabId;
  onTap?: (id: TabId | 'write') => void;
}) {
  const on = active === t.id;
  const color = on ? C.inkNavy : C.textMeta;
  return (
    <Pressable onPress={() => onTap?.(t.id)} style={styles.btn}>
      {t.icon(color, on)}
      <Text
        style={[
          styles.label,
          { color, fontFamily: on ? F.familySemiBold : F.familyMedium },
        ]}
      >
        {t.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: C.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.divider2,
    paddingTop: SP[1],
    paddingBottom: SP[2],
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SP[1],
    gap: 2,
  },
  fab: {
    width: 56,
    height: 56,
    marginTop: -8,
    borderRadius: R.full,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
  },
});
