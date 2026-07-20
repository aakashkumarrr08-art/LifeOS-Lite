import { useCallback, useEffect, useState } from 'react';
import AskAnythingChat from '../components/AskAnythingChat.jsx';
import AiSummary from '../components/AiSummary.jsx';
import AttendanceAlerts from '../components/AttendanceAlerts.jsx';
import ProductivityTips from '../components/ProductivityTips.jsx';
import SmartRevisionPlan from '../components/SmartRevisionPlan.jsx';
import TodayStudyPlan from '../components/TodayStudyPlan.jsx';
import WeeklyRecommendations from '../components/WeeklyRecommendations.jsx';
import useRequestLifecycle from '../hooks/useRequestLifecycle.js';
import {
  createAiProductivityTips,
  createAiRevisionPlan,
  createAiStudyPlan,
  getAiDashboardSummary,
} from '../services/aiService.js';
import { isRequestCanceled } from '../utils/apiError.js';

const getApiErrorMessage = (error) =>
  error.response?.data?.message || 'Unable to generate AI recommendations right now.';

function AiAssistantPage() {
  const [assistantData, setAssistantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { createRequestSignal, isMounted } = useRequestLifecycle();

  const loadAssistant = useCallback(async () => {
    const signal = createRequestSignal();

    try {
      setErrorMessage('');
      setIsLoading(true);
      const [summaryResponse, studyPlanResponse, revisionPlanResponse, productivityTipsResponse] = await Promise.all([
        getAiDashboardSummary({ signal }),
        createAiStudyPlan({}, { signal }),
        createAiRevisionPlan({}, { signal }),
        createAiProductivityTips({ signal }),
      ]);

      if (isMounted()) {
        setAssistantData({
          summary: summaryResponse.data,
          studyPlan: studyPlanResponse.data,
          revisionPlan: revisionPlanResponse.data,
          productivityTips: productivityTipsResponse.data,
        });
      }
    } catch (error) {
      if (isMounted() && !isRequestCanceled(error)) {
        setErrorMessage(getApiErrorMessage(error));
      }
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, [createRequestSignal, isMounted]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAssistant();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadAssistant]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-panel h-48 animate-pulse" />
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="dashboard-panel h-[460px] animate-pulse" />
          <div className="dashboard-panel h-[460px] animate-pulse" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="dashboard-panel h-[360px] animate-pulse" />
          <div className="dashboard-panel h-[360px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="dashboard-panel mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-500">AI Assistant Error</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Recommendations could not be generated.
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{errorMessage}</p>
        <button className="primary-button mt-8" onClick={loadAssistant} type="button">
          Try Again
        </button>
      </div>
    );
  }

  const hasRecommendations =
    assistantData.studyPlan.sessions.length > 0 ||
    assistantData.revisionPlan.prioritySubjects.length > 0 ||
    assistantData.productivityTips.tips.length > 0;

  if (!hasRecommendations) {
    return (
      <div className="dashboard-panel mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">AI Assistant</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Your recommendations will appear here.</h2>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">Add tasks, attendance, or study sessions to generate a tailored rule-based study plan.</p>
        <button className="primary-button mt-8" onClick={loadAssistant} type="button">Refresh AI</button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="page-hero">
        <div className="page-hero-content">
          <div className="max-w-2xl space-y-4">
            <span className="page-eyebrow">AI assistant</span>
            <h2 className="page-title">A practical study coach built from your own academic data.</h2>
            <p className="page-description">Review tailored recommendations from your study activity, then use Ask Anything AI when you need a quick explanation or fresh perspective.</p>
          </div>
          <button className="primary-button w-full border border-white/10 bg-white text-slate-950 hover:bg-slate-100 sm:w-auto dark:bg-white dark:text-slate-950" onClick={loadAssistant} type="button">Refresh AI</button>
        </div>
      </div>

      <AiSummary summary={assistantData.summary} />

      <div className="grid gap-6 2xl:grid-cols-2">
        <TodayStudyPlan studyPlan={assistantData.studyPlan} />
        <SmartRevisionPlan revisionPlan={assistantData.revisionPlan} />
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <ProductivityTips productivityTips={assistantData.productivityTips} />
        <AttendanceAlerts alerts={assistantData.revisionPlan.attendanceAlerts} />
      </div>

      <WeeklyRecommendations weeklyRecommendations={assistantData.productivityTips.weeklyRecommendations} />

      <AskAnythingChat />
    </section>
  );
}

export default AiAssistantPage;
