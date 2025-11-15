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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <NextSeo
        title="Register | Minerva AI"
        description="Create your Minerva AI account to start using our AI assistant"
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
          title: 'Register | Minerva AI',
          description: 'Create your Minerva AI account',
        }}
      />
      <AuthLayout
        title="Create your account"
        setIsLoading={setIsLoading}
        footer={
          <p className="text-primary-text text-sm">
            Already registered?{' '}
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-300 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm px-1"
              aria-label="Sign in to your existing account"
            >
              Sign in
            </a>
          </p>
        }
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
          className="space-y-4"
          noValidate
          aria-label="Registration form"
        >
          <Input
            id="name"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            error={errors.name}
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />

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
            autoComplete="new-password"
            error={errors.password}
            aria-required="true"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm your password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            aria-required="true"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={
              errors.confirmPassword ? 'confirm-password-error' : undefined
            }
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="mt-6 w-full"
            aria-disabled={isLoading}
            aria-label={
              isLoading ? 'Creating account...' : 'Create new account'
            }
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
