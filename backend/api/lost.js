import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if(req.method === 'GET') {
    const { data, error } = await supabase.from('lost').select('*');
    if(error) return res.status(500).json({ error });
    return res.status(200).json(data);
  }
  if(req.method === 'POST') {
    const { name, description, location, imageURL, contact, date, Category } = req.body;
    const { data, error } = await supabase.from('lost').insert({ name, description, location, imageURL, contact, date, Category });
    if(error) return res.status(500).json({ error });
    return res.status(201).json(data);
  }
  res.status(405).send('Method Not Allowed');
}
