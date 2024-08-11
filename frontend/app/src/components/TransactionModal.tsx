'use client'
import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const TransactionModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 z-40' onClick={onClose}></div>
      <div className='fixed inset-0 flex items-center justify-center z-50'>
        <div className='bg-tv p-4 rounded shadow-lg w-96'>{children}</div>
      </div>
    </>
  )
}

export default TransactionModal
