const { sendLogs } = require('./helpers/logs.helper.js')
const { ContextualApiError } = require('./helpers/variables.helper')

module.exports = {
    error,
    routesWrapper,
    functionWrapper,
    response,
    returnErrorFunctionWrapper
}

async function functionWrapper(fn, args = [], context = {}) {
    try {
        return await fn(...args) // Use arguments when calling the wrapped function
    } catch (error) {
        throw new ContextualApiError({
            logLevel: 'error',
            statusCode: 500,
            customMessage: context.customMessage || null,
            codePath: context.codePath || null,
            extras: context.extras || null
        }, error)
    }
}


async function returnErrorFunctionWrapper(fn, args = [], context = {}) {
    const fnName = fn?.name || 'anonymous function'

    try {
        const response = await fn(...args)

        if (context.loggerInstance && context.success) {
            sendLogs(context.loggerInstance, 'info', { fnc: fnName, ...context.success })
        }

        if (context.returnType === 'array') {
            return [response, null]
        } else {
            return { response, error: null }
        }
    } catch (error) {
        if (context.loggerInstance && context.error) {
            sendLogs(context.loggerInstance, 'error', { fnc: fnName, error, ...context.error })
        }

        if (context.returnType === 'array') {
            return [null, error]
        } else {
            return { response: null, error }
        }
    }
}

function routesWrapper(fns) {
    return fns.map((fn, index) => async (req, res, next) => {
        try {
            await fn(req, res, next)
        } catch (err) {
            // Construct the codePath string
            const prevFncNames = fns.slice(0, index).map(f => f.name).join(' => ')
            const currentFncName = fn.name

            // Build the final codePath string with the desired format
            const codePath = `routesWrapper =>|| ${prevFncNames ? prevFncNames + ' => ' : ''}::${currentFncName}${err.codePath ? ' -> ' + err.codePath : ''}::`

            if (err.customType === 'ContextualApiError') {
                const error = err.data
                    ? {
                        name: err.data.name,
                        stack: err.data.stack,
                        message: err.data.message
                    }
                    : null

                // Add extra metadata for the error
                const errorDetails = {
                    message: err.message,
                    logLevel: err.logLevel || 'error',
                    statusCode: err.statusCode,
                    info: {
                        codePath,
                        extras: err.extras ?? null,
                        error,
                        fncPipeline: fns.map(f => f.name)
                    }
                }

                // Pass the error to the error handler
                next(errorDetails)
            } else {
                const error = {
                    name: err.name,
                    stack: err.stack,
                    message: err.message
                }

                // Add extra metadata for the error
                const errorDetails = {
                    message: err.message,
                    logLevel: 'error',
                    statusCode: 500,
                    info: {
                        codePath,
                        extras: err.extras ?? null,
                        error,
                        fncPipeline: fns.map(f => f.name)
                    }
                }

                next(errorDetails)
            }
        }
    })
}

function error(error, req, res) {
    try {
        // Removed transaction rollback for MongoDB
        sendLogs(req.log, error.logLevel, {
            message: error.message,
            info: { user: { email: req.user?.email, id: req.user?.id }, ...error.info }
        })

        res.status(error.statusCode).end()
    } catch (error) {
        sendLogs(req.log, 'error', {
            message: 'An unexpected error occurred within the error handler',
            info: { error, user: { email: req.user?.email, id: req.user?.id }, codePath: 'routesWrapper =>|| error' }
        })

        res.status(500).end()
    }
}

function response(req, res, info) {
    const { message, data, errors, meta, statusCode, fnc, extras = null } = info

    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message: (statusCode >= 200 && statusCode < 300 ? 'Success' : 'Error'),
        data: data || null,
        meta: meta || null,
        requestUrl: req.originalUrl, // URL of the request
        timestamp: new Date().toISOString() // Timestamp of the response
    }

    sendLogs(req.log, 'info', { message, fnc, info: { user: { email: req.user?.email, id: req.user?.id }, extras, errors } })
    res.status(statusCode).json(response)
}
