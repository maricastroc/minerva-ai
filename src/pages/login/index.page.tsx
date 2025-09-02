import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { Button } from '@/components/Button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const loginSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup.string().required('Password is required'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onSubmit',
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
        toast.error(result?.error);
      } else {
        toast.success('Welcome to the Simple Chat!');
        router.push('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary-gray800 flex flex-col justify-center items-center p-8">
      <div className="mb-10">
        <Image width={180} height={180} alt="Logo" src="/logo-full.svg" />
      </div>

      <div className="w-full overflow-y-auto chat-scroll-container max-w-xl bg-primary-gray700 backdrop-blur-sm rounded-2xl p-8">
        <h1 className="text-2xl text-white/80 text-center mb-6">
          Sign in to your account
        </h1>

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
            Sign in
          </Button>
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-4 text-white/50 text-sm">or</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <div className="text-center">
          <p className="text-white/80 text-sm">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-primary-purple500 hover:text-primary-purple300 font-semibold transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
