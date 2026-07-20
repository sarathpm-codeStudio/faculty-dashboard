import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { chatService, attachReplyPreviews, type ChatMessage, type ChatReactionGroup } from '@/services/chatService'
import { supabase } from '@/services/supabase'
import { uniqueChannel } from '@/utils/realtimeChannel'
import { useAuthStore } from '@/store/authStore'
import { decryptMessageSafe } from '@/utils/chatEncryption'

const chatMessagesQueryKey = (roomId?: string | null) =>
    ['chat-messages', roomId] as const

// Shape of the paginated messages cache for a room.
type MessagesPage = { items: ChatMessage[]; nextCursor: string | null }
type MessagesInfiniteData = { pages: MessagesPage[]; pageParams: unknown[] }

// Append a message to the newest page of a room's thread cache, in place and
// idempotently (deduped by id). Used so a just-sent message lands instantly
// without a refetch — and so the later realtime echo is a no-op.
const appendMessageToThread = (
    queryClient: ReturnType<typeof useQueryClient>,
    roomId: string,
    message: ChatMessage,
) => {
    queryClient.setQueryData<MessagesInfiniteData>(
        chatMessagesQueryKey(roomId),
        old => {
            if (!old || old.pages.length === 0) return old
            const exists = old.pages.some(p => p.items.some(m => m.id === message.id))
            if (exists) return old
            const [first, ...rest] = old.pages
            if (!first) return old
            return { ...old, pages: [{ ...first, items: [...first.items, message] }, ...rest] }
        },
    )
}

// Apply a single reaction change (one user's one emoji) to a message's grouped
// reaction list, returning a new list. Idempotent by (emoji, userId): re-adding
// a reaction already present, or removing one that's absent, is a no-op — so the
// realtime echo of our own optimistic change doesn't double-count.
const applyReactionDelta = (
    groups: ChatReactionGroup[] | undefined,
    emoji: string,
    userId: string,
    add: boolean,
    myId?: string,
): ChatReactionGroup[] => {
    const list = (groups ?? []).map(g => ({ ...g, userIds: [...g.userIds] }))
    const idx = list.findIndex(g => g.emoji === emoji)

    if (add) {
        if (idx === -1) {
            list.push({ emoji, count: 1, mine: userId === myId, userIds: [userId] })
        } else {
            const g = list[idx]
            if (!g.userIds.includes(userId)) {
                g.userIds.push(userId)
                g.count += 1
                if (userId === myId) g.mine = true
            }
        }
    } else if (idx !== -1) {
        const g = list[idx]
        if (g.userIds.includes(userId)) {
            g.userIds = g.userIds.filter(u => u !== userId)
            g.count = g.userIds.length
            if (userId === myId) g.mine = false
        }
        if (g.count <= 0) list.splice(idx, 1)
    }

    return list
}

// Patch one message's reactions in the open thread cache, in place, via updater.
const patchMessageReactions = (
    queryClient: ReturnType<typeof useQueryClient>,
    roomId: string,
    messageId: string,
    updater: (groups: ChatReactionGroup[] | undefined) => ChatReactionGroup[],
) => {
    queryClient.setQueryData<MessagesInfiniteData>(
        chatMessagesQueryKey(roomId),
        old =>
            old
                ? {
                      ...old,
                      pages: old.pages.map(p => ({
                          ...p,
                          items: p.items.map(m =>
                              m.id === messageId ? { ...m, reactions: updater(m.reactions) } : m,
                          ),
                      })),
                  }
                : old,
    )
}

// The platform admin's profile id — used to tell whether the faculty already
// has an admin conversation.
export const useGetAdminId = () => {
    return useQuery({
        queryKey: ['chat-admin-id'],
        queryFn: () => chatService.getAdminId(),
        staleTime: Infinity,
    })
}

// All chat rooms the signed-in user belongs to, ready for the messages list.
export const useGetMyChatRooms = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['chat-rooms'],
        queryFn: () => chatService.getMyChatRooms(),
        enabled,
    })
}

