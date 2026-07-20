import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthPageShell from '../components/AuthPageShell.jsx';
import useAuth from '../hooks/useAuth.js';

const getApiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  'Unable to create your account right now. Please try again.';

function RegisterPage() {
  const { authReady, isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.';
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters long.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim().toLowerCase())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      badge="New Account"
      description="Create a secure account to test the complete authentication flow for the semester project."
      footerLabel="Already registered?"
      footerLinkText="Sign in instead"
      footerTo="/login"
      title="Create your LifeOS Lite account"
    >
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Register
          </h1>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Set up your student account with validation on both frontend and backend.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="name">
              Full Name
            </label>
            <input
              className="form-input"
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
              id="name"
              name="name"
              onChange={handleChange}
              placeholder="Aakash Kumar"
              type="text"
              value={formData.name}
            />
            {errors.name ? <p className="form-error" id="name-error">{errors.name}</p> : null}
          </div>

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

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
                Password
              </label>
              <input
              className="form-input"
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={Boolean(errors.password)}
                autoComplete="new-password"
                id="password"
                name="password"
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                type="password"
                value={formData.password}
              />
              {errors.password ? <p className="form-error" id="password-error">{errors.password}</p> : null}
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
              className="form-input"
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                aria-invalid={Boolean(errors.confirmPassword)}
                autoComplete="new-password"
                id="confirmPassword"
                name="confirmPassword"
                onChange={handleChange}
                placeholder="Repeat your password"
                type="password"
                value={formData.confirmPassword}
              />
              {errors.confirmPassword ? <p className="form-error" id="confirm-password-error">{errors.confirmPassword}</p> : null}
            </div>
          </div>

          {submitError ? (
            <div aria-live="assertive" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300" role="alert">
              {submitError}
            </div>
          ) : null}

          <button className="primary-button w-full justify-center" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
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

export default RegisterPage;
