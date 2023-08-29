import { isEqual } from 'lodash'
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'

import {
  selectSelectedElementKey,
  selectUIElementFromSelection,
  updateJsonSchemaByPath,
  selectSelectedElementJsonSchema,
  selectSelectedPath,
  useAppDispatch,
  useAppSelector,
} from '@formswizard/state'
import SelectToolSettings from './settings/SelectToolSettings'
import { ToolSettingsDefinitions } from './ToolSettingsDefinition'

function useToolSettings() {
  const dispatch = useAppDispatch()
  const [tooldataBuffer, setToolDataBuffer] = useState({})
  const selectedKey = useAppSelector(selectSelectedElementKey)
  const selectedPath = useAppSelector(selectSelectedPath)
  const UIElementFromSelection = useAppSelector(selectUIElementFromSelection)
  const selectedElementJsonSchema = useAppSelector(selectSelectedElementJsonSchema)
  const prevSelectedKey = useRef(null)

  console.log({ UIElementFromSelection, selectedElementJsonSchema })

  const toolSettings = useMemo(
    () =>
      UIElementFromSelection
        ? ToolSettingsDefinitions.find((d) => {
            let tool = d.isTool(selectedElementJsonSchema, UIElementFromSelection)
            return tool
          }) ?? null
        : null,
    [selectedElementJsonSchema, UIElementFromSelection]
  )

  const toolSettingsJsonSchema = useMemo(
    () =>
      toolSettings
        ? {
            ...toolSettings.JsonSchema,
            properties: {
              ...toolSettings.toolSettingsMixins.reduce((prev, curr) => ({ ...prev, ...curr.jsonSchemaElement }), {}),
              ...toolSettings.JsonSchema.properties,
            },
          }
        : null,
    [toolSettings]
  )
  const handleChange = (event) => {
    setToolDataBuffer(event.data)
    mapToolToWizard(event.data)
  }

  const getToolData = useCallback(
    () =>
      toolSettings
        ? toolSettings.toolSettingsMixins.reduce(
            (prev, curr) => curr.mapWizardToAddonData(prev, selectedElementJsonSchema, UIElementFromSelection),
            toolSettings.mapWizardSchemaToToolData(selectedElementJsonSchema ?? {}, UIElementFromSelection)
          )
        : null,
    [selectedElementJsonSchema, toolSettings, UIElementFromSelection]
  )

  const mapToolToWizard = useCallback(
    (data) => {
      if (!toolSettings || !UIElementFromSelection || !selectedPath) return
      const updatedJsonSchema = toolSettings.mapToolDataToWizardSchema(data, selectedElementJsonSchema ?? {})
      const updatedUIschema = toolSettings.mapToolDataToWizardUischema(data, UIElementFromSelection)
      console.log('compute mixins')
      const ToolsettingAddonsSchemaMapper = toolSettings.toolSettingsMixins
        .map((t) => t.mapAddonDataToWizardSchema)
        .filter(Boolean)
      const ToolsettingAddonsUISchemaMapper = toolSettings.toolSettingsMixins
        .map((t) => t.mapAddonDataToWizardUISchema)
        .filter(Boolean)
      const updatedJsonSchemaFromAddons = ToolsettingAddonsSchemaMapper.reduce(
        (prev, curr) => curr(data, prev),
        updatedJsonSchema
      )
      const updatedUIschemaWithAddons = ToolsettingAddonsUISchemaMapper.reduce(
        (prev, curr) => curr(data, prev),
        updatedUIschema
      )

      dispatch(
        updateJsonSchemaByPath({
          path: selectedPath,
          updatedSchema: updatedJsonSchemaFromAddons,
          updatedUIschema: updatedUIschemaWithAddons,
        })
      )
    },
    [UIElementFromSelection, dispatch, selectedElementJsonSchema, selectedPath, toolSettings]
  )

  useEffect(() => {
    if (prevSelectedKey.current === selectedPath) return
    setToolDataBuffer(getToolData())
    //@ts-ignore
    prevSelectedKey.current = selectedPath
  }, [getToolData, selectedPath])

  console.log({ handleChange, uiSchema: {}, toolSettingsJsonSchema, tooldataBuffer, setToolDataBuffer })
  return { handleChange, uiSchema: {}, toolSettingsJsonSchema, tooldataBuffer, setToolDataBuffer }
}

export default useToolSettings
