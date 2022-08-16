const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')

module.exports = {
  register: async (req, res) => {
    try {
      const {
        firstName,
        middleName,
        lastName,
        email,
        address,
        password,
      } = req.body

      const hash = await bcrypt.hash(password, 10)
      const user = await db('users').insert({
        firstName,
        middleName,
        lastName,
        email,
        address,
        password: hash,
      })
      res.status(200).json({ messge: 'successfully registered' })
    } catch (error) {
      res.status(500).json(error.message)
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body
      const user = await db('users').where({ email })
      if (!user) {
        res.status(404).json({ message: 'user not found' })
      }
      const isMatch = await bcrypt.compare(password, user[0].password)
      if (!isMatch) {
        res.status(401).json({ message: 'invalid password' })
      }
      const token = jwt.sign({ userId: user[0].id }, 'secret', {
        expiresIn: '2h',
      })
      res.status(200).json({ token })
    } catch (error) {
      res.status(500).json(error.message)
    }
  },

  credit_user_account: async (req, res) => {
    try {
      const { userId, amount } = req.body

      let transactiontype = 'credit'

      let transactionRef = 'credit' + userId + Date.now()

      const user = await db('users').where({ personId: userId })
      if (!user) {
        res.status(404).json({ message: 'user not found' })
      }

      //previous balance

      const previousBalance = user[0].wallet_balance || 0
      //new balance
      const newBalance = previousBalance + amount
      //save user account
      const userAccount = await db('useraccount').insert({
        transaction_type: transactiontype,
        transaction_reference: transactionRef,
        user_id: userId,
        amount: amount,
        wallet_balance: newBalance,
        previous_wallet_balance: previousBalance,
        account_status: 'active',
      })
      res.status(200).json({ message: 'successfully credited' })
    } catch (error) {
      res.status(500).json(error.message)
    }
  },

  get_user_account: async (req, res) => {
    try {
      const { userId } = req.params
      const user = await db('users').where({ personId: userId })
      if (!user) {
        res.status(404).json({ message: 'user not found' })
      }
      const userAccount = await db('useraccount')
        .where({ user_id: userId })
        .join('users', 'users.personId', '=', 'useraccount.user_id')
      res.status(200).json(userAccount)
    } catch (error) {
      res.status(500).json(error.message)
    }
  },

  withdrawal_user_account: async (req, res) => {
    try {
      const { userId, amount } = req.body

      let transactiontype = 'withdrawal'

      let transactionRef = 'withdrawal' + userId + Date.now()

      const user = await db('users').where({ personId: userId })
      if (!user) {
        res.status(404).json({ message: 'user not found' })
      }

      //previous balance
      const previousBalance = user[0].wallet_balance || 0

      if (previousBalance < amount) {
        res.status(400).json({ message: 'insufficient balance' })
      }
      //new balance
      const newBalance = previousBalance - amount
      //save user account
      const userAccount = await db('useraccount').insert({
        transaction_type: transactiontype,
        transaction_reference: transactionRef,
        user_id: userId,
        amount: amount,
        wallet_balance: newBalance,
        previous_wallet_balance: previousBalance,
        account_status: 'active',
      })
    } catch (error) {
      res.status(500).json(error.message)
    }
  },

  transfer: async (req, res) => {
    try {
      const { transfer_from, transfer_to, amount } = req.body

      let transactiontype = 'transfer'

      let transactionRef = 'transfer' + transfer_from + Date.now()

      const user = await db('users').where({ personId: transfer_from })

      if (!user) {
        res.status(404).json({ message: 'user not found' })
      }

      //previous balance

      const previousBalance = user[0].wallet_balance || 0

      //new balance

      const newBalance = previousBalance - amount

      //save user account

      const userAccount = await db('useraccount').insert({
        transaction_type: transactiontype,
        transaction_reference: transactionRef,
        user_id: transfer_from,
        amount: amount,
        wallet_balance: newBalance,
        previous_wallet_balance: previousBalance,
        account_status: 'active',
      })

      //save transfers account

      const transfersAccount = await db('transfers').insert({
        transfer_from: transfer_from,
        transfer_to: transfer_to,
        amount: amount,
        transfer_reference: transactionRef,
        transfer_status: 'active',
      })

      res.status(200).json({ message: 'successfully transferred' })
    } catch (error) {
      res.status(500).json(error.message)
    }
  },
}