import { useState } from 'react'
import { ArrowLeft, Check, Copy, Search, Trash2, UserPlus, Users, Wifi, WifiOff } from 'lucide-react'
import { randomAvatar, type Avatar } from '../state/avatar'
import { residents } from '../game/residentData'
import { AvatarSprite, ResidentPortrait } from './AvatarSprite'
import type { ResidentId } from '../game/events'
import { Button, Modal } from './ui'

export type FriendStatus = 'online' | 'offline' | 'in-game'
export type Friend = {
  id: string
  name: string
  code: string
  avatar: Avatar
  status: FriendStatus
  lastSeen?: string
  bio?: string
}

const STORAGE_KEY = 'shieldquest.friends'
const CODE_KEY = 'shieldquest.friendCode'
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

const defaultFriends: Friend[] = [
  {
    id: 'friend-amir',
    name: 'Amir',
    code: 'AMIR2026',
    avatar: residents.amir,
    status: 'online',
    bio: 'Exploring the playground past the sheltered walkway.',
  },
  {
    id: 'friend-jun',
    name: 'Jun',
    code: 'JUN99EST',
    avatar: residents.jun,
    status: 'in-game',
    bio: 'Looking for a lookout at Sunshine Minimart.',
  },
  {
    id: 'friend-may',
    name: 'Auntie May',
    code: 'MAY101SG',
    avatar: residents.may,
    status: 'offline',
    lastSeen: '2h ago',
    bio: 'Kopi Corner regular. Sunshine Minimart is beside it!',
  },
]

// Neighbours in your list show the same PixelLab portrait as in the estate; added players show their avatar.
const residentFriends: Record<string, ResidentId> = { 'friend-amir': 'amir', 'friend-jun': 'jun', 'friend-may': 'may' }
export function FriendPortrait({ friend }: { friend: Friend }) {
  const resident = residentFriends[friend.id]
  return resident ? <ResidentPortrait id={resident} /> : <AvatarSprite avatar={friend.avatar} />
}

export function readStoredFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultFriends
    const parsed = JSON.parse(raw)
    // Lists saved by earlier versions labelled the starter friends '(Demo)'.
    return Array.isArray(parsed)
      ? parsed.map((friend: Friend) => ({ ...friend, name: String(friend.name).replace(/ \((Demo|Local)\)$/, '') }))
      : defaultFriends
  } catch {
    return defaultFriends
  }
}

function writeStoredFriends(friends: Friend[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(friends))
  } catch {
    // Local storage unavailable
  }
}

