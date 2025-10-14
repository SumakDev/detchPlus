"use client";

import { useState, useEffect } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 'medium',
    reduceMotion: false
  });

  // Función para aplicar estilos al DOM
  const applySettingsToDOM = (newSettings: AccessibilitySettings) => {
    if (typeof window === 'undefined') return; // Check para SSR
    
    const html = document.documentElement;
    const body = document.body;

    // Limpiar clases anteriores
    const classesToRemove = [
      'high-contrast', 'reduce-motion', 
      'font-size-small', 'font-size-medium', 'font-size-large'
    ];
    
    classesToRemove.forEach(cls => {
      html.classList.remove(cls);
      body.classList.remove(cls);
    });

    // Aplicar nuevas configuraciones
    if (newSettings.highContrast) {
      html.classList.add('high-contrast');
      body.classList.add('high-contrast');
      
      // Aplicar estilos inline para forzar cambios
      html.style.setProperty('filter', 'contrast(150%) brightness(0.8)');
    } else {
      html.style.removeProperty('filter');
    }

    // Aplicar tamaño de fuente
    const fontClass = `font-size-${newSettings.fontSize}`;
    html.classList.add(fontClass);
    body.classList.add(fontClass);

    // Aplicar zoom de fuente
    const fontSizes = { small: '14px', medium: '16px', large: '20px' };
    html.style.fontSize = fontSizes[newSettings.fontSize];

    // Reducir movimiento
    if (newSettings.reduceMotion) {
      html.classList.add('reduce-motion');
      body.classList.add('reduce-motion');
      
      // Aplicar CSS inline para forzar
      const style = document.getElementById('reduce-motion-style') || document.createElement('style');
      style.id = 'reduce-motion-style';
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0ms !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      const style = document.getElementById('reduce-motion-style');
      if (style) style.remove();
    }

    console.log('Configuraciones aplicadas:', newSettings); // Para debug
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detectar preferencias del sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Cargar configuraciones guardadas
    const savedSettings = localStorage.getItem('accessibility-settings');
    let initialSettings = settings;
    
    if (savedSettings) {
      try {
        initialSettings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing saved accessibility settings:', error);
        // Usar configuraciones por defecto
        initialSettings = {
          highContrast: prefersHighContrast,
          fontSize: 'medium',
          reduceMotion: prefersReducedMotion
        };
      }
    } else {
      // Usar preferencias del sistema
      initialSettings = {
        highContrast: prefersHighContrast,
        fontSize: 'medium',
        reduceMotion: prefersReducedMotion
      };
    }

    setSettings(initialSettings);
    
    // Aplicar con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => applySettingsToDOM(initialSettings), 100);

  }, []);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
    }
    
    // Aplicar cambios inmediatamente
    applySettingsToDOM(updated);
    
    // Anunciar cambios para screen readers
    announceToScreenReader(updated, newSettings);
  };

  const announceToScreenReader = (allSettings: AccessibilitySettings, changedSettings: Partial<AccessibilitySettings>) => {
    if (typeof window === 'undefined') return;
    
    const changes = Object.entries(changedSettings).map(([key, value]) => {
      switch (key) {
        case 'highContrast':
          return `Alto contraste ${value ? 'activado' : 'desactivado'}`;
        case 'fontSize':
          const sizeNames = { small: 'pequeño', medium: 'mediano', large: 'grande' };
          return `Tamaño de fuente cambiado a ${sizeNames[value as keyof typeof sizeNames]}`;
        case 'reduceMotion':
          return `Reducir animaciones ${value ? 'activado' : 'desactivado'}`;
        default:
          return '';
      }
    }).filter(Boolean).join(', ');

    if (changes) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = changes;
      document.body.appendChild(announcer);
      
      setTimeout(() => {
        if (document.body.contains(announcer)) {
          document.body.removeChild(announcer);
        }
      }, 2000);
    }
  };

  return { settings, updateSettings };
}