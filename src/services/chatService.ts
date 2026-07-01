import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'

// Read the user id on every call so it reflects the current user.
const getCurrentUserId = () => useAuthStore.getState().user?.id

export type ChatRoomType = 'DIRECT' | 'GROUP'

// The other participant in a DIRECT room (null for GROUP rooms).
export interface ChatPeer {
    id: string
    name: string
    avatar_url: string | null
}

// Compact preview of a room's most recent message, shown in the list.
export interface ChatLastMessage {
    id: string
    content: string | null
    message_type: string
    sender_id: string
    created_at: string | null
}

// One row in the chat list: the room plus everything the list needs to render
// it (peer for DIRECT, last message preview, and this user's unread count).
export interface ChatRoomSummary {
    id: string
    type: ChatRoomType
    name: string | null
    course_id: string | null
    last_message_at: string | null
    last_message: ChatLastMessage | null
    peer: ChatPeer | null
    unread_count: number
}

const peerName = (p: any): string =>
    [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim()

// A single message inside a room, as stored in chat_messages.
export interface ChatMessage {
    id: string
    room_id: string
    sender_id: string
    message_type: string
    content: string | null
    file_url: string | null
    file_name: string | null
    file_size: number | null
    status: string
    created_at: string | null
}

// How many messages to load per page when opening / scrolling up a room.
export const CHAT_MESSAGES_PAGE_SIZE = 25

export const chatService = {
    // One page of a room's messages, newest first on the wire but returned
    // oldest→newest for rendering. Pass the previous page's `nextCursor` as
    // `before` to load the older page (for scroll-up pagination). `nextCursor`
    // is null once the start of the conversation is reached.
    getMessagesPage: async (
        roomId: string,
        before?: string,
    ): Promise<{ items: ChatMessage[]; nextCursor: string | null }> => {
        let q = supabase
            .from('chat_messages')
            .select(
                'id, room_id, sender_id, message_type, content, file_url, file_name, file_size, status, created_at',
            )
            .eq('room_id', roomId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(CHAT_MESSAGES_PAGE_SIZE)

        if (before) q = q.lt('created_at', before)

        const { data, error } = await q
        if (error) throw new Error(error.message)

        const rows = (data ?? []) as ChatMessage[]
        const nextCursor =
            rows.length === CHAT_MESSAGES_PAGE_SIZE
                ? rows[rows.length - 1].created_at
                : null

        // Reverse to oldest→newest so the page renders top→bottom.
        return { items: rows.slice().reverse(), nextCursor }
    },

    // Every chat room the current user belongs to, newest activity first.
    // For DIRECT rooms the other participant is resolved into `peer`; GROUP
    // rooms carry their own `name`. `unread_count` counts messages from other
    // people sent after this user's last read receipt for that room.
    getMyChatRooms: async (): Promise<ChatRoomSummary[]> => {
        const userId = getCurrentUserId()
        if (!userId) return []

        // Rooms I'm an active member of (skip rooms I left / soft-deleted rooms).
        const { data: memberRows, error: memberErr } = await supabase
            .from('chat_room_members')
            .select(
                'room_id, chat_rooms!inner(id, type, name, course_id, last_message_id, last_message_at, is_deleted)',
            )
            .eq('user_id', userId)
            .eq('is_deleted', false)
            .eq('chat_rooms.is_deleted', false)

        if (memberErr) throw new Error(memberErr.message)

        const rooms = (memberRows ?? [])
            .map((r: any) => r.chat_rooms)
            .filter(Boolean)
        if (rooms.length === 0) return []

        const roomIds = rooms.map((r: any) => r.id)

        // Resolve the "other side" of each DIRECT room → their profile.
        const { data: peerRows, error: peerErr } = await supabase
            .from('chat_room_members')
            .select('room_id, profiles!inner(id, first_name, last_name, avatar_url)')
            .in('room_id', roomIds)
            .neq('user_id', userId)
            .eq('is_deleted', false)

        if (peerErr) throw new Error(peerErr.message)

        const peerByRoom = new Map<string, ChatPeer>()
        for (const row of peerRows ?? []) {
            const p = (row as any).profiles
            if (p && !peerByRoom.has((row as any).room_id)) {
                peerByRoom.set((row as any).room_id, {
                    id: p.id,
                    name: peerName(p),
                    avatar_url: p.avatar_url ?? null,
                })
            }
        }

        // Last-message previews, fetched by the ids the rooms point at.
        const lastIds = rooms
            .map((r: any) => r.last_message_id)
            .filter(Boolean)
        const lastByRoom = new Map<string, ChatLastMessage>()
        if (lastIds.length) {
            const { data: msgs, error: msgErr } = await supabase
                .from('chat_messages')
                .select('id, room_id, content, message_type, sender_id, created_at')
                .in('id', lastIds)

            if (msgErr) throw new Error(msgErr.message)
            for (const m of msgs ?? []) {
                lastByRoom.set((m as any).room_id, {
                    id: (m as any).id,
                    content: (m as any).content,
                    message_type: (m as any).message_type,
                    sender_id: (m as any).sender_id,
                    created_at: (m as any).created_at,
                })
            }
        }

        // My read receipts → the cutoff for what counts as unread per room.
        const { data: receipts, error: receiptErr } = await supabase
            .from('chat_read_receipts')
            .select('room_id, last_read_at')
            .eq('user_id', userId)
            .in('room_id', roomIds)

        if (receiptErr) throw new Error(receiptErr.message)

        const readByRoom = new Map<string, string>()
        for (const r of receipts ?? []) {
            readByRoom.set((r as any).room_id, (r as any).last_read_at)
        }

        // Unread = messages from other people newer than my last read receipt.
        // One head-count per room, run in parallel.
        const unreadByRoom = new Map<string, number>()
        await Promise.all(
            roomIds.map(async (roomId: string) => {
                let q = supabase
                    .from('chat_messages')
                    .select('id', { count: 'exact', head: true })
                    .eq('room_id', roomId)
                    .eq('is_deleted', false)
                    .neq('sender_id', userId)

                const lastRead = readByRoom.get(roomId)
                if (lastRead) q = q.gt('created_at', lastRead)

                const { count, error } = await q
                if (error) throw new Error(error.message)
                unreadByRoom.set(roomId, count ?? 0)
            }),
        )

        const summaries: ChatRoomSummary[] = rooms.map((r: any) => ({
            id: r.id,
            type: r.type,
            name: r.name,
            course_id: r.course_id,
            last_message_at: r.last_message_at,
            last_message: lastByRoom.get(r.id) ?? null,
            peer: r.type === 'DIRECT' ? peerByRoom.get(r.id) ?? null : null,
            unread_count: unreadByRoom.get(r.id) ?? 0,
        }))

        // Newest activity first; rooms with no messages yet fall to the bottom.
        return summaries.sort(
            (a, b) =>
                new Date(b.last_message_at ?? 0).getTime() -
                new Date(a.last_message_at ?? 0).getTime(),
        )
    },

    // The platform admin's profile id (used for "Chat with admin"). Null if
    // somehow no admin exists.
    getAdminId: async (): Promise<string | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'ADMIN')
            .limit(1)
            .maybeSingle()

        if (error) throw new Error(error.message)
        return data?.id ?? null
    },

    // Open (or reopen) the faculty ↔ admin conversation. Labels the room
    // "Admin" since the admin profile has no display name.
    startAdminChat: async (): Promise<{ roomId: string; isNew: boolean }> => {
        const adminId = await chatService.getAdminId()
        if (!adminId) throw new Error('No admin is available to chat with')
        return chatService.startConversation(adminId, { name: 'Admin' })
    },

    // Open a 1:1 conversation with another user. Reuses the existing DIRECT
    // room between the two if there is one; otherwise creates the room and adds
    // both participants. Returns the room id and whether it was just created.
    startConversation: async (
        otherUserId: string,
        opts?: { name?: string },
    ): Promise<{ roomId: string; isNew: boolean }> => {
        const userId = getCurrentUserId()
        if (!userId) throw new Error('Not authenticated')
        if (otherUserId === userId)
            throw new Error('Cannot start a conversation with yourself')

        // My existing DIRECT rooms.
        const { data: myRooms, error: myErr } = await supabase
            .from('chat_room_members')
            .select('room_id, chat_rooms!inner(type, is_deleted)')
            .eq('user_id', userId)
            .eq('is_deleted', false)
            .eq('chat_rooms.type', 'DIRECT')
            .eq('chat_rooms.is_deleted', false)

        if (myErr) throw new Error(myErr.message)

        const myRoomIds = (myRooms ?? []).map((r: any) => r.room_id)

        // Is the other user a member of any of them? → reuse it.
        if (myRoomIds.length) {
            const { data: shared, error: sharedErr } = await supabase
                .from('chat_room_members')
                .select('room_id')
                .eq('user_id', otherUserId)
                .eq('is_deleted', false)
                .in('room_id', myRoomIds)
                .limit(1)

            if (sharedErr) throw new Error(sharedErr.message)
            if (shared && shared.length)
                return { roomId: shared[0].room_id, isNew: false }
        }

        // None exists → create the room and add both participants.
        const { data: room, error: roomErr } = await supabase
            .from('chat_rooms')
            .insert({ type: 'DIRECT', created_by: userId, name: opts?.name ?? null })
            .select('id')
            .single()

        if (roomErr) throw new Error(roomErr.message)

        const { error: memErr } = await supabase
            .from('chat_room_members')
            .insert([
                { room_id: room.id, user_id: userId, is_admin: true },
                { room_id: room.id, user_id: otherUserId },
            ])

        if (memErr) throw new Error(memErr.message)

        return { roomId: room.id, isNew: true }
    },

    // Send a text message into a room, then point the room at it as its latest
    // message so the list preview and ordering stay in sync.
    sendMessage: async (roomId: string, content: string): Promise<ChatMessage> => {
        const userId = getCurrentUserId()
        if (!userId) throw new Error('Not authenticated')

        const body = content.trim()
        if (!body) throw new Error('Cannot send an empty message')

        const { data: message, error: msgErr } = await supabase
            .from('chat_messages')
            .insert({
                room_id: roomId,
                sender_id: userId,
                message_type: 'TEXT',
                content: body,
                status: 'sent',
            })
            .select(
                'id, room_id, sender_id, message_type, content, file_url, file_name, file_size, status, created_at',
            )
            .single()

        if (msgErr) throw new Error(msgErr.message)

        const { error: roomErr } = await supabase
            .from('chat_rooms')
            .update({
                last_message_id: message.id,
                last_message_at: (message as ChatMessage).created_at,
            })
            .eq('id', roomId)

        if (roomErr) throw new Error(roomErr.message)

        return message as ChatMessage
    },

    // Mark the other party's messages in a room as delivered (recipient's
    // device received them). Bumps 'sent' → 'delivered' and stamps delivered_at.
    // Drives the second (grey) tick on the sender's side.
    markMessagesDelivered: async (roomId: string): Promise<void> => {
        const userId = getCurrentUserId()
        if (!userId) return

        const { error } = await supabase
            .from('chat_messages')
            .update({ status: 'delivered', delivered_at: new Date().toISOString() })
            .eq('room_id', roomId)
            .neq('sender_id', userId)
            .eq('status', 'sent')

        if (error) throw new Error(error.message)
    },

    // Mark the other party's messages in a room as seen (recipient opened the
    // room). Bumps 'sent'/'delivered' → 'seen' and stamps seen_at. Drives the
    // blue ticks on the sender's side.
    markMessagesSeen: async (roomId: string): Promise<void> => {
        const userId = getCurrentUserId()
        if (!userId) return

        const { error } = await supabase
            .from('chat_messages')
            .update({ status: 'seen', seen_at: new Date().toISOString() })
            .eq('room_id', roomId)
            .neq('sender_id', userId)
            .in('status', ['sent', 'delivered'])

        if (error) throw new Error(error.message)
    },

    // Mark a room as read up to now for the current user (clears its unread
    // badge). Upserts the per-user read receipt for the room.
    markRoomRead: async (roomId: string): Promise<void> => {
        const userId = getCurrentUserId()
        if (!userId) return

        const { error } = await supabase
            .from('chat_read_receipts')
            .upsert(
                {
                    room_id: roomId,
                    user_id: userId,
                    last_read_at: new Date().toISOString(),
                },
                { onConflict: 'room_id,user_id' },
            )

        if (error) throw new Error(error.message)
    },
}
