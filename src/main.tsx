import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";

import { router } from "@/app/router";
import App from "@/app/App";

import "@/shared/styles/global.scss";

Sentry.init({
  dsn: "https://71a33bef04651c199c4d5f9550918b42@o4504275194871808.ingest.us.sentry.io/4510321588830208",

  // 환경 설정
  environment: import.meta.env.MODE || "development",
  release: import.meta.env.VITE_APP_VERSION || "unknown",

  // 모든 PII 데이터 수집
  sendDefaultPii: true,

  // 디버그 모드 비활성화 (콘솔 로그 출력 안 함)
  debug: false,

  // 성능 모니터링: 모든 트랜잭션 기록 (100%)
  tracesSampleRate: 1.0,

  // 프로파일 샘플링: 모든 프로파일 기록
  profilesSampleRate: 1.0,

  // 세션 리플레이 활성화 (모든 세션 기록)
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  // 통합 설정
  integrations: [
    // React Router 통합 (먼저 추가)
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    // 브라우저 트레이싱 (성능 모니터링)
    Sentry.browserTracingIntegration(),
    // 세션 리플레이
    Sentry.replayIntegration({
      // 모든 DOM 이벤트 기록
      maskAllText: false,
      blockAllMedia: false,
      // 모든 사용자 상호작용 기록
      networkDetailAllowUrls: [/.*/],
      networkCaptureBodies: true,
      networkRequestHeaders: ["*"],
      networkResponseHeaders: ["*"],
    }),
    // HTTP 클라이언트 통합
    Sentry.httpClientIntegration(),
    // 브라우저 컨텍스트 통합
    Sentry.browserProfilingIntegration(),
  ],

  // 초기 스코프 설정
  initialScope: {
    tags: {
      component: "main",
      platform: "web",
    },
    contexts: {
      app: {
        app_name: "oliver",
        app_version: import.meta.env.VITE_APP_VERSION || "unknown",
      },
    },
  },

  // 추가 컨텍스트 정보
  attachStacktrace: true,
  maxBreadcrumbs: 100, // 최대 브레드크럼 수
  maxValueLength: 10000, // 최대 값 길이

  // 스택 트레이스 단순화: beforeSend에서 정리
  beforeSend(event, _hint) {
    // 스택 트레이스가 있는 경우 정리
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((exception) => {
        // 스택 트레이스에서 불필요한 프레임 제거
        if (exception.stacktrace?.frames) {
          exception.stacktrace.frames = exception.stacktrace.frames.filter(
            (_frame) => {
              // 현재는 모든 프레임 유지 (커스텀 에러로 이미 단순화됨)
              // 필요시 번들된 파일이나 node_modules 필터링 가능
              return true;
            }
          );
        }
        return exception;
      });
    }
    return event;
  },

  // 모든 예외 기록
  ignoreErrors: [], // 필터링 없음

  // 모든 URL 기록
  denyUrls: [], // 필터링 없음

  // 샘플링 없이 모든 이벤트 전송
  sampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App>
    <RouterProvider router={router} />
  </App>
);
