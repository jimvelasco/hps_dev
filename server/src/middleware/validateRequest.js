const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
     //   console.log('Validation error details:', JSON.stringify(error.issues, null, 2));
     //   console.log('Request body:', req.body);
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.issues.map(issue => ({
            field: issue.path.join('.') || 'root',
            message: issue.message,
            code: issue.code
          }))
        });
      }
     res.status(400).json({ message: error.message });
    //   res.status(400).json({ message: JSON.stringify(error.issues, null, 2) });
    }
  };
};

export default validateRequest;
