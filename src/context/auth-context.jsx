import { createContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [vetData, setVetData] = useState(null)
	const [session, setSession] = useState(null)
	const [loading, setLoading] = useState(true)

	const fetchProfileData = async (userId) => {
		try {
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single()

			if (profileError) {
				console.error('Error fetching profile:', profileError)
				return
			}

			setProfile(profileData)

			if (profileData?.role === 'veterinaire') {
				const { data: vetInfo } = await supabase
					.from('veterinaires')
					.select('*')
					.eq('user_id', userId)
					.single()
				setVetData(vetInfo)
			} else {
				setVetData(null)
			}
		} catch (error) {
			console.error('Error in fetchProfileData:', error)
		}
	}

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session?.user ?? null)
			if (session?.user) {
				fetchProfileData(session.user.id)
			}
			setLoading(false)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session)
			setUser(session?.user ?? null)
			if (session?.user) {
				fetchProfileData(session.user.id)
			} else {
				setProfile(null)
				setVetData(null)
			}
			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [])

	const signOut = async () => {
		await supabase.auth.signOut()
		setUser(null)
		setSession(null)
		setProfile(null)
		setVetData(null)
	}

	return (
		<AuthContext.Provider value={{ user, session, loading, signOut, profile, vetData }}>
			{children}
		</AuthContext.Provider>
	)
}