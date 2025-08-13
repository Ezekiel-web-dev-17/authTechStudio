const errorMiddleware = async (err, req, res, next) => {
    try {
        let error = {...err}

        error.message = err.message;

        console.error(err);
        // Mongoose bad objectId
        if (err.name === "CastError") {
          const message = "Resource not found";
          error = new Error(message);
          error.statusCode = 404;
        }
    
        // Mongoose duplicate key
        if (err.code === 11000) {
          const message = "Duplicate field value entered";
          error = new Error(message);
          err.statusCode = 400;
        }
    
        // Mongoose Validation Error
        if (err.name === "ValidationError") {
          const message = Object.values(err.errors).map((val) => val.message);
          error = new Error(message.join(", "));
          error.statusCode = 400;
        }

        return res.status(error.statusCode || 500).json({success: false, error: error.message || "Internal server error."})
    } catch (error) {
        next(error)
    }
}

export default errorMiddleware