const Joi = require('joi')

/**
 * Exported Joi schema utility
 */
module.exports = {
  createSchemaChildJoiObject
}

/**
 * Generates a child Joi schema from a parent schema by selecting specific fields
 * and defining whether they are required or optional.
 * 
 * This is useful for creating variations of a base schema (e.g., create vs update validation)
 * without duplicating schema definitions.
 * 
 * @param {Object} parentJoiObject - The base Joi schema object
 * @param {Array<String>} requiredFieldsArray - List of field names to include as required
 * @param {Array<String>} optionalFieldsArray - List of field names to include as optional
 * 
 * @returns {Object} Joi schema object containing only the selected fields
 * 
 * @throws {Error} When:
 * - parentJoiObject is missing or invalid
 * - both requiredFieldsArray and optionalFieldsArray are empty or invalid
 * - any provided field does not exist in the parent schema
 */
function createSchemaChildJoiObject (parentJoiObject, requiredFieldsArray = [], optionalFieldsArray = []) {
  /**
   * Validate that parent schema exists and is an object
   */
  if (!parentJoiObject || typeof parentJoiObject !== 'object') {
    throw new Error('Invalid or missing parentJoiObject.')
  }

  /**
   * Ensure at least one of required or optional fields is provided
   */
  if (
    !(Array.isArray(requiredFieldsArray) && requiredFieldsArray.length > 0) &&
    !(Array.isArray(optionalFieldsArray) && optionalFieldsArray.length > 0)
  ) {
    throw new Error('Invalid or missing required or optional field.')
  }

  /**
   * Combine all requested fields
   */
  const allFields = [...requiredFieldsArray, ...optionalFieldsArray]

  /**
   * Extract keys from the parent Joi schema
   */
  const parentKeys = Object.keys(parentJoiObject.describe().keys)

  /**
   * Validate that all requested fields exist in the parent schema
   */
  if (!allFields.every(value => parentKeys.includes(value))) {
    throw new Error('Fields are not a subset of the parent.')
  }

  /**
   * Initialize child schema container
   */
  const childJoiObject = {}

  /**
   * Add required fields to child schema
   */
  requiredFieldsArray.forEach(field => {
    const fieldSchema = parentJoiObject.extract(field)
    if (fieldSchema) {
      childJoiObject[field] = fieldSchema.required()
    }
  })

  /**
   * Add optional fields to child schema
   */
  optionalFieldsArray.forEach(field => {
    const fieldSchema = parentJoiObject.extract(field)
    if (fieldSchema) {
      childJoiObject[field] = fieldSchema
    }
  })

  /**
   * Return constructed Joi schema
   */
  return Joi.object(childJoiObject)
}