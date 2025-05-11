import { useTranslation } from 'react-i18next'

function Sidebar ({ user, onSmartTimerClick }) {
	const { t } = useTranslation()
	return (
		<aside className='w-56 bg-gray-900 text-white flex flex-col min-h-screen px-4 py-6'>
			<div className='mb-8 flex items-center gap-2'>
				<span className='text-2xl font-bold'>Workspace</span>
			</div>
			<nav className='flex-1'>
				<ul className='space-y-2'>
					<li className='font-semibold text-blue-400'>TRACK</li>
					<li
						className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'
						onClick={onSmartTimerClick}
					>
						 Smart Timer
					</li>
					<li className='font-semibold text-blue-400 mt-4'>ANALYZE</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>📊 Reports</li>
					<li className='font-semibold text-blue-400 mt-4'>MANAGE</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>📁 Projects</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>👥 Clients</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>💼 Members</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>🧾 Invoices</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>🔌 Integrations</li>
				</ul>
			</nav>
			<div className='mt-auto pt-6 border-t border-gray-800'>
				<div className='text-xs text-gray-400 mb-2'>{user?.email}</div>
				<div className='flex flex-col gap-1'>
					<button className='text-left text-xs hover:underline'>Subscription</button>
					<button className='text-left text-xs hover:underline'>Organization</button>
					<button className='text-left text-xs hover:underline'>Settings</button>
				</div>
			</div>
		</aside>
	)
}

export default Sidebar
