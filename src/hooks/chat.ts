import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { chatService } from '@/services/chatService'
import { supabase } from '@/services/supabase'

const chatMessagesQueryKey = (roomId?: string | null) =>
    ['chat-messages', roomId] as const

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
    })
}

// Send a message into a room, then refresh that thread and the room list.
export const useSendMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ roomId, content }: { roomId: string; content: string }) =>
            chatService.sendMessage(roomId, content),
        onSuccess: (_data, { roomId }) => {
            queryClient.invalidateQueries({ queryKey: chatMessagesQueryKey(roomId) })
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
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

// Mark the open room's incoming messages as seen, then refresh that thread so
// the read ticks update locally too.
export const useMarkMessagesSeen = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (roomId: string) => chatService.markMessagesSeen(roomId),
        onSuccess: (_data, roomId) => {
            queryClient.invalidateQueries({ queryKey: chatMessagesQueryKey(roomId) })
        },
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
            .channel('faculty-chat-global')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                payload => {
                    const row = payload.new as { room_id?: string; sender_id?: string }
                    void queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
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
                () => {
                    void queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
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
            .channel('faculty-chat-thread')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chat_messages' },
                payload => {
                    const roomId = (payload.new as { room_id?: string })?.room_id
                    if (roomId && roomId === activeRef.current) {
                        void queryClient.invalidateQueries({
                            queryKey: chatMessagesQueryKey(roomId),
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
