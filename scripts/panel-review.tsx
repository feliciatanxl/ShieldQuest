import React,{useState} from 'react'
import {createRoot} from 'react-dom/client'
import '@fontsource/outfit/latin-400.css'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/press-start-2p/latin-400.css'
import '../src/styles/tokens.css'
import '../src/styles/game.css'
import '../src/styles/modals.css'
import {GamePanel,DialogueBox,type GamePanelView} from '../src/components/GamePanels'
import {FriendsPanel} from '../src/components/FriendsPanel'
import {ProfileModal} from '../src/components/ProfileModal'
import {ShopModal} from '../src/components/ShopModal'
import {QuickMenu} from '../src/components/QuickMenu'
import {EvidenceBoard} from '../src/components/EvidenceBoard'
import {SpotTheRiskChallenge} from '../src/components/SpotTheRiskChallenge'
import {HoldBeforeActingChallenge} from '../src/components/HoldBeforeActingChallenge'
import {IdentifyTheInfluenceChallenge} from '../src/components/IdentifyTheInfluenceChallenge'
import {EvaluateConsequencesChallenge} from '../src/components/EvaluateConsequencesChallenge'
import {LeadTheRightChoiceChallenge} from '../src/components/LeadTheRightChoiceChallenge'
import {DefendYourCommunityChallenge} from '../src/components/DefendYourCommunityChallenge'
import {newSave} from '../src/state/saveGame'
import {presets} from '../src/state/avatar'
import {clueIds} from '../src/state/investigation'
function Preview(){
  const [save,setSave]=useState(()=>({...newSave(presets[0].avatar,'Review'),tutorial:'done' as const}))
  const panel=new URLSearchParams(location.search).get('panel')||'settings'
  const onClose=()=>document.querySelector('dialog')?.close(),noop=()=>{}
  if(panel==='friends')return <FriendsPanel onClose={onClose}/>
  if(panel==='profile')return <ProfileModal save={save} onClose={onClose} onOpen={noop} onUpdate={changes=>setSave({...save,...changes})}/>
  if(panel==='shop')return <ShopModal save={save} onClose={onClose} onWear={noop} onBuy={()=>({ok:false,message:'Preview only'})}/>
  if(panel==='pause')return <QuickMenu save={save} onClose={onClose} onOpen={noop} onCheckpoint={()=>true} onReturn={noop} onReturnToNeighbourhood={noop}/>
  if(panel==='dialogue')return <DialogueBox id="may" choice={null} onClose={onClose} onChoice={noop}/>
  if(panel==='evidence')return <EvidenceBoard discovered={[...clueIds]} spotComplete={false} onClose={onClose} onOpenSpot={noop}/>
  const Challenge={spot:SpotTheRiskChallenge,hold:HoldBeforeActingChallenge,influence:IdentifyTheInfluenceChallenge,consequences:EvaluateConsequencesChallenge,lead:LeadTheRightChoiceChallenge,defend:DefendYourCommunityChallenge}[panel]
  if(Challenge)return <Challenge onClose={onClose} onSubmit={noop}/>
  return <GamePanel panel={panel as GamePanelView} save={save} onClose={onClose} onUpdate={changes=>setSave({...save,...changes})} onRestart={noop} onOpenBoard={noop} onCollectGuardian={noop}/>
}
createRoot(document.getElementById('root')!).render(<Preview/>);