// Messages of a single room, paginated backwards: the first page is the latest
// messages, and fetchNextPage() loads older ones (for scroll-up history).
// Disabled until a room is selected.
export const useRoomMessages = (roomId?: string | null) => {
    return useInfiniteQuery({
        queryKey: chatMessagesQueryKey(roomId),
        queryFn: ({ pageParam }) =>
            chatService.getMessagesPage(roomId as string, pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
        enabled: !!roomId,
        // The open thread is kept live in place by realtime patches; without
        // this, react-query refetches every loaded page on each window focus,
        // visibly reloading the conversation (e.g. when testing two apps
        // side by side and clicking between windows).
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    })
}

// Send a message into a room, then refresh that thread and the room list.
export const useSendMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            roomId,
            content,
            replyToMessageId,
        }: {
            roomId: string
            content: string
            replyToMessageId?: string | null
        }) => chatService.sendMessage(roomId, content, replyToMessageId),
        // Drop the just-sent message straight into the thread cache (no refetch),
        // so it replaces the optimistic bubble with no flicker; the later
        // realtime echo is deduped. Only the room list is refreshed.
        onSuccess: (message, { roomId }) => {
            appendMessageToThread(queryClient, roomId, message)
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
        },
    })
}

// Send a voice message (record → upload → store), then refresh the thread and
// room list. Same refresh contract as useSendMessage.
export const useSendAudioMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            roomId,
            blob,
            meta,
            replyToMessageId,
        }: {
            roomId: string
            blob: Blob
            meta: { duration: number; peaks: number[]; mimeType: string }
            replyToMessageId?: string | null
        }) => chatService.sendAudioMessage(roomId, blob, meta, replyToMessageId),
        // Append straight into the thread cache so the real voice bubble replaces
        // the optimistic one with no flicker (realtime echo is deduped).
        onSuccess: (message, { roomId }) => {
            appendMessageToThread(queryClient, roomId, message)
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
        },
    })
}

// Send one or more attachments (image / PDF album) as a single message, then
// drop it straight into the thread cache — same no-refetch contract as text and
// voice sends.
export const useSendFilesMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            roomId,
            files,
            kind,
            replyToMessageId,
        }: {
            roomId: string
            files: File[]
            kind: 'IMAGE' | 'PDF'
            replyToMessageId?: string | null
        }) => chatService.sendFilesMessage(roomId, files, kind, replyToMessageId),
        onSuccess: (message, { roomId }) => {
            appendMessageToThread(queryClient, roomId, message)
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
        },
    })
}

// Soft-delete my own message, then refresh that thread and the room list so the
// tombstone (and any updated last-message preview) shows everywhere.
export const useDeleteMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ messageId }: { messageId: string; roomId: string }) =>
            chatService.deleteMessage(messageId),
        // The tombstone flips in via the realtime UPDATE patch (no refetch).
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
        },
    })
}

// Toggle the current user's emoji reaction on a message: add it when absent,
// remove it when already present. The thread cache is patched optimistically so
// the badge flips instantly; the realtime echo is a no-op (idempotent delta),
// and a failed write rolls the badge back.
export const useToggleReaction = (roomId?: string | null) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            messageId,
            emoji,
            active,
        }: {
            messageId: string
            emoji: string
            // Whether the user has already reacted with this emoji (→ remove it).
            active: boolean
        }) =>
            active
                ? chatService.removeReaction(messageId, emoji)
                : chatService.addReaction(roomId as string, messageId, emoji),
        onMutate: ({ messageId, emoji, active }) => {
            if (!roomId) return
            const myId = useAuthStore.getState().user?.id ?? ''
            patchMessageReactions(queryClient, roomId, messageId, groups =>
                applyReactionDelta(groups, emoji, myId, !active, myId),
            )
        },
        onError: (_err, { messageId, emoji, active }) => {
            if (!roomId) return
            // Reverse the optimistic change.
            const myId = useAuthStore.getState().user?.id ?? ''
            patchMessageReactions(queryClient, roomId, messageId, groups =>
                applyReactionDelta(groups, emoji, myId, active, myId),
            )
        },
    })
}

// Clear a room's unread badge by recording a read receipt, then refresh the list.
export const useMarkRoomRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (roomId: string) => chatService.markRoomRead(roomId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
        },
    })
}

