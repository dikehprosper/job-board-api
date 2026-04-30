const Joi = require('joi')

module.exports = {
  createSchemaChildJoiObject
}

function createSchemaChildJoiObject (parentJoiObject, requiredFieldsArray = [], optionalFieldsArray = []) {
  if (!parentJoiObject || typeof parentJoiObject !== 'object') {
    throw new Error('Invalid or missing parentJoiObject.')
  }

  if (!(Array.isArray(requiredFieldsArray) && requiredFieldsArray.length > 0) && !(Array.isArray(optionalFieldsArray) && optionalFieldsArray.length > 0)) {
    throw new Error('Invalid or missing required or optional field.')
  }

  const allFields = [...requiredFieldsArray, ...optionalFieldsArray]

  const parentKeys = Object.keys(parentJoiObject.describe().keys)

  if (!allFields.every(value => parentKeys.includes(value))) {
    throw new Error('Fields are not a subset of the parent.')
  }

  const childJoiObject = {}
  requiredFieldsArray.forEach(field => {
    const fieldSchema = parentJoiObject.extract(field)
    if (fieldSchema) {
      childJoiObject[field] = fieldSchema.required()
    }
  })

  optionalFieldsArray.forEach(field => {
    const fieldSchema = parentJoiObject.extract(field)
    if (fieldSchema) {
      childJoiObject[field] = fieldSchema
    }
  })

  return Joi.object(childJoiObject)
}
