import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    id: 'upload',
    title: '사진 업로드',
    desc: '서버에 사진을 전송하고 있습니다',
    icon: '📤',
    duration: 2000,
  },
  {
    id: 'features',
    title: '특징점 추출',
    desc: 'SIFT 알고리즘으로 각 사진의 특징점을 검출합니다',
    icon: '🔍',
    duration: 3000,
  },
  {
    id: 'matching',
    title: '사진 매칭',
    desc: '사진 간 공통 특징점을 찾아 연결합니다',
    icon: '🔗',
    duration: 3500,
  },
  {
    id: 'sfm',
    title: 'SfM 처리',
    desc: 'COLMAP으로 카메라 위치를 계산하고 희소 포인트 클라우드를 생성합니다',
    icon: '📐',
    duration: 4000,
  },
  {
    id: 'dense',
    title: '고밀도 재구성',
    desc: 'OpenMVS로 밀집 포인트 클라우드를 생성합니다',
    icon: '☁️',
    duration: 4500,
  },
  {
    id: 'mesh',
    title: '메쉬 생성',
    desc: '포인트 클라우드에서 3D 메쉬를 생성합니다',
    icon: '🏗️',
    duration: 3000,
  },
  {
    id: 'texture',
    title: '텍스처 매핑',
    desc: '원본 사진으로 3D 모델에 텍스처를 입힙니다',
    icon: '🎨',
    duration: 3500,
  },
  {
    id: 'optimize',
    title: '최적화 & AI 분석',
    desc: 'Detectron2로 공간을 분석하고 웹용으로 최적화합니다',
    icon: '🤖',
    duration: 2500,
  },
];

