'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SetupAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!searchParams.get('token')) return setError('This setup link is missing or invalid.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setSaving(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/invitations/accept/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: searchParams.get('token'), username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to complete account setup.');
      router.replace('/auth/login');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to complete account setup.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Set up your account</h1>
          <p className="mt-1 text-sm text-slate-500">Choose credentials that only you know.</p>
        </div>
        <label className="block text-sm font-medium text-slate-700">Username
          <input required value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Password
          <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Confirm password
          <input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button disabled={saving} className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Setting up…' : 'Finish setup'}</button>
      </form>
    </main>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F5F8FC]" />}>
      <SetupAccountForm />
    </Suspense>
  );
}
