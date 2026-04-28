const mongoose = require('mongoose')

let isConnecting = false

const connectDB = async () => {
  console.log('[Db] connectDB called')
  if (isConnecting || mongoose.connection.readyState === 1) return

  if (!process.env.MONGO_URI) {
    console.error('❌ MongoDB connection error: MONGO_URI is missing in .env')
    return
  }

  isConnecting = true
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    setTimeout(() => {
      connectDB()
    }, 5000)
  } finally {
    isConnecting = false
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected. Retrying connection...')
  setTimeout(() => {
    connectDB()
  }, 3000)
})

module.exports = connectDB