import {useEffect,useState} from 'react'
import {parseTemperature,parseForecast,type WeatherSnapshot} from '../state/singaporeWeather'
const BASE='https://api-open.data.gov.sg/v2/real-time/api/'
export function useSingaporeWeather(){
  const [now,setNow]=useState(()=>new Date()),[weather,setWeather]=useState<WeatherSnapshot>({}),[loading,setLoading]=useState(true)
  useEffect(()=>{
    let alive=true,controller:AbortController|undefined,busy=false
    async function refresh(){
      if(busy)return;busy=true;controller=new AbortController()
      const timeout=setTimeout(()=>controller?.abort(),10000)
      const fetchData=async(path:string)=>{const r=await fetch(BASE+path,{signal:controller!.signal});if(!r.ok)throw Error('Weather request failed');return r.json()}
      try{
        const results=await Promise.allSettled([fetchData('air-temperature').then(parseTemperature),fetchData('two-hr-forecast').then(raw=>parseForecast(raw))])
        if(alive)setWeather(previous=>({...previous,...Object.assign({},...results.filter(r=>r.status==='fulfilled').map(r=>(r as PromiseFulfilledResult<WeatherSnapshot>).value))}))
      }finally{clearTimeout(timeout);busy=false;if(alive)setLoading(false)}
    }
    void refresh()
    const clock=setInterval(()=>setNow(new Date()),15000),updates=setInterval(()=>{void refresh()},5*60000)
    const visible=()=>{if(document.visibilityState==='visible'){setNow(new Date());void refresh()}}
    document.addEventListener('visibilitychange',visible)
    return()=>{alive=false;controller?.abort();clearInterval(clock);clearInterval(updates);document.removeEventListener('visibilitychange',visible)}
  },[])
  return {now,weather,loading}
}
