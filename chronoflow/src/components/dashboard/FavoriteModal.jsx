// Fichier désactivé : modal favoris
// import React, { useState } from 'react'
// import './RightPanel.css'
// function FavoriteModal({ open, onClose, onSave, lang = 'fr' }) {
// 	const [desc, setDesc] = useState('')
// 	function handleSubmit(e) {
// 		e.preventDefault()
// 		if (desc.trim() !== '') {
// 			onSave({ desc })
// 			setDesc('')
// 		}
// 	}
// 	if (!open) return null
// 	return (
// 		<div className='goal-modal-overlay'>
// 			<div className='goal-modal'>
// 				<div className='goal-modal-header'>
// 					<span>{lang === 'fr' ? 'Ajouter un favori' : 'Add Favorite'}</span>
// 					<button className='goal-modal-close' onClick={onClose}>&times;</button>
// 				</div>
// 				<form onSubmit={handleSubmit} className='goal-modal-form'>
// 					<label>{lang === 'fr' ? 'Description' : 'Description'}</label>
// 					<input
// 						type='text'
// 						placeholder={lang === 'fr' ? 'Description du favori' : 'Favorite description'}
// 						value={desc}
// 						onChange={e => setDesc(e.target.value)}
// 						required
// 					/>
// 					<div className='goal-modal-actions'>
// 						<button type='button' onClick={onClose}>{lang === 'fr' ? 'Annuler' : 'Cancel'}</button>
// 						<button type='submit' className='goal-modal-create'>{lang === 'fr' ? 'Enregistrer' : 'Save'}</button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	)
// }
// export default FavoriteModal
