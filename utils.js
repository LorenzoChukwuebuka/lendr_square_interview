const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) throw new Error('Token Not found')

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) throw new Error('Token verification' + err)
      req.body.tokenData = user
      next()
    })
  } catch (error) {
    return res.status(401).json({ message: error.message })
  }
}
