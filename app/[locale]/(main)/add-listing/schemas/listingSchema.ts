import * as z from 'zod';

export const listingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.string().regex(/^\d+$/),
  location: z.string().min(5),
  rooms: z.string().regex(/^\d+$/),
  area: z.string().regex(/^\d+$/),
  type: z.string().min(1),
});

export type ListingFormValues = z.infer<typeof listingSchema>;