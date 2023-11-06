import Layout from '@/components/layout/Layout'
import CategoryForm from '@/components/pages/category-editor/CategoryForm';
import { Category, categorySchema } from '@/lib/api_schema';
import { prisma } from '@/lib/prisma';
import { requestNoResponse, requestWithResponse } from '@/lib/utils';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';

export const getServerSideProps = (async (context) => {
  // get category id
  // must be in params, so params must exist
  if (context.params) {
    const { cat_id } = context.params;
    // must be one param (string)
    if (typeof cat_id === 'string') {
      // must actually be a number
      const id = parseInt(cat_id);
      if (!isNaN(id)) {
        const category = await prisma.category.findUnique({
          where: { id },
          select: { name: true }
        });
        if (category) return { props: {
          id,
          name: category.name,
        }}
      }
    }
  }
  // if cat_id doesn't exist or is not a valid category id in the database, this page should not exist
  return { notFound: true }
}) satisfies GetServerSideProps<{id: number, name: string}>

export default function Page({id, name}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout
      current={`/items/edit/${id}`}
      title={`Edit Category ${name}`}
    >
      <CategoryForm
        cat_id={id}
      />
    </Layout>
  )
}
