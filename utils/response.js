// ============================================================
// RESPONSE HELPER — Standard na format ng lahat ng API response
// Hindi mo na kailangang baguhin ito
// ============================================================

// Para sa matagumpay na response
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Para sa error response
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Para sa paginated na list ng data
const paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
