import { compare, hash } from "bcryptjs"

const ROUNDS = 12

export async function hashPassword(value: string) {
  return hash(value, ROUNDS)
}

export async function verifyPassword(value: string, hashValue: string) {
  return compare(value, hashValue)
}
