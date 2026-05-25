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
  category: 'personal' | 'shared'
  recurrence: string
  is_done: boolean
  done_by?: 'you' | 'partner'
  done_at?: string
  date: string
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
  type: 'memory' | 'outing'
  time?: string
  place?: string
  vibe?: string
  location_url?: string
  page_url?: string
}

export interface Song {
  id: string
  pair_id: string
  gifted_by: 'you' | 'partner'
  title: string
  artist: string
  message: string
  gifted_at: string
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

interface AppState {
  // Authentication & Pairing
  user: User | null
  authInitialized: boolean
  pairId: string | null
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
  
  
  // App Data
  tasks: Task[]
  memories: Memory[]
  songs: Song[]
  myPrayers: PrayerLog
  partnerPrayers: PrayerLog
  hobbies: Hobby[]
  watchlist: WatchItem[]
  myTreeNodes: TreeNode[]
  partnerTreeNodes: TreeNode[]
  dailyChallengeDone: boolean
  
  // Setters & Actions
  setUser: (user: User | null) => void
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

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'pair_id' | 'created_by' | 'is_done'>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  
  // Memory Actions
  addMemory: (memory: Omit<Memory, 'id' | 'pair_id' | 'created_by' | 'type'>) => void
  addOuting: (outing: Omit<Memory, 'id' | 'pair_id' | 'created_by' | 'type' | 'note'>) => void
  
  // Song Actions
  giftSong: (song: Omit<Song, 'id' | 'pair_id' | 'gifted_by' | 'gifted_at'>) => void
  
  // Prayer Actions
  togglePrayer: (prayer: keyof PrayerLog) => void
  
  // Hobby Actions
  addHobby: (hobby: Omit<Hobby, 'id' | 'pair_id'>) => void
  toggleHobbyStep: (hobbyId: string, stepId: string) => void
  addHobbyNote: (hobbyId: string, note: string) => void
  addHobbyPhoto: (hobbyId: string, photoUrl: string) => void
  
  // Watchlist & Bucket actions
  addWatchItem: (item: Omit<WatchItem, 'id' | 'added_by'>) => void
  toggleWatchItem: (id: string) => void
  deleteWatchItem: (id: string) => void
  completeDailyChallenge: () => void

  // Inner Circle Tree Actions
  addTreeNode: (target: 'me' | 'partner', node: Omit<TreeNode, 'id'>) => void
  deleteTreeNode: (target: 'me' | 'partner', id: string) => void
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

