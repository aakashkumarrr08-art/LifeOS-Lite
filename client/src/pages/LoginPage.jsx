import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthPageShell from '../components/AuthPageShell.jsx';
import useAuth from '../hooks/useAuth.js';

const getApiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  'Unable to sign you in right now. Please try again.';

function LoginPage() {
  const { authReady, isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authReady) {
    return (
      <div className="auth-card mx-auto flex min-h-[320px] max-w-xl items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/25 border-t-cyan-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (authReady && isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim().toLowerCase())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const redirectTarget = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      badge="Secure Login"
      description="Sign in to access your protected student dashboard and track your study metrics in one place."
      footerLabel="Need an account?"
      footerLinkText="Create one here"
      footerTo="/register"
      title="Welcome back to LifeOS Lite"
    >
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Sign In
          </h1>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Use your email and password to continue to the protected dashboard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
              Email Address
            </label>
            <input
              className="form-input"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="student@example.com"
              type="email"
              value={formData.email}
            />
            {errors.email ? <p className="form-error" id="email-error">{errors.email}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              className="form-input"
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              type="password"
              value={formData.password}
            />
            {errors.password ? <p className="form-error" id="password-error">{errors.password}</p> : null}
          </div>

          {submitError ? (
            <div aria-live="assertive" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300" role="alert">
              {submitError}
            </div>
          ) : null}

          <button className="primary-button w-full justify-center" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <Link className="font-medium text-cyan-600 hover:text-cyan-500" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}

export default LoginPage;
