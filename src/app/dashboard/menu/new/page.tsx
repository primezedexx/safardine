import { redirect } from 'next/navigation'

export default function NewMenuItemPage() {
  redirect('/dashboard/menu?action=new')
}
