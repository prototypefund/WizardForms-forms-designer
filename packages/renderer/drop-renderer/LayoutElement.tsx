import type { UISchemaElement } from '@jsonforms/core'
import {
  composeWithUi,
  ControlElement,
  getSchema,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  Resolve,
} from '@jsonforms/core'
import { JsonFormsDispatch, useJsonForms } from '@jsonforms/react'
import { Box, Grid, IconButton, Typography } from '@mui/material'
import React, { FC, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector, selectEditMode, selectElement, selectSelectedElementKey } from 'state'
import { Delete } from '@mui/icons-material'
import classnames from 'classnames'
import { useDelayedState } from '../hooks'
import {useDNDHooksContext, useDragTarget, useDropTarget} from 'react-hooks'

export type RemoveWrapperProps = { editMode: boolean; handleRemove: MouseEventHandler; children: ReactNode }
const RemoveWrapper: FC<RemoveWrapperProps> = ({ editMode, handleRemove, children }) => {
  return (
    <>
      {editMode ? (
        <Grid container>
          <Grid item xs={11}>
            {children}
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={handleRemove}>
              <Delete></Delete>
            </IconButton>
          </Grid>
        </Grid>
      ) : (
        children
      )}
    </>
  )
}

type LayoutElementProps = {
  index: number
  direction: 'row' | 'column'
  schema: JsonSchema
  visible: boolean
  path: string
  enabled: boolean
  element: UISchemaElement
  renderers?: JsonFormsRendererRegistryEntry[]
  cells?: JsonFormsCellRendererRegistryEntry[]
  parent: UISchemaElement[]
}

const LayoutElement = ({
  index,
  direction,

  schema,
  path,
  enabled,
  element: child,
  cells,
  parent,
  renderers,
}: LayoutElementProps) => {
  const ctx = useJsonForms()
  const state = { jsonforms: ctx }
  const rootSchema = getSchema(state)
  //const rootData = getData(state)
  const dispatch = useAppDispatch()
  const editMode = useAppSelector(selectEditMode)
  const selectedKey = useAppSelector(selectSelectedElementKey)
  const controlName = useMemo<string | undefined>(
    () => (child.type === 'Control' ? composeWithUi(child as ControlElement, path) : undefined),
    [child, path]
  )

  const resolvedSchema = useMemo<JsonSchema | undefined>(
    () => Resolve.schema(schema || rootSchema, (child as ControlElement).scope, rootSchema),

    [schema, rootSchema, child]
  )

  const key = useMemo<string>(
    () => (controlName ? controlName : `${child.type}-${index}`),
    [controlName, index, child.type]
  )
  const isGroup = useMemo<boolean>(() => child.type === 'Group', [child])
  const { handleAllDrop, handleDropAtStart, draggedMeta } = useDropTarget({ child })
  const { useDrop, useDragLayer } = useDNDHooksContext()
  const anythingDragging = useDragLayer((monitor) => monitor.isDragging())
  const [{ isDragging }, dragRef] = useDragTarget({ child, name: controlName, resolvedSchema })
  // const anythingDragging = true
  const [{ isOver: isOver1, isOverCurrent: isOverCurrent1 }, dropRef] = useDrop(handleAllDrop, [handleAllDrop])
  const [{ isOver: isOver2, isOverCurrent: isOverCurrent2 }, dropRef2] = useDrop(handleAllDrop, [handleAllDrop])
  const [{ isOver: isOver3, isOverCurrent: isOverCurrent3 }, dropRef3] = useDrop(handleDropAtStart, [handleAllDrop])
  const isOver = isOver1 || isOver2
  const isOverCurrent = isOverCurrent1 || isOverCurrent2
  const handleSelect = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation()
      // @ts-ignore
      dispatch(selectElement(key))
    },
    [dispatch, key]
  )

  // const handleRemove = useCallback(
  //   (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //     event.stopPropagation()
  //     dispatch(removeFieldAndLayout({ path: key }))
  //   },
  //   [dispatch, key]
  // )

  return (
    <>
      {index === 0 && (
        <LayoutDropArea
          isOverCurrent={isOverCurrent3}
          dropRef={dropRef3}
          anythingDragging={isDragging || anythingDragging}
        ></LayoutDropArea>
        // <Paper
        //   sx={{
        //     border: 'none',
        //     opacity: isOver3 ? '1.0' : '0.2',
        //     minWidth: '2em',
        //     minHeight: '1.5em',
        //     // bgcolor: (theme) => (isOver ?  theme. : 'none'),
        //     padding: 4,
        //     backgroundColor: isOver3 ? 'yellow' : 'red',
        //   }}
        //   ref={dropRef3}
        // ></Paper>
      )}
      {!isDragging && (
        <>
          <Grid key={key} item ref={dropRef} xs onClick={handleSelect}>
            <Box
              // elevation={selectedKey === key ? 4 : 0}
              sx={{
                flexGrow: 1,
                display: isDragging ? 'none' : 'flex',
                backgroundColor: (theme) => (selectedKey === key ? theme.palette.primary.light : 'none'),
                padding: (theme) => theme.spacing(1, 2),
                cursor: 'grab !important',
                ' * ': {
                  cursor: 'grab !important',
                },
                ' > *': {
                  flexGrow: 1,
                },
                ':hover': {
                  backgroundColor: (theme) => theme.palette.primary.main,
                },
              }}
              ref={dragRef}
            >
              <JsonFormsDispatch
                uischema={child}
                schema={schema}
                path={path}
                enabled={enabled}
                renderers={renderers}
                cells={cells}
              />
            </Box>
          </Grid>
          <LayoutDropArea
            isOverCurrent={isOverCurrent}
            dropRef={dropRef2}
            anythingDragging={anythingDragging}
          ></LayoutDropArea>
        </>
      )}
    </>
  )
}

type LayoutDropAreaProps = {
  isOverCurrent: boolean
  dropRef: any
  anythingDragging: boolean
}
function LayoutDropArea({ isOverCurrent, dropRef, anythingDragging }: LayoutDropAreaProps) {
  const [dragging, setDragging, cancel] = useDelayedState<boolean>(false, { delay: 10, delayedValue: true })

  useEffect(() => {
    setDragging(anythingDragging)
    if (anythingDragging !== dragging && !anythingDragging) {
      cancel(false)
    }
  }, [anythingDragging])

  return (
    <Box
      sx={{
        opacity: isOverCurrent ? '1.0' : '0.3',
        display: dragging ? 'block' : 'none',
      }}
      ref={dropRef}
    >
      <Box
        className={classnames({ 'is-over-dropzone': isOverCurrent })}
        sx={{
          display: 'flex',
          height: '1.5em',
          textAlign: 'center',
          verticalAlign: 'middle',
          margin: (theme) => theme.spacing(1, 2),
        }}
      >
        <Typography
          sx={{
            margin: 'auto',
          }}
        >
          drop here
        </Typography>
      </Box>
    </Box>
  )
}

export default LayoutElement