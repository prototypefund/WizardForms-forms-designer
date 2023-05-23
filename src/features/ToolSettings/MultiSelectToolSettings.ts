import { ToolSetting } from './ToolSettingType'

const JsonSchema = {
  type: 'object',
  properties: {
    label: {
      type: 'string',
    },
    options: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
}

const mapWizardSchemaToToolData = (wizardSchema: any, uiSchema: any) => {
  return {
    options: wizardSchema.items.enum,
  }
}

// TODO: insteat of forcefully enforcing rules, we should just warn the user and prevent the update to the schema
// this makes the mapping between the toolData and the wizardSchema more complicated, because we need to check for errors
const mapToolDataToWizardUischema = (toolData: any, wizardUiSchema: any) => {
  // enum item must not be undefined
  // enum must not have duplicates
  // enum must have non-empty array
  // enum must NOT have fewer than 1 items

  return {
    ...wizardUiSchema,
  }
}
const mapToolDataToWizardSchema = (toolData: any, wizardSchema: any) => {
  let newEnum = toolData.options
    .map((line) => (line === undefined ? '' : line))
    .filter((line, index, array) => !array.slice(index + 1).includes(line))
  if (newEnum.length === 0) {
    newEnum = ['']
  }

  return {
    ...wizardSchema,
    items: { ...wizardSchema.items, enum: newEnum },
  }
}

const MultiSelectToolSettings: ToolSetting = {
  mapWizardSchemaToToolData,
  mapToolDataToWizardSchema,
  mapToolDataToWizardUischema,
  isTool: (jsonSchema) =>
    //@ts-ignore
    jsonSchema.type === 'array' && jsonSchema?.items?.type === 'string' && jsonSchema.uniqueItems === true,
  JsonSchema,
}

export default MultiSelectToolSettings
