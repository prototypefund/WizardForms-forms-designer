import React, { useCallback, useMemo, useState } from 'react'
import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
import { JsonForms } from '@jsonforms/react'
import { selectJsonSchema, selectUiSchema, useAppSelector, selectPreviewModus } from '@formswizard/state'
import { extendUiSchemaWithPath } from '@formswizard/utils'
import {
  basicRenderer,
  horizontalLayoutTester,
  HorizontalLayoutWithDropZoneRenderer,
  verticalLayoutTester,
  VerticalLayoutWithDropZoneRenderer,
} from '@formswizard/renderer'
import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import { Box } from '@mui/material'

const additionalRenderers = [
  {
    tester: verticalLayoutTester,
    renderer: VerticalLayoutWithDropZoneRenderer,
  },
  {
    tester: horizontalLayoutTester,
    renderer: HorizontalLayoutWithDropZoneRenderer,
  },
]

const renderers: JsonFormsRendererRegistryEntry[] = [...materialRenderers, ...additionalRenderers, ...basicRenderer]
const previewRenderers: JsonFormsRendererRegistryEntry[] = [...materialRenderers, ...basicRenderer]
export function Wizard() {
  const [data, setData] = useState({})

  const handleFormChange = useCallback(({ data }: { data: any }) => setData(data), [setData])
  const jsonSchema = useAppSelector(selectJsonSchema)
  const uiSchema = useAppSelector(selectUiSchema)
  const uiSchemaWithPath = useMemo(() => extendUiSchemaWithPath(uiSchema), [uiSchema])
  const previewModus = useAppSelector(selectPreviewModus)

  return (
    <Box>
      <JsonForms
        data={data}
        renderers={previewModus ? previewRenderers : renderers}
        cells={materialCells}
        onChange={previewModus ? null : handleFormChange}
        schema={jsonSchema}
        uischema={uiSchemaWithPath}
        readonly={previewModus}
      />
    </Box>
  )
}