  if (target === 'me') {
    return [
      { id: 'tme-1', name: 'Rania', relationship: 'Mother', category: 'family' },
      { id: 'tme-2', name: 'Ahmad', relationship: 'Father', category: 'family' },
      { id: 'tme-3', name: 'Faisal', relationship: 'Brother', category: 'family' },
      { id: 'tme-4', name: 'Omar', relationship: 'Best Friend', category: 'friends' },
      { id: 'tme-5', name: 'Tareq', relationship: 'Close Friend', category: 'friends' }
    ]
  } else {
    return [
      { id: 'tpart-1', name: 'Laila', relationship: 'Mother', category: 'family' },
      { id: 'tpart-2', name: 'Khaled', relationship: 'Father', category: 'family' },
      { id: 'tpart-3', name: 'Noor', relationship: 'Sister', category: 'family' },
      { id: 'tpart-4', name: 'Sarah', relationship: 'Best Friend', category: 'friends' },
      { id: 'tpart-5', name: 'Jana', relationship: 'Close Friend', category: 'friends' }
    ]
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  // Default values
  user: getInitialUser(),
  authInitialized: false,
  pairId: null,
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

  tasks: [],

  memories: [],

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

  hobbies: [],

  watchlist: [],

  dailyChallengeDone: false,

  myTreeNodes: getInitialTreeNodes('me'),
  partnerTreeNodes: getInitialTreeNodes('partner'),

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
  addTask: (task) => set((state) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      pair_id: state.pairId || 'mock-pair-id-123',
      created_by: 'you',
      is_done: false,
    }
    return { tasks: [newTask, ...state.tasks] }
  }),

  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            is_done: !t.is_done,
            done_by: !t.is_done ? 'you' : undefined,
            done_at: !t.is_done ? new Date().toISOString() : undefined,
          }
        : t
    ),
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
  })),

  // Memories actions
  addMemory: (memory) => set((state) => {
    const newMemory: Memory = {
      ...memory,
      id: `mem-${Date.now()}`,
      pair_id: state.pairId || 'mock-pair-id-123',
      created_by: 'you',
      type: 'memory',
    }
    return { memories: [newMemory, ...state.memories] }
  }),

  addOuting: (outing) => set((state) => {
    const newOuting: Memory = {
      ...outing,
      id: `outing-${Date.now()}`,
      pair_id: state.pairId || 'mock-pair-id-123',
      created_by: 'you',
      type: 'outing',
    }
    return { memories: [newOuting, ...state.memories] }
  }),

  // Songs actions
  giftSong: (song) => set((state) => {
    const newSong: Song = {
      ...song,
      id: `song-${Date.now()}`,
      pair_id: state.pairId || 'mock-pair-id-123',
      gifted_by: 'you',
      gifted_at: new Date().toISOString().split('T')[0],
    }
    return { songs: [newSong, ...state.songs] }
  }),

  // Prayer actions
  togglePrayer: (prayer) => set((state) => ({
    myPrayers: {
      ...state.myPrayers,
      [prayer]: !state.myPrayers[prayer],
    },
  })),

  // Hobbies actions
  addHobby: (hobby) => set((state) => {
    const newHobby: Hobby = {
      ...hobby,
      id: `hobby-${Date.now()}`,
      pair_id: state.pairId || 'mock-pair-id-123',
    }
    return { hobbies: [...state.hobbies, newHobby] }
  }),

  toggleHobbyStep: (hobbyId, stepId) => set((state) => ({
    hobbies: state.hobbies.map((h) =>
      h.id === hobbyId
        ? {
            ...h,
            steps: h.steps.map((s) => (s.id === stepId ? { ...s, is_done: !s.is_done } : s)),
          }
        : h
    ),
  })),

  addHobbyNote: (hobbyId, note) => set((state) => ({
    hobbies: state.hobbies.map((h) =>
      h.id === hobbyId
        ? {
            ...h,
            notes: [...h.notes, note],
          }
        : h
    ),
  })),

  addHobbyPhoto: (hobbyId, photoUrl) => set((state) => ({
    hobbies: state.hobbies.map((h) =>
      h.id === hobbyId
        ? {
            ...h,
            photos: [...h.photos, photoUrl],
          }
        : h
    ),
  })),

  // Watchlist actions
  addWatchItem: (item) => set((state) => {
    const newItem: WatchItem = {
      ...item,
      id: `watch-${Date.now()}`,
      added_by: 'you',
    }
    return { watchlist: [newItem, ...state.watchlist] }
  }),

  toggleWatchItem: (id) => set((state) => ({
    watchlist: state.watchlist.map((w) =>
      w.id === id
        ? {
            ...w,
            status: w.status === 'Want to Watch' ? 'Watching' : w.status === 'Watching' ? 'Done' : w.status === 'Pending' ? 'Completed' : 'Pending',
          }
        : w
    ),
  })),

  deleteWatchItem: (id) => set((state) => ({
    watchlist: state.watchlist.filter((w) => w.id !== id),
  })),

  completeDailyChallenge: () => set({ dailyChallengeDone: true }),

  addTreeNode: (target, node) => set((state) => {
    const key = `tree_nodes_${target}`
    const id = `tnode-${Date.now()}`
    const newNode = { ...node, id }
    const currentNodes = target === 'me' ? state.myTreeNodes : state.partnerTreeNodes
    const newNodes = [...currentNodes, newNode]
    try {
      localStorage.setItem(key, JSON.stringify(newNodes))
    } catch (e) {
      console.warn('Error saving tree nodes:', e)
    }
    return target === 'me' 
      ? { myTreeNodes: newNodes }
      : { partnerTreeNodes: newNodes }
  }),

  deleteTreeNode: (target, id) => set((state) => {
    const key = `tree_nodes_${target}`
    const currentNodes = target === 'me' ? state.myTreeNodes : state.partnerTreeNodes
    const newNodes = currentNodes.filter((n) => n.id !== id)
    try {
      localStorage.setItem(key, JSON.stringify(newNodes))
    } catch (e) {
      console.warn('Error saving tree nodes:', e)
    }
    return target === 'me'
      ? { myTreeNodes: newNodes }
      : { partnerTreeNodes: newNodes }
  }),

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
                partnerName: partner.display_name || 'Friend',
                partnerCity: partner.city || '',
                pairStatus: 'active',
                partnerAvatar: partner.avatar_url || '',
                partnerVibe: partner.vibe_status || '',
                friendshipDuration: durationStr,
              })
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
      dbError: null
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

    activeChannel = supabase
      .channel(`public:users:id=eq.${user.id}`)
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
  }
}))
