export type PlayerProfile={bio:string;createdAt?:string;lastLoginAt?:string}
export const PROFILE_BIO_LIMIT=160
export const DEFAULT_BIO='Making good choices, one neighbourhood at a time.'
export function profileBio(value:unknown){return typeof value==='string'?value.trim().slice(0,PROFILE_BIO_LIMIT):DEFAULT_BIO}
export function readPlayerProfile(raw:unknown):PlayerProfile{
  const data=raw&&typeof raw==='object'?raw as Record<string,unknown>:{}
  const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&Date.parse(v)<=Date.now()+60000?v:undefined
  return {bio:profileBio(data.bio),createdAt:date(data.createdAt),lastLoginAt:date(data.lastLoginAt)}
}
export function newPlayerProfile(now=new Date()):PlayerProfile{return {bio:DEFAULT_BIO,createdAt:now.toISOString(),lastLoginAt:now.toISOString()}}
