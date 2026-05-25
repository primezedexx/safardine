import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_notifications_schema', {})
  if (error) {
    // try selecting 1 row to see keys
    const { data: row } = await supabase.from('notifications').select('*').limit(1)
    if (row && row.length > 0) {
      console.log('Columns:', Object.keys(row[0]))
    } else {
      console.log('No rows found, cannot infer schema via select.')
    }
  } else {
    console.log(data)
  }
}
checkSchema()
