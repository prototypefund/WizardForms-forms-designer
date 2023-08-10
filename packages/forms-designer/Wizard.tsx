'use client'

import React, {useCallback, useMemo, useState} from "react";
import {materialCells, materialRenderers} from "@jsonforms/material-renderers";
import {JsonForms} from "@jsonforms/react";
import {selectJsonSchema, selectUiSchema, useAppSelector} from "@formswizard/state";
import {extendUiSchemaWithPath} from "@formswizard/utils";
import {basicRenderer, verticalLayoutTester, VerticalLayoutWithDropZoneRenderer} from "@formswizard/renderer";
import {JsonFormsRendererRegistryEntry} from "@jsonforms/core";

const additionalRenderers = [{
  tester: verticalLayoutTester,
  renderer: VerticalLayoutWithDropZoneRenderer,
}]

const renderers: JsonFormsRendererRegistryEntry[] = [...materialRenderers, ...additionalRenderers, ...basicRenderer]
export function Wizard() {
  const [data, setData] = useState({});

  const handleFormChange = useCallback(
      ({data}: { data: any }) => setData(data),
      [setData]
  )
  const jsonSchema = useAppSelector(selectJsonSchema)
  const uiSchema = useAppSelector(selectUiSchema)
  const uiSchemaWithPath = useMemo(() => extendUiSchemaWithPath(uiSchema), [uiSchema])

  return <JsonForms
        readonly={true}
        data={data}
        renderers={renderers}
        cells={materialCells}
        onChange={handleFormChange}
        schema={jsonSchema}
        uischema={uiSchemaWithPath}
  />
}