// Mark the open room's incoming messages as seen. No thread refetch: the status
// change flows back to the sender via realtime and updates their ticks in
// place, so refetching here would only reload our own view for nothing.
export const useMarkMessagesSeen = () => {
    return useMutation({
        mutationFn: (roomId: string) => chatService.markMessagesSeen(roomId),
    })
}

// Toast for an incoming message. Skipped while the user is on the chat page
// (they see it live there). Looks up the sender's name for the toast title.
const notifyIncomingMessage = async (senderId: string) => {
    if (window.location.pathname.startsWith('/chats')) return

    const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', senderId)
        .maybeSingle()

    const fullName = [data?.first_name, data?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()
    // The admin profile has no name → label it "Admin".
    const name = fullName || (data?.role === 'ADMIN' ? 'Admin' : 'someone')

    toast(`You received a new message from ${name}`)
}

/**
 * App-wide chat subscription — mount ONCE at the app shell so it stays active
 * on every page, not just the chat view. Any new message refreshes the room
 * list (previews, ordering, unread counts) wherever the user is, and incoming
 * messages from other people get marked delivered (second tick). Status
 * UPDATEs (delivered/seen) also refresh the list so its preview stays current.
 */
export const useChatRealtimeGlobal = (myId?: string) => {
    const queryClient = useQueryClient()
    const myRef = useRef(myId)
    myRef.current = myId

    useEffect(() => {
        const channel = supabase
            .channel(uniqueChannel('faculty-chat-global'))
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                payload => {
                    const row = payload.new as { room_id?: string; sender_id?: string }
                    void queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
                    // Mark that room's thread stale WITHOUT refetching now: the
                    // open room is patched live by useActiveThreadRealtime, and
                    // a closed room's thread must refetch next time it's opened
                    // (its cache never receives realtime patches while closed).
                    if (row?.room_id) {
                        void queryClient.invalidateQueries({
                            queryKey: chatMessagesQueryKey(row.room_id),
                            refetchType: 'none',
                        })
                    }
                    // A message from someone else, and I'm online → delivered + toast.
                    if (row?.room_id && row.sender_id && row.sender_id !== myRef.current) {
                        void chatService.markMessagesDelivered(row.room_id)
                        void notifyIncomingMessage(row.sender_id)
                    }
                },
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
                payload => {
                    void queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
                    // Same stale-marking as INSERT: keeps a closed room's ticks
                    // and deletions fresh for its next open, no refetch now.
                    const roomId = (payload.new as { room_id?: string })?.room_id
                    if (roomId) {
                        void queryClient.invalidateQueries({
                            queryKey: chatMessagesQueryKey(roomId),
                            refetchType: 'none',
                        })
                    }
                },
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [queryClient])
}

/**
 * Thread-level subscription for the open conversation — mount inside the chat
 * view. Refreshes the active room's messages on any insert/update there so the
 * open thread and its ticks update live. (Room-list + delivered handling lives
 * in useChatRealtimeGlobal.)
 */
export const useActiveThreadRealtime = (activeRoomId?: string | null) => {
    const queryClient = useQueryClient()
    const activeRef = useRef(activeRoomId)
    activeRef.current = activeRoomId

    useEffect(() => {
        const channel = supabase
            .channel(uniqueChannel('faculty-chat-thread'))
            // INSERT: decrypt + resolve the reply preview, then append to the
            // newest page of the open thread in place (no refetch → no reload),
            // skipping any message already present (e.g. our own echo).
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                payload => {
                    const incoming = payload.new as ChatMessage
                    const roomId = incoming?.room_id
                    if (!roomId || roomId !== activeRef.current) return
                    // My own sends enter the thread via the mutation's onSuccess
                    // swap (which replaces the optimistic clock bubble in one
                    // render). Appending the echo here too would land BEFORE the
                    // request resolves, briefly duplicating the bubble — the
                    // "chat reloads on send" flicker.
                    if (incoming.sender_id === useAuthStore.getState().user?.id) return

                    void (async () => {
                        incoming.content = incoming.is_deleted
                            ? null
                            : await decryptMessageSafe(incoming.content)
                        if (!incoming.is_deleted) await attachReplyPreviews([incoming])
                        queryClient.setQueryData<MessagesInfiniteData>(
                            chatMessagesQueryKey(roomId),
                            old => {
                                if (!old || old.pages.length === 0) return old
                                const exists = old.pages.some(p =>
                                    p.items.some(m => m.id === incoming.id),
                                )
                                if (exists) return old
                                const [first, ...rest] = old.pages
                                if (!first) return old
                                // Newest page holds items oldest→newest; append.
                                return {
                                    ...old,
                                    pages: [
                                        { ...first, items: [...first.items, incoming] },
                                        ...rest,
                                    ],
                                }
                            },
                        )
                    })()
                },
            )
            // UPDATE: patch the changed message in place so status ticks and
            // deletions update live without reloading the whole thread. Keep the
            // already-decrypted content (the payload carries ciphertext).
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
                payload => {
                    const updated = payload.new as ChatMessage
                    const roomId = updated?.room_id
                    if (!roomId || roomId !== activeRef.current) return
                    queryClient.setQueryData<MessagesInfiniteData>(
                        chatMessagesQueryKey(roomId),
                        old =>
                            old
                                ? {
                                      ...old,
                                      pages: old.pages.map(p => ({
                                          ...p,
                                          items: p.items.map(m =>
                                              m.id === updated.id
                                                  ? { ...m, ...updated, content: m.content }
                                                  : m,
                                          ),
                                      })),
                                  }
                                : old,
                    )
                },
            )
            // A reaction added anywhere → patch it into the open thread's badges.
            // The payload carries the full row (replica identity full). Our own
            // optimistic add makes this echo a no-op; a peer's reaction lands live.
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_message_reactions' },
                payload => {
                    const r = payload.new as {
                        message_id: string
                        room_id: string
                        user_id: string
                        emoji: string
                    }
                    if (!r?.room_id || r.room_id !== activeRef.current) return
                    const myId = useAuthStore.getState().user?.id
                    patchMessageReactions(queryClient, r.room_id, r.message_id, groups =>
                        applyReactionDelta(groups, r.emoji, r.user_id, true, myId),
                    )
                },
            )
            // A reaction removed anywhere → drop it from the open thread's badges.
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'chat_message_reactions' },
                payload => {
                    const r = payload.old as {
                        message_id: string
                        room_id: string
                        user_id: string
                        emoji: string
                    }
                    if (!r?.room_id || r.room_id !== activeRef.current) return
                    const myId = useAuthStore.getState().user?.id
                    patchMessageReactions(queryClient, r.room_id, r.message_id, groups =>
                        applyReactionDelta(groups, r.emoji, r.user_id, false, myId),
                    )
                },
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [queryClient])
}

