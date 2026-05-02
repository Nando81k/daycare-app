"use server"

import { searchAdminEntities, type AdminSearchResult } from "@/lib/dal/admin-search"

export async function runAdminSearch(query: string): Promise<AdminSearchResult> {
  return searchAdminEntities(query)
}
