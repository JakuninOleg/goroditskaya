import { createLeadHandler } from './leads.mjs';

export const runtime = 'nodejs';
const handle = createLeadHandler();
export async function POST(request) { return handle(request); }
export async function OPTIONS(request) { return handle(request); }