/**
 * Catch-up sync for the open thread: quietly fetches the newest page and merges
 * any messages the cache is missing — in place, deduped, sorted; no refetch and
 * no visible reload (when nothing is new, the cache object is returned as-is so
 * nothing re-renders). Runs when the room opens and whenever the window regains
 * focus, so the thread self-heals even if a realtime event was missed (dropped
 * socket, sleeping tab, etc.).
 */
export const useThreadCatchUp = (roomId?: string | null) => {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!roomId) return
        let cancelled = false

        const catchUp = async () => {
            try {
                const page = await chatService.getMessagesPage(roomId)
                if (cancelled) return
                queryClient.setQueryData<MessagesInfiniteData>(
                    chatMessagesQueryKey(roomId),
                    old => {
                        if (!old || old.pages.length === 0) return old
                        const known = new Set(
                            old.pages.flatMap(p => p.items.map(m => m.id)),
                        )
                        const fresh = page.items.filter(m => !known.has(m.id))
                        if (!fresh.length) return old
                        const [first, ...rest] = old.pages
                        if (!first) return old
                        // Newest page holds items oldest→newest; merge the
                        // missing ones in and re-sort so mid-stream gaps land
                        // in the right place too.
                        const merged = [...first.items, ...fresh].sort((a, b) =>
                            (a.created_at ?? '').localeCompare(b.created_at ?? ''),
                        )
                        return { ...old, pages: [{ ...first, items: merged }, ...rest] }
                    },
                )
            } catch {
                /* best-effort sync — ignore failures */
            }
        }

        void catchUp()
        const onFocus = () => void catchUp()
        window.addEventListener('focus', onFocus)
        return () => {
            cancelled = true
            window.removeEventListener('focus', onFocus)
        }
    }, [roomId, queryClient])
}

