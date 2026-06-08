/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import MainLayout from './MainLayout';
import './i18n'; // Keep this to initialize i18next

export default function App() {
  return (
    <SettingsProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </SettingsProvider>
  );
}
