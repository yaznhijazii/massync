import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase'

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('sb-yeotsurnvyxzkujyazyf-auth-token')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed?.user || null
    }
  } catch (e) {
    console.warn('[MasSync] Error reading initial session from localStorage:', e)
  }
  return null
}

let activeChannel: any = null
let presenceChannel: any = null
let dbChangesChannel: any = null
let subscribedPresencePairId: string | null = null
let subscribedPairId: string | null = null

function getFriendshipDurationStr(sinceDate: string) {
  if (!sinceDate) return 'Friends for 2 years'
  try {
    const since = new Date(sinceDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - since.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffYears = Math.floor(diffDays / 365)
    const diffMonths = Math.floor((diffDays % 365) / 30)

    if (diffYears > 0) {
      if (diffMonths > 0) {
        return `Friends for ${diffYears} year${diffYears > 1 ? 's' : ''} & ${diffMonths} month${diffMonths > 1 ? 's' : ''}`
      }
      return `Friends for ${diffYears} year${diffYears > 1 ? 's' : ''}`
    }
    if (diffMonths > 0) {
      return `Friends for ${diffMonths} month${diffMonths > 1 ? 's' : ''}`
    }
    return `Friends for ${diffDays} day${diffDays > 1 ? 's' : ''}`
  } catch (e) {
    return 'Friends for 2 years'
  }
}


export interface Task {
  id: string
  pair_id: string
  created_by: 'you' | 'partner'
  title: string
  description?: string
  category: 'personal' | 'shared' | 'challenge'
  recurrence: string
  is_done: boolean
  done_by?: 'you' | 'partner'
  done_at?: string
  date: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  completed_by: 'you' | 'partner'
  week_key: string
}

export interface Memory {
  id: string
  pair_id: string
  created_by: 'you' | 'partner'
  date: string
  title: string
  note?: string
  mood_emoji: string
  tags: string[]
  photo?: string
  photos?: string[]
  type: 'memory' | 'outing' | 'gift'
  time?: string
  place?: string
  vibe?: string
  location_url?: string
  page_url?: string
}

export interface TimeBlock {
  id: string
  pair_id: string
  user_id: string
  title: string
  domain: 'spiritual' | 'work' | 'health' | 'downtime' | 'matches'
  day: string // 'Monday', 'Tuesday', 'Wednesday', etc.
  start_time: string // 'HH:MM'
  end_time: string // 'HH:MM'
  details?: string
  created_by: 'you' | 'partner'
}

export interface Song {
  id: string
  pair_id: string
  gifted_by: 'you' | 'partner'
  title: string
  artist: string
  message: string
  gifted_at: string
  rating?: number
}

export interface PrayerLog {
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
}

export interface Hobby {
  id: string
  pair_id: string
  name: string
  description: string
  cover_image: string
  start_date: string
  goal_date: string
  status: 'active' | 'completed' | 'paused'
  steps: { id: string; title: string; is_done: boolean }[]
  notes: string[]
  photos: string[]
}

export interface TreeNode {
  id: string
  name: string
  relationship: string
  category: 'family' | 'friends'
  note?: string
  avatar?: string
}

export interface WatchItem {
  id: string
  type: 'watch' | 'bucket'
  title: string
  category: string
  status: 'Want to Watch' | 'Watching' | 'Done' | 'Pending' | 'Completed'
  added_by: 'you' | 'partner'
  rating?: number
  priority?: 'High' | 'Medium' | 'Low'
}

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  // Authentication & Pairing
  user: User | null
  authInitialized: boolean
  pairId: string | null
  partnerId: string | null
  inviteCode: string
  partnerInviteCode: string
  pairStatus: 'pending' | 'active'
  partnerName: string
  userName: string
  userCity: string
  partnerCity: string
  userAvatar: string
  partnerAvatar: string
  friendshipDuration: string
  userVibe: string
  partnerVibe: string
  dbError: string | null
  onlineUsers: string[]
  partnerLastSeen: string | null
  
  // App Data
  tasks: Task[]
  taskCompletions: TaskCompletion[]  // recurring task weekly completions
  memories: Memory[]
  timeBlocks: TimeBlock[]
  songs: Song[]
  myPrayers: PrayerLog
  partnerPrayers: PrayerLog
  myAthkar: { [thikrId: string]: number }
  partnerAthkar: { [thikrId: string]: number }
  userQuranPage: number
  partnerQuranPage: number
  quranTarget: string
  hobbies: Hobby[]
  watchlist: WatchItem[]
  myTreeNodes: TreeNode[]
  partnerTreeNodes: TreeNode[]
  dailyChallengeDone: boolean
  toasts: ToastItem[]
  
  // Setters & Actions
  setUser: (user: User | null) => void
  showToast: (message: string, type?: ToastItem['type']) => void
  dismissToast: (id: string) => void
  setPairId: (id: string | null) => void
  setPairStatus: (status: 'pending' | 'active') => void
  setInviteCode: (code: string) => void
  updateProfile: (data: { userName?: string; userCity?: string; userAvatar?: string; vibeStatus?: string }) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  uploadMemoryPhoto: (file: File) => Promise<string>
  changeEmail: (newEmail: string) => Promise<void>
  updateFriendshipDate: (dateStr: string) => Promise<void>
  
  // Auth & Pairing actions
  initAuth: () => () => void
  fetchProfileAndPartner: (userId: string, customToken?: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, city: string) => Promise<any>
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  linkPartner: (code: string) => Promise<any>
  disconnectPartner: () => Promise<void>
  subscribeToRealtime: () => void
  unsubscribeFromRealtime: () => void
  subscribeToPresence: () => void
  unsubscribeFromPresence: () => void
  subscribeToDatabaseChanges: () => void
  unsubscribeFromDatabaseChanges: () => void
  updateLastSeen: () => Promise<void>
  fetchTasks: () => Promise<void>
  fetchSongs: () => Promise<void>
  fetchMemories: () => Promise<void>
  fetchPrayers: () => Promise<void>
  fetchAthkarLogs: () => Promise<void>
  fetchHobbies: () => Promise<void>
  fetchTaskCompletions: () => Promise<void>

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'pair_id' | 'created_by' | 'is_done'>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  sendTaskReminder: (taskTitle: string) => Promise<void>
  addTaskCompletion: (taskId: string) => Promise<void>
  removeTaskCompletion: (completionId: string) => Promise<void>
  
  // Memory Actions
  addMemory: (memory: Omit<Memory, 'id' | 'pair_id' | 'created_by' | 'type'>) => void
  addOuting: (outing: Omit<Memory, 'id' | 'pair_id' | 'created_by' | 'type' | 'note'>) => void
  deleteMemory: (id: string) => Promise<void>
  
  // Time Block Actions
  fetchTimeBlocks: () => Promise<void>
  addTimeBlock: (block: Omit<TimeBlock, 'id' | 'pair_id' | 'user_id' | 'created_by'>) => Promise<void>
  deleteTimeBlock: (id: string) => Promise<void>
  
  // Song Actions
  giftSong: (song: Omit<Song, 'id' | 'pair_id' | 'gifted_by' | 'gifted_at'>) => void
  updateSongRating: (songId: string, rating: number) => Promise<void>

  // Gift Actions
  addGift: (title: string, note?: string, photo?: string, link?: string) => Promise<void>
  deleteGift: (id: string) => Promise<void>
  
  // Prayer Actions
  togglePrayer: (prayer: keyof PrayerLog) => void
  
  // Athkar Actions
  incrementThikrCount: (thikrId: string, maxCount: number) => Promise<void>
  resetAthkarLogs: (ids: string[]) => Promise<void>
  
  // Quran Actions
  updateQuranPage: (page: number) => Promise<void>
  updateQuranTarget: (target: string) => Promise<void>
  
  // Hobby Actions
  addHobby: (hobby: Omit<Hobby, 'id' | 'pair_id'>) => void
  toggleHobbyStep: (hobbyId: string, stepId: string) => void
  addHobbyNote: (hobbyId: string, note: string) => void
  addHobbyPhoto: (hobbyId: string, photoUrl: string) => void
  
  // Watchlist & Bucket actions
  addWatchItem: (item: Omit<WatchItem, 'id' | 'added_by'>) => void
  toggleWatchItem: (id: string) => void
  deleteWatchItem: (id: string) => void
  fetchWatchlist: () => Promise<void>
  completeDailyChallenge: () => void

  // Inner Circle Tree Actions
  addTreeNode: (target: 'me' | 'partner', node: Omit<TreeNode, 'id'>) => void
  deleteTreeNode: (target: 'me' | 'partner', id: string) => void
  fetchTreeNodes: () => Promise<void>
}

// Daily challenge: persist per-day in localStorage
const getTodayKey = () => `daily_challenge_${new Date().toISOString().split('T')[0]}`
const getInitialDailyChallenge = (): boolean => {
  try { return localStorage.getItem(getTodayKey()) === '1' } catch { return false }
}