/**
 * Ephemeral typing indicator over a Supabase Realtime broadcast channel
 * (`chat-typing:<roomId>`, event `typing`, payload `{ user_id, typing }`). No
 * DB writes — typing is transient. `self: false` means we never receive our own
 * events. Returns whether the peer is typing, plus `notifyTyping` (call on each
 * keystroke) and `stopTyping` (call on send / when the field clears).
 */
export const useTyping = (roomId?: string | null, myId?: string) => {
    const [peerTyping, setPeerTyping] = useState(false)
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    const subscribedRef = useRef(false)
    // Whether I'm currently broadcasting "typing".
    const activeRef = useRef(false)
    // Last time we broadcast "typing: true", to throttle re-sends.
    const lastTrueRef = useRef(0)
    const stopTimer = useRef<number | undefined>(undefined)
    const clearTimer = useRef<number | undefined>(undefined)

    useEffect(() => {
        if (!roomId) {
            setPeerTyping(false)
            return
        }

        const channel = supabase.channel(`chat-typing:${roomId}`, {
            config: { broadcast: { self: false } },
        })

        channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
            if (!payload || payload.user_id === myId) return
            if (payload.typing) {
                setPeerTyping(true)
                // Auto-clear if we miss the peer's "stopped" event.
                window.clearTimeout(clearTimer.current)
                clearTimer.current = window.setTimeout(() => setPeerTyping(false), 4000)
            } else {
                window.clearTimeout(clearTimer.current)
                setPeerTyping(false)
            }
        })

        channel.subscribe(status => {
            subscribedRef.current = status === 'SUBSCRIBED'
        })
        channelRef.current = channel

        return () => {
            // Best-effort "stopped typing" before tearing the channel down.
            if (activeRef.current && subscribedRef.current) {
                void channel.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { user_id: myId, typing: false },
                })
            }
            activeRef.current = false
            subscribedRef.current = false
            window.clearTimeout(stopTimer.current)
            window.clearTimeout(clearTimer.current)
            setPeerTyping(false)
            void supabase.removeChannel(channel)
            channelRef.current = null
        }
    }, [roomId, myId])

    // Announce that I'm typing, then auto-stop after a short pause. Re-broadcast
    // "typing" at most every ~1.2s while typing so a peer that just subscribed
    // (or missed the first packet) still picks it up mid-burst.
    const notifyTyping = useCallback(() => {
        const channel = channelRef.current
        if (!channel || !myId || !subscribedRef.current) return
        const now = Date.now()
        if (now - lastTrueRef.current > 1200) {
            lastTrueRef.current = now
            activeRef.current = true
            void channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { user_id: myId, typing: true },
            })
        }
        window.clearTimeout(stopTimer.current)
        stopTimer.current = window.setTimeout(() => {
            activeRef.current = false
            lastTrueRef.current = 0
            void channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { user_id: myId, typing: false },
            })
        }, 2500)
    }, [myId])

    // Stop immediately (e.g. right after sending a message).
    const stopTyping = useCallback(() => {
        const channel = channelRef.current
        window.clearTimeout(stopTimer.current)
        lastTrueRef.current = 0
        if (channel && myId && activeRef.current && subscribedRef.current) {
            activeRef.current = false
            void channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { user_id: myId, typing: false },
            })
        }
    }, [myId])

    return { peerTyping, notifyTyping, stopTyping }
}

// Start (or reopen) a 1:1 conversation with another user, then refresh the list.
export const useStartConversation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (otherUserId: string) =>
            chatService.startConversation(otherUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
        },
    })
}

// Start (or reopen) the faculty ↔ admin conversation, then refresh the list.
export const useStartAdminChat = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => chatService.startAdminChat(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
        },
    })
}
