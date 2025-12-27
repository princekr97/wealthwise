/**
 * Validation Schemas using Zod
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name should be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters')
});