const getInitialTreeNodes = (target: 'me' | 'partner'): TreeNode[] => {
  try {
    const saved = localStorage.getItem(`tree_nodes_${target}`)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('[MasSync] Error reading tree nodes from localStorage:', e)
  }

  return []
}

// Migration helper: upload existing localStorage nodes to Supabase once
const migrateLocalTreeNodesToDB = async (
  userId: string,
  partnerId: string | null,
  pairId: string,
  token: string,
  supabaseUrl: string,
  supabaseAnonKey: string
) => {
  const targets: Array<{ target: 'me' | 'partner'; ownerId: string }> = [
    { target: 'me', ownerId: userId },
    ...(partnerId ? [{ target: 'partner' as const, ownerId: partnerId }] : [])
  ]

  for (const { target, ownerId } of targets) {
    const key = `tree_nodes_${target}`
    const migrated_key = `tree_nodes_migrated_${target}_${pairId}`
    // Skip if already migrated
    if (localStorage.getItem(migrated_key)) continue

    const saved = localStorage.getItem(key)
    if (!saved) { localStorage.setItem(migrated_key, '1'); continue }

    let nodes: TreeNode[] = []
    try { nodes = JSON.parse(saved) } catch { continue }
    if (!nodes.length) { localStorage.setItem(migrated_key, '1'); continue }

    // Only migrate nodes for yourself (not the partner's — they migrate from their own device)
    if (target !== 'me') { localStorage.setItem(migrated_key, '1'); continue }

    const body = nodes.map(n => ({
      pair_id: pairId,
      owner_id: ownerId,
      name: n.name,
      relationship: n.relationship,
      category: n.category,
      note: n.note || null,
      avatar: n.avatar || null,
    }))

    try {
      await fetch(`${supabaseUrl}/rest/v1/tree_nodes`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates'
        },
        body: JSON.stringify(body)
      })
      localStorage.setItem(migrated_key, '1')
      console.log(`[MasSync] Migrated ${nodes.length} tree nodes for ${target} to Supabase`)
    } catch (e) {
      console.warn('[MasSync] Tree node migration failed:', e)
    }
  }
}

const getDefaultTimeBlocks = (pairId: string, userId: string): TimeBlock[] => {
  return [
    { id: 'preset-1', pair_id: pairId, user_id: userId, title: 'Fajr Prayers', domain: 'spiritual', day: 'Monday', start_time: '05:00', end_time: '05:45', created_by: 'you' },
    { id: 'preset-2', pair_id: pairId, user_id: userId, title: 'Coding MasSync', domain: 'work', day: 'Monday', start_time: '09:00', end_time: '13:00', created_by: 'you' },
    { id: 'preset-3', pair_id: pairId, user_id: userId, title: 'Dhuhr & Lunch', domain: 'spiritual', day: 'Monday', start_time: '13:00', end_time: '14:00', created_by: 'you' },
    { id: 'preset-4', pair_id: pairId, user_id: userId, title: 'Design Session', domain: 'work', day: 'Monday', start_time: '14:00', end_time: '17:00', created_by: 'you' },
    { id: 'preset-5', pair_id: pairId, user_id: userId, title: 'Gym Workout', domain: 'health', day: 'Monday', start_time: '18:00', end_time: '19:30', created_by: 'you' },
    { id: 'preset-6', pair_id: pairId, user_id: userId, title: 'Read Book', domain: 'downtime', day: 'Monday', start_time: '22:00', end_time: '23:00', created_by: 'you' },
    
    { id: 'preset-7', pair_id: pairId, user_id: userId, title: 'Fajr Prayers', domain: 'spiritual', day: 'Tuesday', start_time: '05:00', end_time: '05:45', created_by: 'you' },
    { id: 'preset-8', pair_id: pairId, user_id: userId, title: 'Focus Work', domain: 'work', day: 'Tuesday', start_time: '09:00', end_time: '13:00', created_by: 'you' },
    { id: 'preset-9', pair_id: pairId, user_id: userId, title: 'Dhuhr & Lunch', domain: 'spiritual', day: 'Tuesday', start_time: '13:00', end_time: '14:00', created_by: 'you' },
    { id: 'preset-10', pair_id: pairId, user_id: userId, title: 'Brainstorming', domain: 'work', day: 'Tuesday', start_time: '14:00', end_time: '17:00', created_by: 'you' },
    { id: 'preset-11', pair_id: pairId, user_id: userId, title: 'Evening Run', domain: 'health', day: 'Tuesday', start_time: '19:00', end_time: '20:00', created_by: 'you' },
    { id: 'preset-12', pair_id: pairId, user_id: userId, title: 'Read Book', domain: 'downtime', day: 'Tuesday', start_time: '22:00', end_time: '23:00', created_by: 'you' },

    { id: 'preset-13', pair_id: pairId, user_id: userId, title: 'Fajr Prayers', domain: 'spiritual', day: 'Wednesday', start_time: '05:00', end_time: '05:45', created_by: 'you' },
    { id: 'preset-14', pair_id: pairId, user_id: userId, title: 'Coding Session', domain: 'work', day: 'Wednesday', start_time: '09:00', end_time: '13:00', created_by: 'you' },
    { id: 'preset-15', pair_id: pairId, user_id: userId, title: 'Dhuhr & Lunch', domain: 'spiritual', day: 'Wednesday', start_time: '13:00', end_time: '14:00', created_by: 'you' },
    { id: 'preset-16', pair_id: pairId, user_id: userId, title: 'Sprint Planning', domain: 'work', day: 'Wednesday', start_time: '14:00', end_time: '17:00', created_by: 'you' },
    { id: 'preset-17', pair_id: pairId, user_id: userId, title: 'Gym Workout', domain: 'health', day: 'Wednesday', start_time: '18:00', end_time: '19:30', created_by: 'you' },
    { id: 'preset-18', pair_id: pairId, user_id: userId, title: 'Relax & Podcast', domain: 'downtime', day: 'Wednesday', start_time: '22:00', end_time: '23:00', created_by: 'you' },

    { id: 'preset-19', pair_id: pairId, user_id: userId, title: 'Fajr Prayers', domain: 'spiritual', day: 'Thursday', start_time: '05:00', end_time: '05:45', created_by: 'you' },
    { id: 'preset-20', pair_id: pairId, user_id: userId, title: 'Focus Work', domain: 'work', day: 'Thursday', start_time: '09:00', end_time: '13:00', created_by: 'you' },
    { id: 'preset-21', pair_id: pairId, user_id: userId, title: 'Dhuhr & Lunch', domain: 'spiritual', day: 'Thursday', start_time: '13:00', end_time: '14:00', created_by: 'you' },
    { id: 'preset-22', pair_id: pairId, user_id: userId, title: 'Retrospective', domain: 'work', day: 'Thursday', start_time: '14:00', end_time: '17:00', created_by: 'you' },
    { id: 'preset-23', pair_id: pairId, user_id: userId, title: 'Read Book', domain: 'downtime', day: 'Thursday', start_time: '22:00', end_time: '23:00', created_by: 'you' },

    { id: 'preset-24', pair_id: pairId, user_id: userId, title: 'Fajr Prayers', domain: 'spiritual', day: 'Friday', start_time: '05:00', end_time: '05:45', created_by: 'you' },
    { id: 'preset-25', pair_id: pairId, user_id: userId, title: 'Morning Focus', domain: 'work', day: 'Friday', start_time: '09:00', end_time: '12:00', created_by: 'you' },
    { id: 'preset-26', pair_id: pairId, user_id: userId, title: 'Friday Prayer', domain: 'spiritual', day: 'Friday', start_time: '12:00', end_time: '13:30', created_by: 'you' },
    { id: 'preset-27', pair_id: pairId, user_id: userId, title: 'Creative Coding', domain: 'work', day: 'Friday', start_time: '14:30', end_time: '17:00', created_by: 'you' },
    { id: 'preset-28', pair_id: pairId, user_id: userId, title: 'Gym Workout', domain: 'health', day: 'Friday', start_time: '18:00', end_time: '19:30', created_by: 'you' },
    { id: 'preset-29', pair_id: pairId, user_id: userId, title: 'Movie Night', domain: 'downtime', day: 'Friday', start_time: '22:00', end_time: '23:30', created_by: 'you' },

    { id: 'preset-30', pair_id: pairId, user_id: userId, title: 'Fajr Prayers', domain: 'spiritual', day: 'Saturday', start_time: '05:00', end_time: '05:45', created_by: 'you' },
    { id: 'preset-31', pair_id: pairId, user_id: userId, title: 'Cardio Workout', domain: 'health', day: 'Saturday', start_time: '10:00', end_time: '11:30', created_by: 'you' },
    { id: 'preset-32', pair_id: pairId, user_id: userId, title: 'Argentina vs France', domain: 'matches', day: 'Saturday', start_time: '16:00', end_time: '18:00', details: 'World Cup Match: Watching live together! 🏆⚽', created_by: 'you' },
    { id: 'preset-33', pair_id: pairId, user_id: userId, title: 'Dinner Outing', domain: 'downtime', day: 'Saturday', start_time: '19:00', end_time: '21:00', created_by: 'you' },

    { id: 'preset-34', pair_id: pairId, user_id: userId, title: 'Fajr Prayers', domain: 'spiritual', day: 'Sunday', start_time: '05:00', end_time: '05:45', created_by: 'you' },
    { id: 'preset-35', pair_id: pairId, user_id: userId, title: 'Weekly Planning', domain: 'work', day: 'Sunday', start_time: '11:00', end_time: '13:00', created_by: 'you' },
    { id: 'preset-36', pair_id: pairId, user_id: userId, title: 'Real Madrid vs Barcelona', domain: 'matches', day: 'Sunday', start_time: '20:00', end_time: '22:00', details: 'El Clásico match: Watching with snacks! 🍿⚽', created_by: 'you' }
  ]
}