export default function ProcessingPage({ navigate, photos }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      setCompleted(true);
      return;
    }

    const step = STEPS[currentStep];
    setStepProgress(0);
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.title} 시작...`]);

    const interval = setInterval(() => {
      setStepProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.title} 완료 ✓`]);
          setTimeout(() => setCurrentStep(s => s + 1), 300);
          return 100;
        }
        return prev + (100 / (step.duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep]);

  const overallProgress = completed
    ? 100
    : ((currentStep / STEPS.length) * 100) + (stepProgress / STEPS.length);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>
              {completed ? '3D 모델 생성 완료!' : '3D 모델 생성 중...'}
            </h1>
            <p style={styles.subtitle}>
              {completed
                ? '3D 가상 투어를 확인할 준비가 되었습니다'
                : `${photos?.length || 0}장의 사진을 처리하고 있습니다`
              }
            </p>
          </div>

          {/* Overall Progress */}
          <div style={styles.overallProgress}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>전체 진행률</span>
              <span style={styles.progressPercent}>{Math.round(overallProgress)}%</span>
            </div>
            <div style={styles.progressBarOuter}>
              <div
                style={{
                  ...styles.progressBarInner,
                  width: `${overallProgress}%`,
                  background: completed
                    ? '#10b981'
                    : 'linear-gradient(90deg, #2563eb, #06b6d4)',
                }}
              />
            </div>
          </div>

          {/* Steps */}
          <div style={styles.stepsContainer}>
            {STEPS.map((step, i) => {
              const isActive = i === currentStep && !completed;
              const isDone = i < currentStep || completed;
              return (
                <div
                  key={step.id}
                  style={{
                    ...styles.stepCard,
                    ...(isActive ? styles.stepActive : {}),
                    ...(isDone ? styles.stepDone : {}),
                  }}
                >
                  <div style={styles.stepLeft}>
                    <div style={{
                      ...styles.stepIcon,
                      ...(isActive ? styles.stepIconActive : {}),
                      ...(isDone ? styles.stepIconDone : {}),
                    }}>
                      {isDone ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      ) : (
                        <span style={styles.stepEmoji}>{step.icon}</span>
                      )}
                    </div>
                    <div style={styles.stepInfo}>
                      <h3 style={{
                        ...styles.stepTitle,
                        color: isDone ? '#10b981' : isActive ? '#f1f5f9' : '#64748b',
                      }}>
                        {step.title}
                      </h3>
                      <p style={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                  <div style={styles.stepRight}>
                    {isActive && (
                      <div style={styles.miniProgress}>
                        <div
                          style={{
                            ...styles.miniProgressFill,
                            width: `${stepProgress}%`,
                          }}
                        />
                      </div>
                    )}
                    {isDone && (
                      <span style={styles.doneText}>완료</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {completed && (
            <div style={styles.actions}>
              <button
                style={styles.viewBtn}
                onClick={() => navigate('viewer', {
                  project: { id: 'result', name: '내 공간', photos }
                })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
                3D 뷰어에서 보기
              </button>
            </div>
          )}
        </div>

        {/* Side: Console Log */}
        <div style={styles.sidePanel}>
          <div style={styles.console}>
            <div style={styles.consoleHeader}>
              <span style={styles.consoleDot} />
              <span style={styles.consoleTitle}>처리 로그</span>
            </div>
            <div style={styles.consoleBody}>
              {log.map((line, i) => (
                <div key={i} style={styles.logLine}>
                  <span style={styles.logText}>{line}</span>
                </div>
              ))}
              {!completed && (
                <div style={styles.logLine}>
                  <span style={{ ...styles.logText, animation: 'pulse 1.5s infinite' }}>
                    처리 중...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Photo Thumbnails */}
          {photos && photos.length > 0 && (
            <div style={styles.thumbSection}>
              <h4 style={styles.thumbTitle}>입력 사진 ({photos.length}장)</h4>
              <div style={styles.thumbGrid}>
                {photos.slice(0, 8).map((p, i) => (
                  <img key={i} src={p.url} alt="" style={styles.thumb} />
                ))}
                {photos.length > 8 && (
                  <div style={styles.thumbMore}>+{photos.length - 8}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingTop: 90,
    paddingBottom: 60,
  },
  container: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 32,
    alignItems: 'start',
  },
  mainContent: {},
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  overallProgress: {
    marginBottom: 32,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: '#94a3b8',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 700,
    color: '#f1f5f9',
  },
  progressBarOuter: {
    height: 8,
    borderRadius: 4,
    background: 'rgba(71, 85, 105, 0.3)',
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stepCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderRadius: 12,
    border: '1px solid rgba(71, 85, 105, 0.2)',
    background: 'rgba(30, 41, 59, 0.3)',
    transition: 'all 0.3s',
  },
  stepActive: {
    border: '1px solid rgba(37, 99, 235, 0.4)',
    background: 'rgba(37, 99, 235, 0.08)',
  },
  stepDone: {
    opacity: 0.7,
  },
  stepLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(71, 85, 105, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepIconActive: {
    background: 'rgba(37, 99, 235, 0.2)',
    boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)',
  },
  stepIconDone: {
    background: '#10b981',
  },
  stepEmoji: {
    fontSize: 16,
  },
  stepInfo: {},
  stepTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  stepRight: {
    flexShrink: 0,
    minWidth: 80,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  miniProgress: {
    width: 80,
    height: 4,
    borderRadius: 2,
    background: 'rgba(71, 85, 105, 0.3)',
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
    borderRadius: 2,
    transition: 'width 0.1s',
  },
  doneText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 600,
  },
  actions: {
    marginTop: 32,
    display: 'flex',
    gap: 16,
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    boxShadow: '0 8px 30px rgba(37, 99, 235, 0.35)',
    transition: 'all 0.3s',
  },
  // Side Panel
  sidePanel: {
    position: 'sticky',
    top: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  console: {
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    background: '#0f172a',
  },
  consoleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
  },
  consoleDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
  },
  consoleTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
  },
  consoleBody: {
    padding: 14,
    maxHeight: 300,
    overflowY: 'auto',
    fontFamily: 'monospace',
  },
  logLine: {
    marginBottom: 4,
  },
  logText: {
    fontSize: 11,
    color: '#10b981',
    lineHeight: 1.6,
  },
  thumbSection: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: 14,
    padding: 16,
  },
  thumbTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 12,
  },
  thumbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
  },
  thumb: {
    width: '100%',
    height: 56,
    objectFit: 'cover',
    borderRadius: 6,
  },
  thumbMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 6,
    background: 'rgba(71, 85, 105, 0.3)',
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 600,
  },
};
