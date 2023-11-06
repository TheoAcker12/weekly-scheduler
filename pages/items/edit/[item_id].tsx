import Layout from '@/components/layout/Layout'
import ItemForm from '@/components/pages/item-editor/ItemForm';
import { prisma } from '@/lib/prisma';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps = (async (context) => {
  // get category id
  // must be in params, so params must exist
  if (context.params) {
    const { item_id } = context.params;
    // must be one param (string)
    if (typeof item_id === 'string') {
      // must actually be a number
      const id = parseInt(item_id);
      if (!isNaN(id)) {
        // must be valid id for an item in the database
        const item = await prisma.item.findUnique({
          where: { id },
          select: { name: true }
        });
        if (item) return { props: {
          id,
          name: item.name,
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
      title={`Edit Item: ${name}`}
    >
      <ItemForm item_id={id} />
    </Layout>
  )
}