import { redirect } from 'next/navigation'

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  redirect(`/dashboard/menu?action=edit&id=${resolvedParams.id}`)
}
