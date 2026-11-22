import type Phaser from 'phaser'
import {nightStrength} from '../state/singaporeWeather'
import type {MapProp} from './maps'
import {project} from './isometric'
import {updateGeographicLighting} from './geography'

/** Singapore's solar cycle: cool ambient dusk, lit windows and soft shelter/entrance pools. */
export function estateLighting(scene:Phaser.Scene,props:MapProp[]){
  const veil=scene.add.rectangle(0,0,1,1,0x0a193d).setOrigin(0).setScrollFactor(0).setDepth(50000)
  veil.setName('night-atmosphere')
  const pools=scene.add.graphics().setDepth(50001)
  const locations=props.filter(p=>['bus','lamp','entry'].includes(p.kind)).map(p=>({x:p.x+p.w/2,y:p.y+p.d/2}))
  for(const p of locations){
    const at=project(p.x,p.y)
    for(let radius=48;radius>=8;radius-=8){pools.fillStyle(0xffd7a0,.018);pools.fillEllipse(at.x,at.y,radius*2,radius)}
    pools.fillStyle(0xffe3a4,.28);pools.fillEllipse(at.x,at.y,9,4)
  }
  let last=-Infinity,strength=nightStrength(new Date())
  function tick(time:number){
    if(time-last<500)return
    last=time;strength=nightStrength(new Date())
    // Screen overlay resizes with the canvas; world lights continue to follow the camera.
    const camera=scene.cameras.main,zoom=camera.zoom,w=scene.scale.width,h=scene.scale.height
    // Scroll factor removes panning, but Phaser still applies camera zoom.
    veil.setPosition(w/2-w/(2*zoom),h/2-h/(2*zoom)).setSize(w/zoom,h/zoom).setAlpha(strength*.46)
    pools.setAlpha(strength).setVisible(strength>.01)
    updateGeographicLighting(scene,strength)
    scene.registry.set('nightStrength',strength)
  }
  tick(0)
  return tick
}
