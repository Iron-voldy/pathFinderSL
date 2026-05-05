const { handlePlannerMessage, getPlannerHealth } = require('../services/plannerService');

const PYTHON_AI_URL = process.env.AI_PYTHON_SERVICE_URL || 'http://127.0.0.1:8100';

async function tryPythonPlanner(path, payload) {
  const response = await fetch(`${PYTHON_AI_URL}${path}`, {
    method: payload ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Python AI service failed (${response.status}): ${text}`);
  }

  return response.json();
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const postPlannerMessage = async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      throw createError(400, 'message is required');
    }

    try {
      const pythonResponse = await tryPythonPlanner('/api/v1/planner/message', {
        message,
        plannerState: req.body?.plannerState || {},
      });
      return res.status(200).json(pythonResponse);
    } catch (pythonError) {
      console.warn('Python AI service unavailable, falling back to Node planner:', pythonError.message);
    }

    const response = await handlePlannerMessage({
      message,
      plannerState: req.body?.plannerState || {},
    });

    return res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    return next(error);
  }
};

const getAiPlannerHealth = async (req, res, next) => {
  try {
    try {
      const pythonHealth = await tryPythonPlanner('/api/v1/planner/health');
      return res.status(200).json(pythonHealth);
    } catch (pythonError) {
      console.warn('Python AI health check failed, falling back to Node planner:', pythonError.message);
    }

    const health = await getPlannerHealth();
    return res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  postPlannerMessage,
  getAiPlannerHealth,
};
