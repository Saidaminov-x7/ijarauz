import * as z from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Введите email'),
  password: z.string().min(1, 'Введите пароль'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;