export function friendCodeFromSave(): string {
  try {
    const stored = localStorage.getItem(CODE_KEY)
    if (stored && /^[A-Z0-9]{8}$/.test(stored)) return stored
    const code = Array.from({ length: 8 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
    localStorage.setItem(CODE_KEY, code)
    return code
  } catch {
    return 'B25NSU9P'
  }
}

const statusLabel: Record<FriendStatus, string> = {
  'online': 'Online',
  'offline': 'Offline',
  'in-game': 'In Game',
}
const statusOrder: Record<FriendStatus, number> = { 'in-game': 0, 'online': 1, 'offline': 2 }

export function FriendsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'list' | 'add'>('list')
  const [search, setSearch] = useState('')
  const [addCode, setAddCode] = useState('')
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)
  const [friends, setFriends] = useState<Friend[]>(readStoredFriends)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const friendCode = friendCodeFromSave()

  const filtered = friends
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  const onlineCount = friends.filter(f => f.status !== 'offline').length

  async function copyCode(codeToCopy: string) {
    try {
      await navigator.clipboard.writeText(codeToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setNotice(`Friend code: ${codeToCopy}`)
    }
  }

  function handleAddFriend(event: React.FormEvent) {
    event.preventDefault()
    const sanitized = addCode.toUpperCase().trim()
    if (!/^[A-Z0-9]{8}$/.test(sanitized)) {
      setNotice('Please enter a valid 8-character code.')
      return
    }
    if (sanitized === friendCode) {
      setNotice("That is your own friend code!")
      return
    }
    if (friends.some(f => f.code === sanitized)) {
      setNotice('This player is already in your friends list!')
      return
    }

    const newFriend: Friend = {
      id: 'friend-' + Date.now(),
      name: `Player ${sanitized.slice(0, 4)}`,
      code: sanitized,
      avatar: randomAvatar(),
      status: 'online',
      bio: 'Added via friend code in Sunshine Estate.',
    }

    const updated = [newFriend, ...friends]
    setFriends(updated)
    writeStoredFriends(updated)
    setAddCode('')
    setNotice(`Added ${newFriend.name} to your friends!`)
    setTab('list')
    setSelectedFriend(newFriend)
  }

  function removeFriend(id: string) {
    const updated = friends.filter(f => f.id !== id)
    setFriends(updated)
    writeStoredFriends(updated)
    setSelectedFriend(null)
    setNotice('Friend removed from your local list.')
  }

  return <Modal title={selectedFriend ? selectedFriend.name : 'Friends'} eyebrow="COMMUNITY" className="friends-modal" onClose={onClose}>
    {selectedFriend ? (
      /* Friend Profile Preview */
      <div className="friends-profile-view">
        <button type="button" className="text-button friends-back-btn" onClick={() => setSelectedFriend(null)}>
          <ArrowLeft size={16} /> Back to Friends
        </button>

        <div className="friends-profile-card">
          <div className="friends-profile-stage">
            <FriendPortrait friend={selectedFriend} />
          </div>
          <div className="friends-profile-details">
            <h3>{selectedFriend.name}</h3>
            <span className={`friends-status-badge ${selectedFriend.status}`}>
              <span className="friends-dot" /> {statusLabel[selectedFriend.status]}
              {selectedFriend.status === 'offline' && selectedFriend.lastSeen && ` · ${selectedFriend.lastSeen}`}
            </span>
            <p className="friends-profile-code">
              Code: <strong>{selectedFriend.code}</strong>
            </p>
            {selectedFriend.bio && <p className="friends-profile-bio">{selectedFriend.bio}</p>}
          </div>
        </div>

        <div className="friends-profile-actions">
          <Button className="secondary" onClick={() => copyCode(selectedFriend.code)}>
            {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Friend Code</>}
          </Button>
          <Button className="secondary danger-btn" onClick={() => removeFriend(selectedFriend.id)}>
            <Trash2 size={16} /> Remove Friend
          </Button>
        </div>
      </div>
    ) : (
      /* Main Friends View */
      <>
        <div className="friends-header">
          <div className="friends-tabs">
            <button type="button" className={`friends-tab ${tab === 'list' ? 'active' : ''}`}
              onClick={() => { setTab('list'); setNotice('') }}>
              <Users size={16} /> Friends ({friends.length})
            </button>
            <button type="button" className={`friends-tab ${tab === 'add' ? 'active' : ''}`}
              onClick={() => { setTab('add'); setNotice('') }}>
              <UserPlus size={16} /> Add Friend
            </button>
          </div>
        </div>

        {notice && <p className="friends-notice" role="status">{notice}</p>}

        {tab === 'list' && <>
          {friends.length > 0 && <div className="friends-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" placeholder="Search friends by name or code…" value={search}
              onChange={e => setSearch(e.target.value)} autoComplete="off" />
          </div>}

          {friends.length === 0 ? (
            <div className="friends-empty">
              <Users size={36} aria-hidden="true" />
              <p><strong>No friends yet</strong></p>
              <p>Share your friend code with other players to connect!</p>
              <Button className="secondary" onClick={() => { setTab('add'); setNotice('') }}>
                <UserPlus size={16} /> Add a friend
              </Button>
            </div>
          ) : (
            <>
              <div className="friends-status-bar">
                <span className="friends-online-count">
                  {onlineCount > 0 ? <><Wifi size={14} /> {onlineCount} online</> : <><WifiOff size={14} /> All offline</>}
                </span>
                <small className="friends-hint-text">Click a friend to view profile</small>
              </div>

              <ul className="friends-list" aria-label="Friends list">
                {filtered.map(friend => (
                  <li key={friend.id}>
                    <button type="button" className="friends-entry-btn" onClick={() => setSelectedFriend(friend)}>
                      <span className="friends-avatar">
                        <FriendPortrait friend={friend} />
                        <span className={`friends-status-dot ${friend.status}`} title={statusLabel[friend.status]} />
                      </span>
                      <div className="friends-info">
                        <strong>{friend.name}</strong>
                        <small>
                          <span className={`friends-status-text ${friend.status}`}>{statusLabel[friend.status]}</span>
                          {friend.lastSeen && friend.status === 'offline' ? ` · ${friend.lastSeen}` : ''}
                        </small>
                      </div>
                      <span className="friends-entry-code">{friend.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {filtered.length === 0 && search && <p className="friends-no-match">No friends match "{search}".</p>}
            </>
          )}
        </>}

        {tab === 'add' && <>
          <div className="friends-your-code">
            <span className="friends-section-title">Your friend code</span>
            <p className="friends-code-hint">Share this code so other players can add you.</p>
            <div className="friends-code-card">
              <span className="friends-code-badge" aria-label={`Your friend code is ${friendCode}`}>
                {friendCode}
              </span>
              <button
                type="button"
                className={`friends-copy-btn ${copied ? 'copied-state' : ''}`}
                onClick={() => copyCode(friendCode)}
                aria-label={copied ? 'Friend code copied' : 'Copy friend code'}
              >
                {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
              </button>
            </div>
          </div>

          <form className="friends-add-form" onSubmit={handleAddFriend}>
            <label>
              <span className="friends-section-title">Add by friend code</span>
              <input value={addCode} maxLength={8}
                onChange={e => setAddCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                placeholder="Enter 8-character code" autoComplete="off" autoCapitalize="characters" spellCheck={false} />
            </label>
            <Button type="submit" className="primary" disabled={addCode.length !== 8}>
              <UserPlus size={16} /> Send Friend Request
            </Button>
          </form>

          <p className="friends-local-note">
            Your friends list and friend code are saved on this device.
          </p>
        </>}
      </>
    )}
  </Modal>
}
