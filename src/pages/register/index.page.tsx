import { NextSeo } from 'next-seo';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { Button } from '@/components/Button';
import { api } from '@/lib/axios';
import { handleApiError } from '@/utils/handleApiError';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { AuthLayout } from '@/layouts/AuthLayout';

const registerSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must have at least 3 characters'),
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must have at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Password confirmation is required')
    .oneOf([yup.ref('password')], "Passwords don't match"),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      setIsLoading(true);

      await api.post(`/user/create`, data);

      toast.success('User successfully registered!');

      router.push('/');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <NextSeo
        title="Register | Minerva AI"
        additionalMetaTags={[
          {
            name: 'viewport',
            content:
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
          },
        ]}
      />
      <AuthLayout
        title="Create your account"
        setIsLoading={setIsLoading}
        footer={
          <p className="text-white/80 text-sm">
            Already registered?{' '}
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in
            </a>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            error={errors.name}
            {...register('name')}
          />

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

          <PasswordInput
            id="confirmPassword"
            label="Confirm your password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />

          <Button type="submit" isLoading={isLoading} className="mt-6">
            Create account
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