export const useAppStore = create<AppState>((set, get) => ({
  // Default values
  user: getInitialUser(),
  authInitialized: false,
  pairId: null,
  partnerId: null,
  inviteCode: '',
  partnerInviteCode: '',
  pairStatus: 'pending',
  userName: '',
  partnerName: '',
  userCity: '',
  partnerCity: '',
  userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  friendshipDuration: 'Friends for 2 years',
  userVibe: '',
  partnerVibe: '',
  dbError: null,
  onlineUsers: [],
  partnerLastSeen: null,

  tasks: [],
  taskCompletions: [],

  memories: [],
  timeBlocks: [],

  songs: [],

  myPrayers: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  },

  partnerPrayers: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  },

  myAthkar: {},
  partnerAthkar: {},

  hobbies: [],

  watchlist: [],
  userQuranPage: 1,
  partnerQuranPage: 1,
  quranTarget: 'Finish Al-Baqarah by Sunday',

  dailyChallengeDone: getInitialDailyChallenge(),
  toasts: [],

  myTreeNodes: getInitialTreeNodes('me'),
  partnerTreeNodes: getInitialTreeNodes('partner'),

  showToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  // Setters
  setUser: (user) => set({ user }),
  setPairId: (pairId) => set({ pairId }),
  setPairStatus: (pairStatus) => set({ pairStatus }),
  setInviteCode: (inviteCode) => set({ inviteCode }),
  
  updateProfile: async (data) => {
    const user = get().user
    if (!user) return

    set({ dbError: null })
    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const payload: any = {}
      if (data.userName !== undefined) payload.display_name = data.userName
      if (data.userCity !== undefined) payload.city = data.userCity
      if (data.userAvatar !== undefined) payload.avatar_url = data.userAvatar
      if (data.vibeStatus !== undefined) payload.vibe_status = data.vibeStatus

      const res = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        // Graceful fallback if vibe_status column doesn't exist yet in the database
        if (errText.includes('vibe_status') || errText.includes('column') || res.status === 400) {
          console.warn('[MasSync] vibe_status column missing from DB. Storing vibe status locally.')
          const retryPayload = { ...payload }
          delete retryPayload.vibe_status

          const retryRes = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${user.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(retryPayload)
            }
          )

          if (!retryRes.ok) {
            throw new Error(await retryRes.text())
          }

          if (data.vibeStatus !== undefined) {
            localStorage.setItem(`vibe_status_${user.id}`, data.vibeStatus)
          }
        } else {
          throw new Error(errText)
        }
      }

      set((state) => ({
        userName: data.userName !== undefined ? data.userName : state.userName,
        userCity: data.userCity !== undefined ? data.userCity : state.userCity,
        userAvatar: data.userAvatar !== undefined ? data.userAvatar : state.userAvatar,
        userVibe: data.vibeStatus !== undefined ? data.vibeStatus : state.userVibe,
      }))
    } catch (err: any) {
      console.error('[MasSync] Error updating profile:', err)
      set({ dbError: `Error updating profile: ${err.message}` })
      
      // Fallback update in state anyway
      set((state) => ({
        userName: data.userName !== undefined ? data.userName : state.userName,
        userCity: data.userCity !== undefined ? data.userCity : state.userCity,
        userAvatar: data.userAvatar !== undefined ? data.userAvatar : state.userAvatar,
        userVibe: data.vibeStatus !== undefined ? data.vibeStatus : state.userVibe,
      }))
    }
  },

  uploadAvatar: async (file: File) => {
    const user = get().user
    if (!user) throw new Error('Not authenticated')

    set({ dbError: null })
    try {
      const ext = file.name.split('.').pop() || 'png'
      const filePath = `${user.id}/avatar-${Date.now()}.${ext}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      const publicUrl = urlData.publicUrl

      // Update profile
      await get().updateProfile({ userAvatar: publicUrl })
      return publicUrl
    } catch (err: any) {
      console.warn('[MasSync] Supabase Storage upload failed, falling back to Base64:', err)
      
      // Fallback: Read file as Base64 data URL
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          try {
            const base64Url = reader.result as string
            await get().updateProfile({ userAvatar: base64Url })
            resolve(base64Url)
          } catch (updateErr: any) {
            reject(updateErr)
          }
        }
        reader.onerror = () => {
          reject(new Error('Failed to read image file'))
        }
      })
    }
  },

  uploadMemoryPhoto: async (file: File) => {
    const user = get().user
    const pairId = get().pairId || 'temp'
    if (!user) throw new Error('Not authenticated')

    set({ dbError: null })
    try {
      const ext = file.name.split('.').pop() || 'png'
      const filePath = `${pairId}/memory-${Date.now()}.${ext}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('memories')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('memories')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (err: any) {
      console.warn('[MasSync] Supabase Storage upload for memory photo failed, falling back to Base64:', err)
      
      // Fallback: Read file as Base64 data URL
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
          } else {
            reject(new Error('Failed to convert file to base64'))
          }
        }
        reader.onerror = () => {
          reject(new Error('Failed to read image file'))
        }
      })
    }
  },

  changeEmail: async (newEmail) => {
    set({ dbError: null })
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
    } catch (err: any) {
      console.error('[MasSync] Error updating email:', err)
      set({ dbError: `Error updating email: ${err.message}` })
      throw err
    }
  },

  updateFriendshipDate: async (dateStr) => {
    const pairId = get().pairId
    if (!pairId) return

    set({ dbError: null })
    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(
        `${supabaseUrl}/rest/v1/pairs?id=eq.${pairId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ friends_since: dateStr })
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        // If friends_since column doesn't exist, store it locally and fallback
        if (errText.includes('friends_since') || errText.includes('column') || res.status === 400) {
          console.warn('[MasSync] friends_since column missing from DB. Storing friendship date locally.')
          localStorage.setItem(`friends_since_${pairId}`, dateStr)
        } else {
          throw new Error(errText)
        }
      }

      set({
        friendshipDuration: getFriendshipDurationStr(dateStr)
      })
      localStorage.setItem(`friends_since_${pairId}`, dateStr)
    } catch (err: any) {
      console.error('[MasSync] Error updating friendship date:', err)
      set({ dbError: `Error updating friendship anniversary: ${err.message}` })
      
      // Fallback update in state anyway
      set({
        friendshipDuration: getFriendshipDurationStr(dateStr)
      })
      localStorage.setItem(`friends_since_${pairId}`, dateStr)
    }
  },

  // Tasks actions
  addTask: async (task) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return
    
    const tempId = `temp-task-${Date.now()}`
    const newTask: Task = {
      ...task,
      id: tempId,
      pair_id: pairId,
      created_by: 'you',
      is_done: false,
    }
    set((state) => ({ tasks: [newTask, ...state.tasks] }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          created_by: userId,
          title: task.title,
          description: task.description || null,
          category: task.category,
          recurrence: task.recurrence,
          date: task.date,
          is_done: false
        })
      })
      if (res.ok) {
        const inserted = await res.json()
        const dbTask = inserted[0]
        if (dbTask) {
          set((state) => ({
            tasks: state.tasks.map((t) => t.id === tempId ? {
              ...t,
              id: dbTask.id,
              created_by: dbTask.created_by === userId ? 'you' : 'partner'
            } : t)
          }))
        }
        get().showToast('Task added ✓', 'success')
      }
    } catch (e) {
      console.error('[MasSync] Error adding task to DB:', e)
      get().showToast('Failed to add task', 'error')
    }
  },

  toggleTask: async (id) => {
    const userId = get().user?.id
    if (!userId) return

    let wasDone = false
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === id) {
          wasDone = !t.is_done
          return {
            ...t,
            is_done: wasDone,
            done_by: wasDone ? 'you' : undefined,
            done_at: wasDone ? new Date().toISOString() : undefined,
          }
        }
        return t
      })
    }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_done: wasDone,
          done_by: wasDone ? userId : null,
          done_at: wasDone ? new Date().toISOString() : null,
        })
      })
    } catch (e) {
      console.error('[MasSync] Error toggling task in DB:', e)
    }
  },

  deleteTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
    get().showToast('Task deleted', 'info')

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        }
      })
    } catch (e) {
      console.error('[MasSync] Error deleting task in DB:', e)
    }
  },

  sendTaskReminder: async (taskTitle: string) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const userName = get().userName || 'Your partner'
      await fetch(`${supabaseUrl}/rest/v1/reminders`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pair_id: pairId,
          created_by: userId,
          title: 'Task Reminder 🔔',
          message: `${userName} wants you to complete the task: "${taskTitle}"! ✨`
        })
      })
      get().showToast(`Sent reminder for "${taskTitle}"! 📲`, 'success')
    } catch (e) {
      console.error('[MasSync] Error sending task reminder:', e)
      get().showToast('Failed to send reminder', 'error')
    }
  },

  // ── Task Completions (recurring tasks weekly tracking) ───────────────────

  fetchTaskCompletions: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    // ISO week key: YYYY-Www
    const now = new Date()
    const jan1 = new Date(now.getFullYear(), 0, 1)
    const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    const weekKey = `${now.getFullYear()}-W${week}`

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(
        `${supabaseUrl}/rest/v1/task_completions?pair_id=eq.${pairId}&week_key=eq.${weekKey}&order=created_at.asc`,
        { headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        const completions: import('./useAppStore').TaskCompletion[] = data.map((r: any) => ({
          id: r.id,
          task_id: r.task_id,
          completed_by: r.completed_by === userId ? 'you' : 'partner',
          week_key: r.week_key,
        }))
        set({ taskCompletions: completions })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching task completions:', e)
    }
  },

  addTaskCompletion: async (taskId) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const now = new Date()
    const jan1 = new Date(now.getFullYear(), 0, 1)
    const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    const weekKey = `${now.getFullYear()}-W${week}`

    // Optimistic update
    const tempId = `tc-temp-${Date.now()}`
    set((state) => ({
      taskCompletions: [
        ...state.taskCompletions,
        { id: tempId, task_id: taskId, completed_by: 'you', week_key: weekKey }
      ]
    }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/task_completions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          task_id: taskId,
          pair_id: pairId,
          completed_by: userId,
          week_key: weekKey
        })
      })
      if (res.ok) {
        const inserted = await res.json()
        const dbRow = inserted[0]
        if (dbRow) {
          set((state) => ({
            taskCompletions: state.taskCompletions.map((c) =>
              c.id === tempId ? { ...c, id: dbRow.id } : c
            )
          }))
        }
      } else {
        // revert optimistic
        set((state) => ({ taskCompletions: state.taskCompletions.filter((c) => c.id !== tempId) }))
      }
    } catch (e) {
      console.error('[MasSync] Error adding task completion:', e)
      set((state) => ({ taskCompletions: state.taskCompletions.filter((c) => c.id !== tempId) }))
    }
  },

  removeTaskCompletion: async (completionId) => {
    // Optimistic remove
    set((state) => ({
      taskCompletions: state.taskCompletions.filter((c) => c.id !== completionId)
    }))

    if (completionId.startsWith('tc-temp-')) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/task_completions?id=eq.${completionId}`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })
    } catch (e) {
      console.error('[MasSync] Error removing task completion:', e)
    }
  },

  // Memories actions
  addMemory: async (memory) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const tempId = `temp-mem-${Date.now()}`
    const newMemory: Memory = {
      ...memory,
      id: tempId,
      pair_id: pairId,
      created_by: 'you',
      type: 'memory',
    }
    set((state) => ({ memories: [newMemory, ...state.memories] }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      let res = await fetch(`${supabaseUrl}/rest/v1/memories`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          created_by: userId,
          date: memory.date,
          title: memory.title,
          note: memory.note,
          mood_emoji: memory.mood_emoji,
          tags: memory.tags,
          photo: memory.photo,
          photos: memory.photos || [],
          type: 'memory'
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        console.warn('[MasSync] Failed to insert memory, checking for photos column issue:', errText)
        
        if (errText.includes('photos') || errText.includes('column') || res.status === 400) {
          console.warn('[MasSync] Retrying memory insert without the "photos" column...')
          res = await fetch(`${supabaseUrl}/rest/v1/memories`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              pair_id: pairId,
              created_by: userId,
              date: memory.date,
              title: memory.title,
              note: memory.note,
              mood_emoji: memory.mood_emoji,
              tags: memory.tags,
              photo: memory.photo,
              type: 'memory'
            })
          })
          
          if (!res.ok) {
            throw new Error(await res.text())
          }
          
          get().showToast('Saved memory! (Note: Run add_memories_photos_column.sql in Supabase to support multiple photos)', 'info')
        } else {
          throw new Error(errText)
        }
      }

      const inserted = await res.json()
      if (inserted[0]) {
        set((state) => ({
          memories: state.memories.map((m) => m.id === tempId ? {
            ...m,
            id: inserted[0].id
          } : m)
        }))
        get().showToast('Memory added! 📸', 'success')
      }
    } catch (e: any) {
      console.error('[MasSync] Error adding memory to DB:', e)
      set((state) => ({ memories: state.memories.filter((m) => m.id !== tempId) }))
      get().showToast(`Failed to save memory: ${e.message || e}`, 'error')
    }
  },

  addOuting: async (outing) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const tempId = `temp-outing-${Date.now()}`
    const newOuting: Memory = {
      ...outing,
      id: tempId,
      pair_id: pairId,
      created_by: 'you',
      type: 'outing',
    }
    set((state) => ({ memories: [newOuting, ...state.memories] }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/memories`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          created_by: userId,
          date: outing.date,
          title: outing.title,
          type: 'outing',
          time: outing.time,
          place: outing.place,
          vibe: outing.vibe,
          location_url: outing.location_url,
          page_url: outing.page_url,
          mood_emoji: 'coffee'
        })
      })
      if (res.ok) {
        const inserted = await res.json()
        if (inserted[0]) {
          set((state) => ({
            memories: state.memories.map((m) => m.id === tempId ? {
              ...m,
              id: inserted[0].id
            } : m)
          }))
        }
      }
    } catch (e) {
      console.error('[MasSync] Error adding outing to DB:', e)
    }
  },

  deleteMemory: async (id) => {
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }))
    get().showToast('Item deleted', 'info')

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/memories?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        }
      })
    } catch (e) {
      console.error('[MasSync] Error deleting memory from DB:', e)
    }
  },

  // Songs actions
  giftSong: async (song) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const tempId = `temp-song-${Date.now()}`
    const newSong: Song = {
      ...song,
      id: tempId,
      pair_id: pairId,
      gifted_by: 'you',
      gifted_at: new Date().toISOString().split('T')[0],
    }
    set((state) => ({ songs: [newSong, ...state.songs] }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/songs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          gifted_by: userId,
          title: song.title,
          artist: song.artist,
          message: song.message,
          gifted_at: new Date().toISOString().split('T')[0]
        })
      })
      if (res.ok) {
        const inserted = await res.json()
        if (inserted[0]) {
          set((state) => ({
            songs: state.songs.map((s) => s.id === tempId ? {
              ...s,
              id: inserted[0].id
            } : s)
          }))
        }
        get().showToast('Song gifted 🎵', 'success')
      }
    } catch (e) {
      console.error('[MasSync] Error gifting song:', e)
      get().showToast('Failed to gift song', 'error')
    }
  },

  updateSongRating: async (songId: string, rating: number) => {
    // Update local state first for instant responsiveness
    set((state) => ({
      songs: state.songs.map((s) => s.id === songId ? { ...s, rating } : s)
    }))

    const song = get().songs.find((s) => s.id === songId)
    const songTitle = song ? song.title : 'a song'
    const userName = get().userName || 'Your partner'
    const pairId = get().pairId
    const userId = get().user?.id

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/songs?id=eq.${songId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ rating })
      })
      if (res.ok) {
        get().showToast('Song rated! ⭐', 'success')
        
        // Notify partner via reminders table insert
        if (pairId && userId) {
          await fetch(`${supabaseUrl}/rest/v1/reminders`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pair_id: pairId,
              created_by: userId,
              title: 'Song Rated! 🎵',
              message: `${userName} rated the song "${songTitle}" ${rating}/5 stars! ⭐`
            })
          }).catch(err => console.error('[MasSync] Error sending rating notification:', err))
        }
      }
    } catch (e) {
      console.error('[MasSync] Error rating song:', e)
      get().showToast('Failed to save rating', 'error')
    }
  },

  addGift: async (title: string, note?: string, photo?: string, link?: string) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const tempId = `temp-gift-${Date.now()}`
    const newGift: Memory = {
      id: tempId,
      pair_id: pairId,
      created_by: 'you',
      date: new Date().toISOString().split('T')[0],
      title: title,
      note: note,
      photo: photo,
      page_url: link,
      mood_emoji: 'gift',
      tags: ['gift'],
      type: 'gift'
    }
    set((state) => ({ memories: [newGift, ...state.memories] }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/memories`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          created_by: userId,
          date: new Date().toISOString().split('T')[0],
          title: title,
          note: note,
          photo: photo,
          page_url: link,
          mood_emoji: 'gift',
          tags: ['gift'],
          type: 'gift'
        })
      })
      if (res.ok) {
        const inserted = await res.json()
        if (inserted[0]) {
          set((state) => ({
            memories: state.memories.map((m) => m.id === tempId ? {
              ...m,
              id: inserted[0].id
            } : m)
          }))
        }
        get().showToast('Gift idea saved 🎁', 'success')
      }
    } catch (e) {
      console.error('[MasSync] Error adding gift to DB:', e)
      get().showToast('Failed to save gift idea', 'error')
    }
  },

  deleteGift: async (id: string) => {
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }))
    get().showToast('Gift idea removed', 'info')

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/memories?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        }
      })
    } catch (e) {
      console.error('[MasSync] Error deleting gift from DB:', e)
    }
  },

  // Prayer actions
  togglePrayer: async (prayer) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    let updatedPrayers = { ...get().myPrayers }
    updatedPrayers[prayer] = !updatedPrayers[prayer]

    set({ myPrayers: updatedPrayers })

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const todayStr = new Date().toISOString().split('T')[0]
      const res = await fetch(`${supabaseUrl}/rest/v1/prayer_logs?on_conflict=user_id,date`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          pair_id: pairId,
          user_id: userId,
          date: todayStr,
          fajr: updatedPrayers.fajr,
          dhuhr: updatedPrayers.dhuhr,
          asr: updatedPrayers.asr,
          maghrib: updatedPrayers.maghrib,
          isha: updatedPrayers.isha
        })
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } catch (e) {
      console.error('[MasSync] Error updating prayers in DB:', e)
      // Revert state if failed
      set({ myPrayers: get().myPrayers })
    }
  },

  // Athkar actions
  incrementThikrCount: async (thikrId, maxCount) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const currentCount = get().myAthkar[thikrId] || 0
    if (currentCount >= maxCount) return

    const newCount = currentCount + 1
    const updatedAthkar = { ...get().myAthkar, [thikrId]: newCount }

    set({ myAthkar: updatedAthkar })

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const todayStr = new Date().toISOString().split('T')[0]
      const res = await fetch(`${supabaseUrl}/rest/v1/athkar_logs?on_conflict=user_id,date,thikr_id`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          pair_id: pairId,
          user_id: userId,
          date: todayStr,
          thikr_id: thikrId,
          current_count: newCount
        })
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } catch (e) {
      console.error('[MasSync] Error updating Athkar count in DB:', e)
      // Revert count if failed
      set({ myAthkar: get().myAthkar })
    }
  },

  resetAthkarLogs: async (ids) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const updatedAthkar = { ...get().myAthkar }
    ids.forEach((id) => {
      updatedAthkar[id] = 0
    })
    set({ myAthkar: updatedAthkar })

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const todayStr = new Date().toISOString().split('T')[0]
      const body = ids.map((id) => ({
        pair_id: pairId,
        user_id: userId,
        date: todayStr,
        thikr_id: id,
        current_count: 0
      }))

      const res = await fetch(`${supabaseUrl}/rest/v1/athkar_logs?on_conflict=user_id,date,thikr_id`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } catch (e) {
      console.error('[MasSync] Error resetting Athkar logs in DB:', e)
      // Revert state if failed
      set({ myAthkar: get().myAthkar })
    }
  },

  // Hobbies actions
  addHobby: async (hobby) => {
    const pairId = get().pairId
    if (!pairId) return

    const tempId = `temp-hobby-${Date.now()}`
    const newHobby: Hobby = {
      ...hobby,
      id: tempId,
      pair_id: pairId,
    }
    set((state) => ({ hobbies: [...state.hobbies, newHobby] }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/hobbies`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          name: hobby.name,
          description: hobby.description,
          cover_image: hobby.cover_image,
          start_date: hobby.start_date,
          goal_date: hobby.goal_date,
          status: hobby.status,
          steps: hobby.steps,
          notes: hobby.notes,
          photos: hobby.photos
        })
      })
      if (res.ok) {
        const inserted = await res.json()
        if (inserted[0]) {
          set((state) => ({
            hobbies: state.hobbies.map((h) => h.id === tempId ? {
              ...h,
              id: inserted[0].id
            } : h)
          }))
        }
      }
    } catch (e) {
      console.error('[MasSync] Error adding hobby to DB:', e)
    }
  },

  toggleHobbyStep: async (hobbyId, stepId) => {
    let updatedHobby: Hobby | null = null
    set((state) => {
      const updatedHobbies = state.hobbies.map((h) => {
        if (h.id === hobbyId) {
          const next = {
            ...h,
            steps: h.steps.map((s) => (s.id === stepId ? { ...s, is_done: !s.is_done } : s)),
          }
          updatedHobby = next
          return next
        }
        return h
      })
      return { hobbies: updatedHobbies }
    })

    if (!updatedHobby) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/hobbies?id=eq.${hobbyId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps: (updatedHobby as Hobby).steps
        })
      })
    } catch (e) {
      console.error('[MasSync] Error toggling hobby step in DB:', e)
    }
  },

  addHobbyNote: async (hobbyId, note) => {
    let updatedHobby: Hobby | null = null
    set((state) => {
      const updatedHobbies = state.hobbies.map((h) => {
        if (h.id === hobbyId) {
          const next = {
            ...h,
            notes: [...h.notes, note],
          }
          updatedHobby = next
          return next
        }
        return h
      })
      return { hobbies: updatedHobbies }
    })

    if (!updatedHobby) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/hobbies?id=eq.${hobbyId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: (updatedHobby as Hobby).notes
        })
      })
    } catch (e) {
      console.error('[MasSync] Error adding hobby note to DB:', e)
    }
  },

  addHobbyPhoto: async (hobbyId, photoUrl) => {
    let updatedHobby: Hobby | null = null
    set((state) => {
      const updatedHobbies = state.hobbies.map((h) => {
        if (h.id === hobbyId) {
          const next = {
            ...h,
            photos: [...h.photos, photoUrl],
          }
          updatedHobby = next
          return next
        }
        return h
      })
      return { hobbies: updatedHobbies }
    })

    if (!updatedHobby) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/hobbies?id=eq.${hobbyId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: (updatedHobby as Hobby).photos
        })
      })
    } catch (e) {
      console.error('[MasSync] Error adding hobby photo to DB:', e)
    }
  },

  // Watchlist actions
  addWatchItem: async (item) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const tempId = `watch-temp-${Date.now()}`
    const newItem: WatchItem = {
      ...item,
      id: tempId,
      added_by: 'you',
    }
    set((state) => ({ watchlist: [newItem, ...state.watchlist] }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/watchlist`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          added_by: userId,
          type: item.type,
          title: item.title,
          category: item.category,
          status: item.status,
          rating: item.rating || null,
          priority: item.priority || null,
        })
      })

      if (res.ok) {
        const inserted = await res.json()
        const dbItem = inserted[0]
        if (dbItem) {
          set((state) => ({
            watchlist: state.watchlist.map((w) =>
              w.id === tempId ? { ...w, id: dbItem.id } : w
            )
          }))
        }
      } else {
        const errText = await res.text()
        console.error('[MasSync] Error adding watch item to DB:', errText)
        set((state) => ({ watchlist: state.watchlist.filter((w) => w.id !== tempId) }))
        get().showToast('Failed to add item', 'error')
      }
    } catch (e) {
      console.error('[MasSync] Error adding watch item:', e)
    }
  },

  toggleWatchItem: async (id) => {
    let newStatus: WatchItem['status'] = 'Pending'
    set((state) => ({
      watchlist: state.watchlist.map((w) => {
        if (w.id === id) {
          newStatus = w.status === 'Want to Watch' ? 'Watching'
            : w.status === 'Watching' ? 'Done'
            : w.status === 'Pending' ? 'Completed'
            : w.type === 'watch' ? 'Want to Watch' : 'Pending'
          return { ...w, status: newStatus }
        }
        return w
      })
    }))

    if (id.startsWith('watch-temp-')) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/watchlist?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (e) {
      console.error('[MasSync] Error toggling watch item:', e)
    }
  },

  deleteWatchItem: async (id) => {
    set((state) => ({ watchlist: state.watchlist.filter((w) => w.id !== id) }))
    get().showToast('Item removed', 'info')

    if (id.startsWith('watch-temp-')) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/watchlist?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        }
      })
    } catch (e) {
      console.error('[MasSync] Error deleting watch item:', e)
    }
  },

  fetchWatchlist: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/watchlist?pair_id=eq.${pairId}&order=created_at.desc`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        const mapped: WatchItem[] = data.map((w: any) => ({
          id: w.id,
          type: w.type,
          title: w.title,
          category: w.category,
          status: w.status,
          added_by: w.added_by === userId ? 'you' : 'partner',
          rating: w.rating || undefined,
          priority: w.priority || undefined,
        }))
        set({ watchlist: mapped })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching watchlist:', e)
    }
  },

  completeDailyChallenge: () => {
    try { localStorage.setItem(getTodayKey(), '1') } catch {}
    set({ dailyChallengeDone: true })
  },

  updateQuranPage: async (page: number) => {
    const user = get().user
    if (!user) return

    set({ userQuranPage: page })

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quran_page: page })
        }
      )

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } catch (e) {
      console.error('[MasSync] Error updating quran_page in DB:', e)
    }
  },

  updateQuranTarget: async (target: string) => {
    const pairId = get().pairId
    if (!pairId) return

    set({ quranTarget: target })

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(
        `${supabaseUrl}/rest/v1/pairs?id=eq.${pairId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quran_target: target })
        }
      )

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } catch (e) {
      console.error('[MasSync] Error updating quran_target in DB:', e)
    }
  },

  addTreeNode: async (target, node) => {
    const pairId = get().pairId
    const userId = get().user?.id
    const partnerId = get().partnerId
    if (!pairId || !userId) return

    // owner_id: if adding to my tree, use my userId; if adding to partner's tree, use partnerId
    const ownerId = target === 'me' ? userId : (partnerId || userId)

    const tempId = `tnode-temp-${Date.now()}`
    const newNode: TreeNode = { ...node, id: tempId }
    set((state) => ({
      myTreeNodes: target === 'me' ? [...state.myTreeNodes, newNode] : state.myTreeNodes,
      partnerTreeNodes: target === 'partner' ? [...state.partnerTreeNodes, newNode] : state.partnerTreeNodes,
    }))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/tree_nodes`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          owner_id: ownerId,
          name: node.name,
          relationship: node.relationship,
          category: node.category,
          note: node.note || null,
          avatar: node.avatar || null,
        })
      })

      if (res.ok) {
        const inserted = await res.json()
        const dbNode = inserted[0]
        if (dbNode) {
          set((state) => ({
            myTreeNodes: target === 'me'
              ? state.myTreeNodes.map((n) => n.id === tempId ? { ...n, id: dbNode.id } : n)
              : state.myTreeNodes,
            partnerTreeNodes: target === 'partner'
              ? state.partnerTreeNodes.map((n) => n.id === tempId ? { ...n, id: dbNode.id } : n)
              : state.partnerTreeNodes,
          }))
        }
        get().showToast('Connection added ✓', 'success')
      } else {
        const errText = await res.text()
        console.error('[MasSync] Error adding tree node to DB:', errText)
        // Fallback: revert optimistic update
        set((state) => ({
          myTreeNodes: target === 'me' ? state.myTreeNodes.filter(n => n.id !== tempId) : state.myTreeNodes,
          partnerTreeNodes: target === 'partner' ? state.partnerTreeNodes.filter(n => n.id !== tempId) : state.partnerTreeNodes,
        }))
        get().showToast('Failed to save connection', 'error')
      }
    } catch (e) {
      console.error('[MasSync] Error adding tree node:', e)
      get().showToast('Failed to save connection', 'error')
    }
  },

  deleteTreeNode: async (target, id) => {
    // Optimistic: remove from state
    set((state) => ({
      myTreeNodes: target === 'me' ? state.myTreeNodes.filter(n => n.id !== id) : state.myTreeNodes,
      partnerTreeNodes: target === 'partner' ? state.partnerTreeNodes.filter(n => n.id !== id) : state.partnerTreeNodes,
    }))

    // Skip DB delete for temp IDs that never made it to DB
    if (id.startsWith('tnode-temp-')) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(`${supabaseUrl}/rest/v1/tree_nodes?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        }
      })
      get().showToast('Connection removed', 'info')
    } catch (e) {
      console.error('[MasSync] Error deleting tree node:', e)
    }
  },

  fetchTreeNodes: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    const partnerId = get().partnerId
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/tree_nodes?pair_id=eq.${pairId}&order=created_at.asc`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        const myNodes: TreeNode[] = []
        const partnerNodes: TreeNode[] = []

        data.forEach((row: any) => {
          const node: TreeNode = {
            id: row.id,
            name: row.name,
            relationship: row.relationship,
            category: row.category,
            note: row.note || undefined,
            avatar: row.avatar || undefined,
          }
          if (row.owner_id === userId) {
            myNodes.push(node)
          } else if (row.owner_id === partnerId) {
            partnerNodes.push(node)
          }
        })

        set({ myTreeNodes: myNodes, partnerTreeNodes: partnerNodes })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching tree nodes:', e)
    }
  },

  // Auth & Pairing Actions Implementation
  initAuth: () => {
    // Check session on mount with a safety timeout of 5 seconds to prevent getting stuck on loading screen
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))

    Promise.race([sessionPromise, timeoutPromise]).then((result) => {
      if (result === null) {
        console.warn('[MasSync] initAuth session check timed out, keeping local session.')
        const localUser = get().user
        set({ authInitialized: true })
        if (localUser) {
          const meta = localUser.user_metadata || {}
          set({
            userName: meta.display_name || 'You',
            userCity: meta.city || 'Earth',
          })
          get().fetchProfileAndPartner(localUser.id)
          get().subscribeToRealtime()
        }
        return
      }

      const session = (result && typeof result === 'object' && 'data' in result) ? (result as any).data?.session : null
      const user = session?.user || null
      
      if (user) {
        const meta = user.user_metadata || {}
        set({
          user,
          authInitialized: true,
          userName: meta.display_name || 'You',
          userCity: meta.city || 'Earth',
        })
        get().fetchProfileAndPartner(user.id, session?.access_token)
        get().subscribeToRealtime()
      } else {
        set({ user: null, authInitialized: true })
      }
    }).catch((err) => {
      console.error('[MasSync] initAuth session error:', err)
      set({ authInitialized: true })
    })

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null
      
      if (user) {
        const meta = user.user_metadata || {}
        set({
          user,
          authInitialized: true,
          userName: meta.display_name || 'You',
          userCity: meta.city || 'Earth',
        })
        await get().fetchProfileAndPartner(user.id, session?.access_token)
        get().subscribeToRealtime()
      } else {
        get().unsubscribeFromRealtime()
        set({
          user: null,
          pairId: null,
          inviteCode: '',
          pairStatus: 'pending',
          userName: '',
          partnerName: '',
          userCity: '',
          partnerCity: '',
          dbError: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
      get().unsubscribeFromRealtime()
    }
  },

  fetchProfileAndPartner: async (userId: string, customToken?: string) => {
    set({ dbError: null })
    console.log('[MasSync] fetchProfileAndPartner called for userId:', userId)
    try {
      let token = customToken
      if (!token) {
        const sessionResult = await supabase.auth.getSession()
        token = sessionResult.data.session?.access_token
      }

      if (!token) {
        console.warn('[MasSync] No auth token available, skipping profile fetch')
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=*&limit=1`,
        {
          signal: controller.signal,
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )
      clearTimeout(timeoutId)

      console.log('[MasSync] profile fetch status:', res.status)

      if (!res.ok) {
        const errText = await res.text()
        console.error('[MasSync] profile fetch error:', errText)
        set({ dbError: `Error loading profile (${res.status}): ${errText}` })
        return
      }

      const rows: any[] = await res.json()
      console.log('[MasSync] profile rows:', rows)

      let profile = rows[0] || null

      // No profile row found — create one as fallback
      if (!profile) {
        console.log('[MasSync] No profile found, inserting fallback...')
        const invite_code = 'MAS-' + Math.random().toString(36).substring(2, 6).toUpperCase()
        const insertRes = await fetch(
          `${supabaseUrl}/rest/v1/users`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              id: userId,
              email: get().user?.email || '',
              display_name: get().user?.user_metadata?.display_name || 'You',
              city: get().user?.user_metadata?.city || 'Amman, JO',
              invite_code,
            }),
          }
        )
        
        if (!insertRes.ok) {
          const insertErrText = await insertRes.text()
          console.error('[MasSync] fallback insert error:', insertErrText)
          set({ dbError: `Could not create user profile (${insertRes.status}): ${insertErrText}` })
          return
        }

        const insertedRows: any[] = await insertRes.json()
        console.log('[MasSync] fallback insert result:', insertedRows)
        profile = insertedRows[0] || null

        if (!profile) {
          set({ dbError: 'Could not create user profile. Please check Supabase RLS policies.' })
          return
        }
      }

      const localVibe = localStorage.getItem(`vibe_status_${userId}`) || ''

      set({
        userName: profile.display_name || 'You',
        userCity: profile.city || '',
        inviteCode: profile.invite_code || '',
        pairId: profile.pair_id || null,
        userAvatar: profile.avatar_url || '',
        userVibe: profile.vibe_status !== undefined && profile.vibe_status !== null ? profile.vibe_status : localVibe,
        userQuranPage: profile.quran_page || 1,
        dbError: null,
      })

      if (profile.pair_id) {
        // Fetch pair & partner details
        const pairRes = await fetch(
          `${supabaseUrl}/rest/v1/pairs?id=eq.${profile.pair_id}&select=*&limit=1`,
          { headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` } }
        )
        const pairRows: any[] = await pairRes.json()
        const pair = pairRows[0]
        if (pair) {
          const localFriendsSince = localStorage.getItem(`friends_since_${profile.pair_id}`)
          const friendsSinceVal = pair.friends_since || localFriendsSince || ''
          const durationStr = friendsSinceVal ? getFriendshipDurationStr(friendsSinceVal) : 'Friends since today'

          const partnerId = pair.user_a_id === userId ? pair.user_b_id : pair.user_a_id
          if (partnerId) {
            const partnerRes = await fetch(
              `${supabaseUrl}/rest/v1/users?id=eq.${partnerId}&select=*&limit=1`,
              { headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` } }
            )
            const partnerRows: any[] = await partnerRes.json()
            const partner = partnerRows[0]
            if (partner) {
              set({
                partnerId: partnerId,
                partnerName: partner.display_name || 'Friend',
                partnerCity: partner.city || '',
                pairStatus: 'active',
                partnerAvatar: partner.avatar_url || '',
                partnerVibe: partner.vibe_status || '',
                partnerLastSeen: partner.last_seen_at || null,
                friendshipDuration: durationStr,
                partnerQuranPage: partner.quran_page || 1,
                quranTarget: pair.quran_target || 'Finish Al-Baqarah by Sunday',
              })

              // Synchronize all data fetches and realtime channels when active
              get().fetchTasks()
              get().fetchSongs()
              get().fetchMemories()
              get().fetchTimeBlocks()
              get().fetchPrayers()
              get().fetchAthkarLogs()
              get().fetchHobbies().catch(() => {})
              get().fetchTreeNodes()
              get().fetchWatchlist()
              get().fetchTaskCompletions()
              get().subscribeToPresence()
              get().subscribeToDatabaseChanges()
              get().updateLastSeen()

              // Migrate existing localStorage tree nodes to Supabase (one-time)
              migrateLocalTreeNodesToDB(userId, partnerId, profile.pair_id, token!, supabaseUrl, supabaseAnonKey)
              return
            }
          }
        }
      }

      set({ pairStatus: 'pending', partnerName: '', partnerCity: '' })

    } catch (err: any) {
      console.error('[MasSync] Error in fetchProfileAndPartner:', err.message)
      if (err.name === 'AbortError') {
        set({ dbError: 'Connection to database timed out. Your Supabase project may be paused. Please visit supabase.com/dashboard and click "Restore Project" if it shows as paused, then refresh the app.' })
      } else {
        set({ dbError: `Unexpected error loading profile: ${err.message || err}` })
      }
    }
  },

  signUp: async (email, password, displayName, city) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          city: city,
        }
      }
    })
    if (error) throw error
    return data
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  logout: async () => {
    // Unsubscribe from channels
    get().unsubscribeFromPresence()
    get().unsubscribeFromDatabaseChanges()

    // Run signOut in the background so network hangs don't block the UI logout
    supabase.auth.signOut().catch((err) => {
      console.error('Error during Supabase signout:', err)
    })

    // Immediately clear local state to guarantee responsive UI logout
    set({
      user: null,
      pairId: null,
      inviteCode: '',
      pairStatus: 'pending',
      userName: '',
      partnerName: '',
      userCity: '',
      partnerCity: '',
      dbError: null,
      onlineUsers: [],
      partnerLastSeen: null,
      tasks: [],
      taskCompletions: [],
      memories: [],
      timeBlocks: [],
      songs: [],
      hobbies: [],
      myPrayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
      partnerPrayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
    })
  },

  linkPartner: async (code) => {
    const { data, error } = await supabase.rpc('link_friend', { friend_code: code })
    if (error) throw error
    
    const user = get().user
    if (user) {
      await get().fetchProfileAndPartner(user.id)
    }
    return data
  },

  disconnectPartner: async () => {
    const { error } = await supabase.rpc('disconnect_friend')
    if (error) throw error
    
    const user = get().user
    if (user) {
      await get().fetchProfileAndPartner(user.id)
    }
  },

  subscribeToRealtime: () => {
    const user = get().user
    if (!user) return

    get().unsubscribeFromRealtime()

    const channelName = `public:users:id=eq.${user.id}`
    const existing = supabase.getChannels().find(
      (c: any) => c.name === channelName || c.topic === `realtime:${channelName}`
    )
    if (existing) {
      supabase.removeChannel(existing)
    }

    activeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          const updatedUser = payload.new as any
          if (updatedUser.pair_id !== get().pairId) {
            await get().fetchProfileAndPartner(user.id)
          }
        }
      )
      .subscribe()
  },

  unsubscribeFromRealtime: () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel)
      activeChannel = null
    }
  },

  subscribeToPresence: () => {
    const user = get().user
    const pairId = get().pairId
    if (!user || !pairId) return

    if (presenceChannel && subscribedPresencePairId === pairId) {
      return // already subscribed to this pair
    }

    get().unsubscribeFromPresence()

    const channelName = `presence:pair:${pairId}`
    const existing = supabase.getChannels().find(
      (c: any) => c.name === channelName || c.topic === `realtime:${channelName}`
    )
    if (existing) {
      supabase.removeChannel(existing)
    }

    subscribedPresencePairId = pairId
    presenceChannel = supabase.channel(channelName)

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const onlineIds = Object.keys(state)
        set({ onlineUsers: onlineIds })
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          })
        }
      })
  },

  unsubscribeFromPresence: () => {
    if (presenceChannel) {
      supabase.removeChannel(presenceChannel)
      presenceChannel = null
      subscribedPresencePairId = null
    }
    set({ onlineUsers: [] })
  },

  subscribeToDatabaseChanges: () => {
    const pairId = get().pairId
    const user = get().user
    if (!pairId || !user) return

    if (dbChangesChannel && subscribedPairId === pairId) {
      return // already subscribed to this pair
    }

    get().unsubscribeFromDatabaseChanges()

    const channelName = `db-changes:${pairId}`
    const existing = supabase.getChannels().find(
      (c: any) => c.name === channelName || c.topic === `realtime:${channelName}`
    )
    if (existing) {
      supabase.removeChannel(existing)
    }

    subscribedPairId = pairId
    dbChangesChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchTasks() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'songs', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchSongs() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchMemories() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_blocks', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchTimeBlocks() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_logs', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchPrayers() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'athkar_logs', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchAthkarLogs() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hobbies', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchHobbies().catch(() => {}) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tree_nodes', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchTreeNodes() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'watchlist', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchWatchlist() }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        async (payload: any) => {
          const updatedUser = payload.new as any
          if (updatedUser.id === user.id || updatedUser.pair_id === pairId) {
            await get().fetchProfileAndPartner(user.id)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reminders', filter: `pair_id=eq.${pairId}` },
        (payload: any) => {
          const newReminder = payload.new
          if (newReminder && newReminder.created_by !== user.id) {
            get().showToast(newReminder.message, 'info')
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newReminder.title, {
                body: newReminder.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
              })
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pairs', filter: `id=eq.${pairId}` },
        async (payload: any) => {
          const updatedPair = payload.new as any
          set({
            quranTarget: updatedPair.quran_target || 'Finish Al-Baqarah by Sunday',
            friendshipDuration: updatedPair.friends_since ? getFriendshipDurationStr(updatedPair.friends_since) : get().friendshipDuration
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_completions', filter: `pair_id=eq.${pairId}` },
        () => { get().fetchTaskCompletions() }
      )
      .subscribe()
  },

  unsubscribeFromDatabaseChanges: () => {
    if (dbChangesChannel) {
      supabase.removeChannel(dbChangesChannel)
      dbChangesChannel = null
      subscribedPairId = null
    }
  },

  updateLastSeen: async () => {
    const user = get().user
    if (!user) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ last_seen_at: new Date().toISOString() })
        }
      )
    } catch (e) {
      console.warn('[MasSync] Failed to update last_seen_at (database schema might need to be run):', e)
    }
  },

  fetchTasks: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/tasks?pair_id=eq.${pairId}&order=created_at.desc`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mappedTasks: Task[] = data.map((t: any) => ({
          id: t.id,
          pair_id: t.pair_id,
          title: t.title,
          description: t.description || undefined,
          category: t.category,
          recurrence: t.recurrence,
          is_done: t.is_done,
          created_by: t.created_by === userId ? 'you' : 'partner',
          done_by: t.done_by ? (t.done_by === userId ? 'you' : 'partner') : undefined,
          done_at: t.done_at,
          date: t.date
        }))
        set({ tasks: mappedTasks })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching tasks:', e)
    }
  },

  fetchSongs: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/songs?pair_id=eq.${pairId}&order=gifted_at.desc`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mappedSongs: Song[] = data.map((s: any) => ({
          id: s.id,
          pair_id: s.pair_id,
          title: s.title,
          artist: s.artist,
          message: s.message || '',
          gifted_by: s.gifted_by === userId ? 'you' : 'partner',
          gifted_at: s.gifted_at,
          rating: s.rating
        }))
        set({ songs: mappedSongs })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching songs:', e)
    }
  },

  fetchMemories: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/memories?pair_id=eq.${pairId}&order=date.desc`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mappedMemories: Memory[] = data.map((m: any) => {
          const photos = m.photos || (m.photo ? [m.photo] : [])
          return {
            id: m.id,
            pair_id: m.pair_id,
            created_by: m.created_by === userId ? 'you' : 'partner',
            date: m.date,
            title: m.title,
            note: m.note,
            mood_emoji: m.mood_emoji,
            tags: m.tags || [],
            photo: m.photo,
            photos: photos,
            type: m.type,
            time: m.time,
            place: m.place,
            vibe: m.vibe,
            page_url: m.page_url
          }
        })
        set({ memories: mappedMemories })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching memories:', e)
    }
  },

  fetchTimeBlocks: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) throw new Error('No auth token')

      const res = await fetch(`${supabaseUrl}/rest/v1/time_blocks?pair_id=eq.${pairId}&order=created_at.asc`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        const mappedBlocks: TimeBlock[] = data.map((b: any) => ({
          id: b.id,
          pair_id: b.pair_id,
          user_id: b.user_id,
          title: b.title,
          domain: b.domain,
          day: b.day,
          start_time: b.start_time,
          end_time: b.end_time,
          details: b.details || '',
          created_by: b.user_id === userId ? 'you' : 'partner'
        }))
        set({ timeBlocks: mappedBlocks })
      } else {
        const errText = await res.text()
        if (res.status === 404 || errText.includes('does not exist') || res.status === 400) {
          // Fallback to local storage
          const localBlocks = localStorage.getItem(`time_blocks_${pairId}`)
          if (localBlocks) {
            set({ timeBlocks: JSON.parse(localBlocks) })
          } else {
            // Load some default presets for the user so it looks stunning immediately
            const presets = getDefaultTimeBlocks(pairId, userId)
            localStorage.setItem(`time_blocks_${pairId}`, JSON.stringify(presets))
            set({ timeBlocks: presets })
          }
        } else {
          throw new Error(errText)
        }
      }
    } catch (e) {
      console.warn('[MasSync] Time blocks DB load failed, loading from local storage:', e)
      const localBlocks = localStorage.getItem(`time_blocks_${pairId}`)
      if (localBlocks) {
        set({ timeBlocks: JSON.parse(localBlocks) })
      } else {
        const presets = getDefaultTimeBlocks(pairId, userId)
        localStorage.setItem(`time_blocks_${pairId}`, JSON.stringify(presets))
        set({ timeBlocks: presets })
      }
    }
  },

  addTimeBlock: async (block) => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    const tempId = `temp-tb-${Date.now()}`
    const newBlock: TimeBlock = {
      ...block,
      id: tempId,
      pair_id: pairId,
      user_id: userId,
      created_by: 'you'
    }
    set((state) => ({ timeBlocks: [...state.timeBlocks, newBlock] }))

    // Save to local storage anyway for instantaneous response and fallback sync
    const localKey = `time_blocks_${pairId}`
    const currentLocal = JSON.parse(localStorage.getItem(localKey) || '[]')
    localStorage.setItem(localKey, JSON.stringify([...currentLocal, newBlock]))

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/time_blocks`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pair_id: pairId,
          user_id: userId,
          title: block.title,
          domain: block.domain,
          day: block.day,
          start_time: block.start_time,
          end_time: block.end_time,
          details: block.details || ''
        })
      })

      if (res.ok) {
        const inserted = await res.json()
        if (inserted[0]) {
          set((state) => ({
            timeBlocks: state.timeBlocks.map((b) => b.id === tempId ? {
              ...b,
              id: inserted[0].id
            } : b)
          }))
          // Update in local storage with the real DB ID
          const updatedLocal = JSON.parse(localStorage.getItem(localKey) || '[]').map((b: any) =>
            b.id === tempId ? { ...b, id: inserted[0].id } : b
          )
          localStorage.setItem(localKey, JSON.stringify(updatedLocal))
        }
      } else {
        const errText = await res.text()
        if (res.status === 404 || errText.includes('does not exist') || res.status === 400) {
          console.warn('[MasSync] time_blocks table does not exist in Supabase. Storing in local storage only.')
        } else {
          throw new Error(errText)
        }
      }
    } catch (e) {
      console.error('[MasSync] Error adding time block to DB:', e)
    }
  },

  deleteTimeBlock: async (id) => {
    const pairId = get().pairId
    if (!pairId) return

    set((state) => ({
      timeBlocks: state.timeBlocks.filter((b) => b.id !== id)
    }))

    const localKey = `time_blocks_${pairId}`
    const currentLocal = JSON.parse(localStorage.getItem(localKey) || '[]')
    localStorage.setItem(localKey, JSON.stringify(currentLocal.filter((b: any) => b.id !== id)))

    if (id.startsWith('temp-tb-')) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/time_blocks?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) {
        const errText = await res.text()
        if (res.status === 404 || errText.includes('does not exist') || res.status === 400) {
          // Ignored
        } else {
          throw new Error(errText)
        }
      }
    } catch (e) {
      console.error('[MasSync] Error deleting time block from DB:', e)
    }
  },

  fetchPrayers: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const todayStr = new Date().toISOString().split('T')[0]
      const res = await fetch(`${supabaseUrl}/rest/v1/prayer_logs?pair_id=eq.${pairId}&date=eq.${todayStr}`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const rows = await res.json()
        let myLog = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
        let partnerLog = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }

        rows.forEach((row: any) => {
          const mapped = {
            fajr: row.fajr,
            dhuhr: row.dhuhr,
            asr: row.asr,
            maghrib: row.maghrib,
            isha: row.isha
          }
          if (row.user_id === userId) {
            myLog = mapped
          } else {
            partnerLog = mapped
          }
        })

        set({ myPrayers: myLog, partnerPrayers: partnerLog })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching prayers:', e)
    }
  },

  fetchAthkarLogs: async () => {
    const pairId = get().pairId
    const userId = get().user?.id
    if (!pairId || !userId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const todayStr = new Date().toISOString().split('T')[0]
      const res = await fetch(`${supabaseUrl}/rest/v1/athkar_logs?pair_id=eq.${pairId}&date=eq.${todayStr}`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const rows = await res.json()
        let myLog: { [key: string]: number } = {}
        let partnerLog: { [key: string]: number } = {}

        rows.forEach((row: any) => {
          if (row.user_id === userId) {
            myLog[row.thikr_id] = row.current_count
          } else {
            partnerLog[row.thikr_id] = row.current_count
          }
        })

        set({ myAthkar: myLog, partnerAthkar: partnerLog })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching Athkar logs:', e)
    }
  },

  fetchHobbies: async () => {
    const pairId = get().pairId
    if (!pairId) return

    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token
      if (!token) return

      const res = await fetch(`${supabaseUrl}/rest/v1/hobbies?pair_id=eq.${pairId}`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mappedHobbies: Hobby[] = data.map((h: any) => ({
          id: h.id,
          pair_id: h.pair_id,
          name: h.name,
          description: h.description || '',
          cover_image: h.cover_image || '',
          start_date: h.start_date || '',
          goal_date: h.goal_date || '',
          status: h.status,
          steps: h.steps || [],
          notes: h.notes || [],
          photos: h.photos || []
        }))
        set({ hobbies: mappedHobbies })
      }
    } catch (e) {
      console.error('[MasSync] Error fetching hobbies:', e)
      throw e // Let it fail silently or gracefully in caller
    }
  }
}))
