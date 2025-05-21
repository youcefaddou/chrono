import { useContext } from 'react'
import { GlobalTimerContext } from './GlobalTimerProvider'

export function useGlobalTimer () {
	return useContext(GlobalTimerContext)
}
