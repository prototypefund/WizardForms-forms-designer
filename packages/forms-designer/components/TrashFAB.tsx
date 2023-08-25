import { Delete as DeleteIcon } from '@mui/icons-material'
import { Fab, useTheme, Zoom } from '@mui/material'

import { Suspense, useCallback, useMemo } from 'react'
import { useDNDHooksContext } from '@formswizard/react-hooks'
import { DraggableComponent, removeFieldOrLayout, useAppDispatch } from '@formswizard/state'

export const TrashFAB: () => JSX.Element = () => {
  const { useDrop, useDragLayer } = useDNDHooksContext()
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const transitionDuration = useMemo(
    () => ({
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen,
    }),
    [theme]
  )
  const handleRemove = useCallback(
    (componentMeta: DraggableComponent) => {
      dispatch(removeFieldOrLayout({ componentMeta }))
    },
    [dispatch]
  )
  const isDragging = useDragLayer((monitor) => monitor.isDragging())

  // @ts-ignore
  const [{ isOver }, dropRef] = useDrop({
    accept: ['DRAGBOX', 'MOVEBOX'],
    //@ts-ignore
    drop: ({ componentMeta }, monitor) => {
      const itemType = monitor.getItemType()
      if (itemType === 'MOVEBOX') {
        handleRemove(componentMeta)
      }
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <>
      <Zoom
        in={isDragging}
        timeout={transitionDuration}
        style={{
          transitionDelay: `${isDragging ? transitionDuration.exit : 0}ms`,
        }}
        unmountOnExit
      >
        <Fab
          ref={dropRef}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
          size={isOver ? 'large' : 'medium'}
          aria-label={'delete item'}
          color={'secondary'}
        >
          {'❌'}
        </Fab>
      </Zoom>
    </>
  )
}
