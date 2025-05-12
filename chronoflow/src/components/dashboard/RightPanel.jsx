import React from 'react'

function RightPanel () {
	return (
		<aside className='w-64 bg-white border-l border-gray-200 px-4 py-6 flex flex-col gap-4'>
			<div>
				<div className='font-semibold mb-2'>Goals</div>
				<button className='w-full bg-blue-50 text-blue-700 rounded px-3 py-2 text-sm mb-2'>+ Add Goal</button>
				<ul className='text-sm text-gray-600'>
					<li className='py-1'>No goals yet</li>
				</ul>
			</div>
			<div>
				<div className='font-semibold mb-2'>Favorites</div>
				<button className='w-full bg-blue-50 text-blue-700 rounded px-3 py-2 text-sm mb-2'>+ Add Favorite</button>
				<ul className='text-sm text-gray-600'>
					<li className='py-1'>No favorites yet</li>
				</ul>
			</div>
		</aside>
	)
}

export default RightPanel
