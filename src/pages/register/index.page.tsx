import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { Button } from '@/components/Button';

const registerSchema = yup.object({
  name: yup
    .string()
    .required('Nome completo é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'Senhas não coincidem'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    console.log('Registration attempt:', {
      name: data.name,
      email: data.email,
      password: data.password,
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-primary-gray800 flex flex-col justify-center items-center p-8">
      <div className="mb-10">
        <Image width={180} height={180} alt="Logo" src="/logo-full.svg" />
      </div>

      <div className="w-full overflow-y-auto chat-scroll-container max-w-xl bg-primary-gray700 backdrop-blur-sm rounded-2xl p-8">
        <h1 className="text-2xl text-white/80 text-center mb-6">
          Create your account
        </h1>

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

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-4 text-white/50 text-sm">or</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <div className="text-center">
          <p className="text-white/80 text-sm">
            Already registered?{' '}
            <a
              href="/login"
              className="text-primary-purple500 hover:text-primary-purple300 font-semibold transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
