/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { buildNextAuthOptions } from '../../auth/[...nextauth].api';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import * as yup from 'yup';

const changeEmailSchema = yup.object().shape({
  newEmail: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Current password is required'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res)
  );

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { newEmail, password } = req.body;

    await changeEmailSchema.validate({ newEmail, password });

    const user = await prisma.user.findUnique({
      where: { id: String(session.user.id) },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email === newEmail) {
      return res.status(400).json({
        message: 'New email must be different from current email',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'Password authentication not available',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        emailVerified: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return res.status(200).json({
      message: 'Email updated successfully!',
      data: updatedUser,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.errors[0] });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}
