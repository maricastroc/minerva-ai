import { NextSeo } from 'next-seo';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { Button } from '@/components/Button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { AuthLayout } from '@/layouts/AuthLayout';
import { handleApiError } from '@/utils/handleApiError';

const loginSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup.string().required('Password is required'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setIsLoading(true);
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Welcome to Minerva AI!');
        router.push('/');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <NextSeo
        title="Login | Minerva AI"
        description="Login to your Minerva AI account to access your personalized AI assistant"
        additionalMetaTags={[
          {
            name: 'viewport',
            content:
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
          },
          {
            name: 'theme-color',
            content: '#6185f6',
          },
        ]}
        openGraph={{
          title: 'Login | Minerva AI',
          description: 'Login to your Minerva AI account',
        }}
      />
      {isClient && (
        <AuthLayout
          title="Login to your account"
          setIsLoading={setIsLoading}
          footer={
            <p className="text-primary-text text-sm">
              Don&apos;t have an account?{' '}
              <a
                href="/register"
                className="text-blue-500 hover:text-blue-300 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm px-1"
                aria-label="Sign up for a new account"
              >
                Sign up
              </a>
            </p>
          }
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
            className="space-y-4"
            noValidate
            aria-label="Login form"
          >
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="your.email@exemplo.com"
              error={errors.email}
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />

            <PasswordInput
              id="password"
              label="Password"
              placeholder="Your password"
              autoComplete="current-password"
              error={errors.password}
              aria-required="true"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="mt-6 w-full"
              aria-disabled={isLoading}
              aria-label={
                isLoading ? 'Signing in...' : 'Sign in to your account'
              }
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </AuthLayout>
      )}
    </>
  );
}
