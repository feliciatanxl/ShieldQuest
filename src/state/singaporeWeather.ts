export const SINGAPORE_TIME_ZONE='Asia/Singapore'
const LAT=1.3704,LON=103.8475,rad=Math.PI/180
export function singaporeClock(now:Date){
  return {time:new Intl.DateTimeFormat('en-SG',{timeZone:SINGAPORE_TIME_ZONE,hour:'numeric',minute:'2-digit',hour12:true}).format(now).toUpperCase(),day:new Intl.DateTimeFormat('en-SG',{timeZone:SINGAPORE_TIME_ZONE,weekday:'short'}).format(now).toUpperCase()}
}
/** NOAA solar approximation. Twilight follows sun elevation, not the computer's time zone. */
export function nightStrength(now:Date){
  const start=Date.UTC(now.getUTCFullYear(),0,0),day=Math.floor((now.getTime()-start)/86400000)
  const hour=now.getUTCHours()+now.getUTCMinutes()/60+now.getUTCSeconds()/3600
  const gamma=2*Math.PI/365*(day-1+(hour-12)/24)
  const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma))
  const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma)
  const angle=((hour*60+eq+4*LON)%1440/4-180)*rad
  const elevation=Math.asin(Math.sin(LAT*rad)*Math.sin(decl)+Math.cos(LAT*rad)*Math.cos(decl)*Math.cos(angle))/rad
  const t=Math.max(0,Math.min(1,(3-elevation)/9))
  return t*t*(3-2*t)
}
export type WeatherSnapshot={temperature?:number;observedAt?:string;station?:string;forecast?:string;forecastStart?:string;forecastEnd?:string;updatedAt?:string}
const validDate=(v:unknown):v is string=>typeof v==='string'&&Number.isFinite(Date.parse(v))
export function parseTemperature(raw:unknown):WeatherSnapshot {
  const data=(raw as any)?.data
  if((raw as any)?.code!==0||!Array.isArray(data?.readings)||!Array.isArray(data?.stations))throw Error('Invalid temperature response')
  // Prefer the nearest valid observation; never substitute a distant station silently.
  const stations=data.stations.filter((s:any)=>Number.isFinite(s.location?.latitude)&&Number.isFinite(s.location?.longitude)).sort((a:any,b:any)=>Math.hypot(a.location.latitude-LAT,a.location.longitude-LON)-Math.hypot(b.location.latitude-LAT,b.location.longitude-LON))
  const reading=[...data.readings].filter((r:any)=>validDate(r.timestamp)&&Array.isArray(r.data)).sort((a:any,b:any)=>Date.parse(b.timestamp)-Date.parse(a.timestamp))[0]
  if(!reading)throw Error('No temperature readings')
  for(const station of stations){const item=reading.data.find((r:any)=>r.stationId===station.id&&Number.isFinite(r.value)&&r.value>=15&&r.value<=45);if(item)return {temperature:item.value,observedAt:reading.timestamp,station:station.name}}
  throw Error('No local temperature available')
}
export function parseForecast(raw:unknown,now=new Date()):WeatherSnapshot {
  const data=(raw as any)?.data
  if((raw as any)?.code!==0||!Array.isArray(data?.items))throw Error('Invalid forecast response')
  const item=[...data.items].filter((i:any)=>validDate(i.valid_period?.start)&&validDate(i.valid_period?.end)&&Date.parse(i.valid_period.start)<=now.getTime()&&Date.parse(i.valid_period.end)>now.getTime()).sort((a:any,b:any)=>Date.parse(b.timestamp)-Date.parse(a.timestamp))[0]
  const forecast=item?.forecasts?.find((f:any)=>f.area==='Ang Mo Kio')?.forecast
  if(typeof forecast!=='string'||!forecast.trim())throw Error('No current Ang Mo Kio forecast')
  return {forecast,forecastStart:item.valid_period.start,forecastEnd:item.valid_period.end}
}
export function weatherDisplay(snapshot:WeatherSnapshot,now:Date){
  const recent=!!snapshot.observedAt&&Date.parse(snapshot.observedAt)<=now.getTime()+300000&&now.getTime()-Date.parse(snapshot.observedAt)<30*60000
  const current=!!snapshot.forecast&&!!snapshot.forecastStart&&!!snapshot.forecastEnd&&Date.parse(snapshot.forecastStart)<=now.getTime()&&Date.parse(snapshot.forecastEnd)>now.getTime()
  return {temperature:snapshot.temperature!==undefined?`${snapshot.temperature.toFixed(1)}°C`:'—°C',condition:current?snapshot.forecast!:'Weather unavailable',delayed:snapshot.temperature!==undefined&&!recent,current}
}
