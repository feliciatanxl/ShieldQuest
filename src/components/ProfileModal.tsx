import {useState} from 'react'
import {ArrowUpRight,Check,Coins,Copy,Edit3,MapPin,Package,ShieldCheck,Users} from 'lucide-react'
import type {Save} from '../state/saveGame'
import {WALK_GOAL} from '../state/saveGame'
import {readPlayerProfile,PROFILE_BIO_LIMIT} from '../state/profile'
import {guardians} from '../state/guardians'
import {readStoredFriends,friendCodeFromSave,FriendPortrait} from './FriendsPanel'
import {AvatarSprite} from './AvatarSprite'
import {Button,Modal} from './ui'
import type {GamePanelView} from './GamePanels'

const dateLabel=(date?:string)=>date?new Intl.DateTimeFormat('en-SG',{timeZone:'Asia/Singapore',day:'numeric',month:'short',year:'numeric'}).format(new Date(date)):'Not recorded'
const loginLabel=(date?:string)=>date?new Intl.DateTimeFormat('en-SG',{timeZone:'Asia/Singapore',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(date)):'This session'
export function ProfileModal({save,onClose,onUpdate,onOpen}:{save:Save;onClose:()=>void;onUpdate:(changes:Partial<Save>)=>void;onOpen:(panel:GamePanelView|'friends'|'shop')=>void}){
  const profile=readPlayerProfile(save.profile),[editing,setEditing]=useState(false),[bio,setBio]=useState(profile.bio),[feedback,setFeedback]=useState('')
  const [friends]=useState(readStoredFriends),[code]=useState(friendCodeFromSave)
  const completed=Object.values(save.shield).filter(result=>result?.status==='completed').length
  const xp=Math.round(save.walked/WALK_GOAL*20),collection=Object.values(save.shop??{}).reduce((a,b)=>a+b,0)
  async function copyCode(){try{await navigator.clipboard.writeText(code);setFeedback('Friend code copied.')}catch{setFeedback('Select and copy your friend code above.')}}
  return <Modal title="User profile" eyebrow="SUNSHINE ESTATE · THAT’S ME" className="profile-modal" onClose={onClose}>
    <div className="profile-top">
      <section className="profile-identity" aria-label="Your details"><div className="profile-person"><div className="profile-avatar"><AvatarSprite avatar={save.avatar}/><span><i/>Playing now</span></div><div className="profile-person-copy"><div className="profile-name-row"><h3>{save.name}</h3><span className="profile-level">LEVEL 01</span></div>
        <div className="profile-name-xp"><div className="profile-xp-track" role="progressbar" aria-label="Profile experience" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${xp}%`}}/></div><span>{xp}/100 XP</span></div><p className="profile-bio">{profile.bio||'No bio yet.'}</p><button className="text-button profile-edit" onClick={()=>{setBio(profile.bio);setEditing(!editing)}}><Edit3 size={13}/>{editing?'Cancel edit':'Edit bio'}</button></div></div>
      {editing&&<form className="profile-bio-editor" onSubmit={e=>{e.preventDefault();onUpdate({profile:{...profile,bio:bio.trim()}});setEditing(false);setFeedback('Profile updated.')}}><label htmlFor="profile-bio">Your bio</label><textarea id="profile-bio" maxLength={PROFILE_BIO_LIMIT} value={bio} onChange={e=>setBio(e.target.value)} rows={3}/><div><small>{bio.length}/{PROFILE_BIO_LIMIT}</small><Button className="primary" type="submit">Save bio</Button></div></form>}
      <div className="profile-details-card"><dl className="profile-facts">{profile.createdAt&&<div><dt>Joined</dt><dd>{dateLabel(profile.createdAt)}</dd></div>}<div><dt>Last login</dt><dd>{loginLabel(profile.lastLoginAt)} {profile.lastLoginAt&&<small>SGT</small>}</dd></div><div><dt>Location</dt><dd><MapPin size={13}/>Sunshine Estate</dd></div></dl>
      <div className="profile-inline-code profile-location-code"><span>Friend code</span><div><code>{code}</code><button type="button" onClick={copyCode} aria-label="Copy friend code"><Copy size={13}/></button></div></div></div>

      </section>
      <aside className="profile-social"><h3><Users size={17}/>Friends <span>{friends.length}</span></h3><div className="profile-friend-preview">{friends.slice(0,3).map(friend=><div key={friend.id}><span className="profile-friend-avatar"><FriendPortrait friend={friend}/></span><div><strong>{friend.name}</strong><small>{friend.id.startsWith('friend-')?'Estate neighbour':'Added friend'}</small></div></div>)}{!friends.length&&<p>No friends added yet.</p>}</div><Button className="secondary" onClick={()=>onOpen('friends')}><Users size={15}/> View friends <ArrowUpRight size={14}/></Button></aside>
    </div>
    <section className="profile-progress"><header><h3><ShieldCheck size={18}/> Your SHIELD journey</h3><span>{completed} of 6 completed</span></header><div className="profile-badges">{guardians.map(g=>{const done=!!save.shield[g.competency];return <div key={g.id} className={done?'earned':''} title={`${g.challenge}: ${done?'completed':'not completed'}`}><span>{g.competency}{done&&<Check size={10}/>}</span><small>{g.challenge}</small></div>})}</div><div className="profile-stats"><div><Coins size={17}/><strong>{save.coins}</strong><small>Coins</small></div><div><ShieldCheck size={17}/><strong>{save.collectedGuardians.length}</strong><small>Guardians</small></div><div><Package size={17}/><strong>{collection}</strong><small>Collected items</small></div></div></section>
    <section className="profile-estate"><div className="profile-estate-icon"><MapPin size={24}/></div><div><small>YOUR NEIGHBOURHOOD</small><strong>Sunshine Estate</strong><span>A community worth looking out for.</span></div><Button className="secondary" onClick={()=>onOpen('map')}>Area map <ArrowUpRight size={14}/></Button></section>
    <div className="profile-actions"><button className="text-button" onClick={()=>onOpen('guardians')}><ShieldCheck size={15}/> Guardian collection</button><button className="text-button" onClick={()=>onOpen('shop')}><Package size={15}/> Shop &amp; collection</button></div><p className="profile-feedback" role="status">{feedback}</p>
  </Modal>
}
