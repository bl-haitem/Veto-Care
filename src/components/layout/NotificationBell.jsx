import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    }

    fetchNotifications()

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
        toast.info(payload.new.title, { description: payload.new.message })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const markAsRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id)

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      toast.error('Erreur lors du marquage')
      setLoading(false)
      return
    }

    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setLoading(false)
  }

  const deleteNotification = async (id) => {
    const notif = notifications.find(n => n.id === id)
    const wasUnread = notif && !notif.read

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast.error('Erreur lors de la suppression')
      return
    }

    setNotifications(prev => prev.filter(n => n.id !== id))
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const clearAll = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      toast.error('Erreur lors de la suppression')
      setLoading(false)
      return
    }

    setNotifications([])
    setUnreadCount(0)
    setLoading(false)
  }

  if (!user) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 max-h-[400px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={loading}
              className="text-xs text-teal-600 hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCheck className="h-3 w-3" /> Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[340px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Aucune notification
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${!notif.read ? 'bg-teal-50/50' : 'hover:bg-gray-50'}`}
                >
                  {!notif.read && (
                    <span className="w-2 h-2 bg-teal-600 rounded-full mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notif.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {notif.message}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1 rounded hover:bg-teal-100 text-gray-400 hover:text-teal-600 transition-colors"
                        title="Marquer comme lu"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <button
              onClick={clearAll}
              disabled={loading}
              className="w-full text-xs text-gray-400 hover:text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Supprimer toutes les notifications
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
