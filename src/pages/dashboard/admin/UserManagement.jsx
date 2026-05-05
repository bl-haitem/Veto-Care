import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, MoreVertical, Edit, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      setUsers(users.filter(u => u.id !== id))
      toast.success('Utilisateur supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Gestion Utilisateurs</h1>
            <p className="text-gray-500 mt-1">Gérez les comptes des propriétaires et des vétérinaires</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher par nom ou téléphone..." 
              className="pl-10 bg-white border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={roleFilter === 'all' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setRoleFilter('all')}
              className="flex-1"
            >
              Tous
            </Button>
            <Button 
              variant={roleFilter === 'maitre' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setRoleFilter('maitre')}
              className="flex-1"
            >
              Proprios
            </Button>
            <Button 
              variant={roleFilter === 'veterinaire' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setRoleFilter('veterinaire')}
              className="flex-1"
            >
              Vétos
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : (
          <Card className="overflow-hidden border-none shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Wilaya</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.full_name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={
                          user.role === 'veterinaire' 
                            ? 'bg-teal-50 text-teal-700 border-teal-100' 
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }>
                          {user.role === 'veterinaire' ? 'Vétérinaire' : 'Propriétaire'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.wilaya}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucun utilisateur trouvé</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
