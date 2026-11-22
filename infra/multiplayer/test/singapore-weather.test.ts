import assert from 'node:assert/strict'
import {test} from 'node:test'
import {singaporeClock,nightStrength,parseTemperature,parseForecast,weatherDisplay} from '../../../src/state/singaporeWeather'
const now=new Date('2026-11-22T22:59:00+08:00')
test('Clock and solar lighting follow Singapore time regardless of host time zone',()=>{
  assert.equal(singaporeClock(now).day,'SUN')
  assert.match(singaporeClock(now).time,/10:59\s?PM/)
  assert.equal(nightStrength(now),1)
  assert.equal(nightStrength(new Date('2026-11-22T12:00:00+08:00')),0)
  assert.equal(nightStrength(new Date('2026-11-23T03:00:00+08:00')),1)
  const dawn=nightStrength(new Date('2026-11-22T06:40:00+08:00'))
  assert.ok(dawn>0&&dawn<1,'dawn is a gradual transition')
})
test('Temperature uses nearest available station and newest observation',()=>{
  const result=parseTemperature({code:0,data:{stations:[{id:'far',name:'Changi',location:{latitude:1.36,longitude:103.98}},{id:'near',name:'Ang Mo Kio Avenue 5',location:{latitude:1.3793,longitude:103.85}}],readings:[{timestamp:'2026-11-22T22:00:00+08:00',data:[{stationId:'near',value:30}]},{timestamp:'2026-11-22T22:50:00+08:00',data:[{stationId:'far',value:29},{stationId:'near',value:28.1}]}]}})
  assert.equal(result.temperature,28.1);assert.equal(result.station,'Ang Mo Kio Avenue 5')
  assert.throws(()=>parseTemperature({code:1}))
})
test('Forecast uses current Ang Mo Kio period and rejects expired or missing data',()=>{
  const raw={code:0,data:{items:[{timestamp:'2026-11-22T22:00:00+08:00',valid_period:{start:'2026-11-22T22:00:00+08:00',end:'2026-11-23T00:00:00+08:00'},forecasts:[{area:'Ang Mo Kio',forecast:'Cloudy'}]}]}}
  assert.equal(parseForecast(raw,now).forecast,'Cloudy')
  assert.throws(()=>parseForecast(raw,new Date('2026-11-23T01:00:00+08:00')))
  assert.throws(()=>parseForecast({code:0,data:{items:[]}},now))
})
test('Display explicitly marks delayed temperature and unavailable forecasts',()=>{
  assert.equal(weatherDisplay({},now).temperature,'—°C')
  assert.equal(weatherDisplay({},now).condition,'Weather unavailable')
  assert.equal(weatherDisplay({temperature:28.1,observedAt:'2026-11-22T21:00:00+08:00'},now).delayed,true)
  assert.equal(weatherDisplay({temperature:28.1,observedAt:'2026-11-22T22:50:00+08:00'},now).delayed,false)
})
