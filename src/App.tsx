import React, { useLayoutEffect, useMemo } from 'react'

import { ThemeProvider } from '@mui/material/styles'

import './App.css'
import Routes from './Routes'
import { CssBaseline, useMediaQuery } from '@mui/material'
import CustomDragAndDropPreview from './features/dragAndDrop/CustomDragAndDropPreview'
import { IntlProvider } from 'react-intl'
import messages from './locals/index'
import { useSelector } from 'react-redux'
import { getSelectedLanguage, toggleColorMode } from './features/AppBar/AppBarSlice'

import getTheme from './theme'
import { useAppDispatch, useAppSelector } from './app/hooks/reduxHooks'
import { getThemeProps } from '@mui/system'
function App() {
  const locale = useAppSelector(getSelectedLanguage)
  const themeMode = useAppSelector((state) => state.AppBar.themeMode) as 'light' | 'dark'
  const theme = useMemo(() => getTheme(themeMode), [themeMode])
  return (
    <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="de">
      <ThemeProvider theme={theme}>
        <div className="App">
          <CssBaseline></CssBaseline>
          <Routes></Routes>
          <CustomDragAndDropPreview></CustomDragAndDropPreview>
        </div>
      </ThemeProvider>
    </IntlProvider>
  )
}

export default App

const useCustomTheme = () => {}
