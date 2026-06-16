import { NextResponse } from 'next/server';
import wisataData from '../../../data/wisata.json';

export async function GET() {
  return NextResponse.json(wisataData);
}
