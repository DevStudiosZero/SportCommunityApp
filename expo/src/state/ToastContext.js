import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View, Text } from 'react-native';

const ToastContext = createContext();

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', duration = 2500) => {
    const id = idCounter++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toasts Overlay */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' }}>
        {toasts.map((t) => (
          <View key={t.id} className={`px-4 py-3 mb-2 rounded-2xl ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-black'} max-w-[90%]`}>
            <Text className="text-white font-bold">{t.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}