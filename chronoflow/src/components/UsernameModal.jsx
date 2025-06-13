import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function UsernameModal({ isOpen, onClose, onSave }) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')

  const handleSave = () => {
    if (username.trim()) {
      onSave(username)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{t('usernameModal.title')}</h2>
        <p>{t('usernameModal.description')}</p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('usernameModal.placeholder')}
          maxLength={50}
        />
        <div className="modal-actions">
          <button onClick={onClose}>{t('usernameModal.cancel')}</button>
          <button onClick={handleSave}>{t('usernameModal.save')}</button>
        </div>
      </div>
    </div>
  )
}
