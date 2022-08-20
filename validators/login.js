const Joi = require("joi");

module.exports = Joi.object({
  email: Joi.string()
    .required()
    .min(8)
    .max(30)
    .email()
    .messages({
      "string.min": "Minimum 8 character required",
      "string.max": "Maximum 30 characters required",
      "string.email": "Invalid email",
      "string.empty": "Email is required",
    })
    .label("emailErr"),
  password: Joi.string()
    .required()
    .min(8)
    .max(30)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/)
    .messages({
      "string.min": "Minimum 8 character required",
      "string.max": "Maximum 30 characters required",
      "string.empty": "Password is required",
      "string.pattern.base": "Invalid password",
    })
    .label("passErr"),
});
