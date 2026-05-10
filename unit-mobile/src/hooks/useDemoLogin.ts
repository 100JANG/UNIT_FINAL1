// DEMO_MODE_START
// 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
//
// 흐름: demoLogin() -> setSessionToken(...) -> caller 의 onSuccess (예: 네비게이션) 호출
// 실패 시 사용자에게 "백엔드 demo mode 가 꺼져 있습니다" 안내 가능.

import { useCallback, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { demoLogin } from '../services/api/demoApi';
import type { DemoUser } from '../services/api/demoApi';
import { setSessionToken } from '../services/auth/sessionToken';

export type DemoLoginErrorKind =
  | 'not-available' // 404 — backend demo mode off
  | 'network'
  | 'unknown';

export type DemoLoginError = {
  kind: DemoLoginErrorKind;
  message: string;
};

export type UseDemoLoginArgs = {
  onSuccess?: (user: DemoUser) => void;
};

export type UseDemoLoginResult = {
  isSubmitting: boolean;
  error: DemoLoginError | null;
  start: () => void;
  reset: () => void;
};

export function useDemoLogin(args: UseDemoLoginArgs = {}): UseDemoLoginResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<DemoLoginError | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const start = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    demoLogin()
      .then(async result => {
        await setSessionToken(result.sessionToken);
        args.onSuccess?.(result.user);
      })
      .catch((e: unknown) => {
        setError(toDemoError(e));
      })
      .finally(() => setIsSubmitting(false));
  }, [args, isSubmitting]);

  return { isSubmitting, error, start, reset };
}

function toDemoError(e: unknown): DemoLoginError {
  if (e instanceof ApiError) {
    if (e.status === 404 || e.code === 'NOT_FOUND') {
      return {
        kind: 'not-available',
        message:
          '백엔드 Demo Mode 가 꺼져 있습니다. 백엔드를 SPRING_PROFILES_ACTIVE=demo 로 실행하거나 app.demo.enabled=true 로 설정한 뒤 다시 시도해주세요.',
      };
    }
    if (e.code === 'NETWORK_ERROR') {
      return { kind: 'network', message: '네트워크 연결을 확인해주세요' };
    }
    return { kind: 'unknown', message: e.message || '시연 진입에 실패했습니다' };
  }
  return {
    kind: 'unknown',
    message: e instanceof Error ? e.message : '시연 진입에 실패했습니다',
  };
}
// DEMO_MODE_END
