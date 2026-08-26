import { z } from 'zod';
import { sanitizeInput } from '@/lib/security';

export const addListingSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .transform((val) => sanitizeInput(val)),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters')
    .transform((val) => sanitizeInput(val)),
  
  price: z.number().positive().or(
    z.string().regex(/^\d+(\.\d+)?$/).transform(Number)
  ),
  
  location: z.string()
    .min(5, 'Location must be at least 5 characters')
    .max(100, 'Location must be at most 100 characters')
    .transform((val) => sanitizeInput(val)),
  
  rooms: z.number().int().min(1).max(10),
  
  area: z.number().positive().or(
    z.string().regex(/^\d+(\.\d+)?$/).transform(Number)
  ),
  
  floor: z.number().int().min(1).max(50),
  
  totalFloors: z.number().int().min(1).max(50),
  
  amenities: z.array(z.string()).max(20, 'Too many amenities').optional().default([]),
  
  latitude: z.number().min(-90).max(90).optional().default(41.311081),
  longitude: z.number().min(-180).max(180).optional().default(69.240562),
  
  regionId: z.number().int().positive().optional(),
});

export type AddListingFormValues = z.infer<typeof addListingSchema>;