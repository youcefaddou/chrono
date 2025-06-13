import { useContext } from 'react'
import { GlobalTimerContext } from './GlobalTimerContext'

export function useGlobalTimer () {
	return useContext(GlobalTimerContext)
}
