import { IncomingForm } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcrypt'
import { buildNextAuthOptions } from '../../auth/[...nextauth].api'
import fs from 'fs'
import { prisma } from '@/lib/prisma'
import * as yup from 'yup'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface Updates {
  name?: string
  email?: string
  password?: string
  avatarUrl?: string | null
}

const getSingleString = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'string') return value
  return undefined
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  if (!session) {
    return res
      .status(403)
      .json({ message: 'You must be logged in to update your profile.' })
  }

  const form = new IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error processing form' })
    }

    try {
      const userId = String(req.query.userId)
      const removeAvatar = getSingleString(fields.removeAvatar) === 'true'

      const updatedFields: Updates = {
        name: fields.name ? getSingleString(fields.name) : undefined,
        email: fields.email ? getSingleString(fields.email) : undefined,
        password: fields.password ? getSingleString(fields.password) : undefined,
      }

      const updateUserSchema = yup.object().shape({
        name: yup.string().notRequired(),
        email: yup.string().email('Invalid email').notRequired(),
        password: yup
          .string()
          .min(8, 'Password must be at least 8 characters')
          .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
          .matches(/[0-9]/, 'Password must contain at least one number')
          .notRequired(),
      })

      const validatedFields = await updateUserSchema.validate(updatedFields, {
        abortEarly: false,
      })

      const avatarFile = files.avatarUrl?.[0]

      let avatarUrl: string | null | undefined

      if (removeAvatar) {
        avatarUrl = null
      } else if (avatarFile) {
        const MAX_SIZE = 2 * 1024 * 1024
        const fileContent = await fs.promises.readFile(avatarFile.filepath)

        if (fileContent.length > MAX_SIZE) {
          return res
            .status(400)
            .json({ message: 'Image must be a maximum of 2MB!' })
        }

        const base64Image = fileContent.toString('base64')
        avatarUrl = `data:${avatarFile.mimetype};base64,${base64Image}`

        await fs.promises.unlink(avatarFile.filepath)
      } else {
        avatarUrl = undefined
      }

      const updates: Updates = {
        avatarUrl,
        name: validatedFields.name ?? undefined,
        email: validatedFields.email ?? undefined,
        password: validatedFields.password ?? undefined,
      }

      if (validatedFields.password) {
        updates.password = await bcrypt.hash(validatedFields.password, 10)
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId.toString() },
        data: updates,
      })

      return res.status(200).json(updatedUser)
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.errors[0] })
      } else if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  })
}
