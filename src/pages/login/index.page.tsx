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
        additionalMetaTags={[
          {
            name: 'viewport',
            content:
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
          },
        ]}
      />
      {isClient && (
        <AuthLayout
          title="Login to your account"
          setIsLoading={setIsLoading}
          footer={
            <p className="text-white/80 text-sm">
              Don&apos;t have an account?{' '}
              <a
                href="/register"
                className="text-primary-blue500 hover:text-primary-blue300 font-semibold transition-colors"
              >
                Sign up
              </a>
            </p>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="your.email@exemplo.com"
              error={errors.email}
              {...register('email')}
            />
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Your password"
              autoComplete="new-password"
              error={errors.password}
              {...register('password')}
            />
            <Button type="submit" isLoading={isLoading} className="mt-6">
              Login
            </Button>
          </form>
        </AuthLayout>
      )}
    </>
  );
}
