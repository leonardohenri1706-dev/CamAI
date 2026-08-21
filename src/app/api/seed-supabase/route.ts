import { NextResponse } from 'next/server';
import { bulkSeedSupabaseFromCatalog } from '@/lib/supabase';

export async function GET() {
  const result = await bulkSeedSupabaseFromCatalog();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await bulkSeedSupabaseFromCatalog();
  return NextResponse.json(result);
}
