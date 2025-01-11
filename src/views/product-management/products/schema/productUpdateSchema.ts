import { z } from 'zod'

import { type getDictionary } from '@/utils/getDictionary'
import type { components } from '@/@core/api/v1'

// Define a function that takes keywordsTranslate as a parameter
export const schema = (dictionary: Awaited<ReturnType<typeof getDictionary>>) =>
  z.object({
    title: z.string({ required_error: `${dictionary.keywords?.title} ${dictionary.keywords.isRequired}` }),
    slug: z.string({ required_error: `${dictionary.keywords?.slug} ${dictionary.keywords.isRequired}` }),
    description: z.string().optional(),
    body: z.string().optional(),
    tags: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.union([z.string(), z.number()]).optional()
          })
        )
        .optional(),
      z.null()
    ]),
    retail_unit_ids: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.union([z.string(), z.number()]).optional()
          })
        )
        .optional(),
      z.null()
    ]),
    wholesale_unit_ids: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.union([z.string(), z.number()]).optional()
          })
        )
        .optional(),
      z.null()
    ]),
    category_id: z.object(
      {
        label: z.string().optional(),
        value: z.number().optional()
      },
      { required_error: `${dictionary.keywords.category} ${dictionary.keywords.isRequired}` }
    ),
    type: z.object(
      {
        label: z.string().optional(),
        value: z.string().optional() as z.ZodType<components['schemas']['ProductInterfaceTypeEnum']['value']>
      },
      { required_error: `${dictionary.keywords.type} ${dictionary.keywords.isRequired}` }
    ),
    categories_id: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.union([z.string(), z.number()]).optional()
          })
        )
        .optional(),
      z.null()
    ]),
    published_at: z.union([z.string(), z.date()]).optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional(),
    brand_id: z
      .object({
        label: z.string().optional(),
        value: z.number().optional()
      })
      .optional(),
    tax_id: z
      .object({
        label: z.string().optional(),
        value: z.number().optional()
      })
      .optional(),
    attributes: z
      .array(
        z.object({
          attribute_id: z.number(),
          codding: z.boolean(),
          special: z.boolean(),
          values: z.array(
            z.object({
              label: z.string().optional(),
              value: z.number().optional()
            }),
            { required_error: `${dictionary.keywords.user_groups} ${dictionary.keywords.isRequired}` }
          )
        })
      )
      .optional(),
    warning_quantity: z.number().optional(),
    max_discount_percent: z.number().optional(),
    simple_product: z.object({
      width: z.number().optional(),
      height: z.number().optional(),
      length: z.number().optional(),
      weight: z.number().optional(),
      minimum_sale: z.number().optional(),
      maximum_sale: z.number().optional(),
      retail_price: z.number().optional(),
      wholesale_price: z.number().optional(),
      published: z.string().optional(),
      stock: z.number().optional(),
      sku: z.string({ required_error: `${dictionary.keywords.sku} ${dictionary.keywords.isRequired}` }),
      pricing_plans: z.array(
        z.object({
          pricing_plan_id: z.number().optional(),
          application_percent: z.number().optional(),
          default_application_percent: z.number().optional(),
          website_percent: z.number().optional(),
          default_website_percent: z.number().optional(),
          application_percent_changed: z.boolean().optional(),
          website_percent_changed: z.boolean().optional(),
          title: z.string().optional(),
          type: z.string().optional()
        })
      )
    })
  })

export type FormData = z.infer<ReturnType<typeof schema>>
