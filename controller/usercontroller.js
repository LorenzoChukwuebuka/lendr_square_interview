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

      //get previous balance from useraccount

      const balance = await db('useraccount').select(
        db.raw(
          'ifnull((select wallet_balance from useraccount where user_id = ? order by useraccountId desc limit 1), 0 ) AS prevbal ',
          [userId],
        ),
      )

      const previousBalance = balance[0]?.prevbal // previous balance

      if (amount > previousBalance) {
        res.status(400).json({ message: 'insufficient balance' })
      }

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
      const balance = await db('useraccount').select(
        db.raw(
          'ifnull((select wallet_balance from useraccount where user_id = ? order by useraccountId desc limit 1), 0 ) AS prevbal ',
          [userId],
        ),
      )
      const previousBalance = balance[0]?.prevbal // previous balance
      if (amount > previousBalance) {
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

      res.status(200).json({ message: 'successfully withdrawn' })
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
      const balance = await db('useraccount').select(
        db.raw(
          'ifnull((select wallet_balance from useraccount where user_id = ? order by useraccountId desc limit 1), 0 ) AS prevbal ',
          [transfer_from],
        ),
      )
      const previousBalance = balance[0]?.prevbal // previous balance

      if (amount > previousBalance) {
        res.status(400).json({ message: 'insufficient balance' })
      }

      //new balance
      const newBalance = previousBalance - amount

      //save user account
      const userAccount = await db('useraccount').insert({
        transaction_type: transactiontype,
        transaction_reference: transactionRef,
        user_id: transfer_from,
        amount: amount,
        wallet_balance: previousBalance - amount,
        previous_wallet_balance: previousBalance,
        account_status: 'active',
      })

      const transfer = await db('transfers').insert({
        transferred_from: transfer_from,
        transferred_to: transfer_to,
        amount: amount,
        account_status: 'pending',
      })

      const Transferbalance = await db('useraccount').select(
        db.raw(
          'ifnull((select wallet_balance from useraccount where user_id = ? order by useraccountId desc limit 1), 0 ) AS prevbal ',
          [transfer_to],
        ),
      )

      const TransferpreviousBalance = Transferbalance[0]?.prevbal // previous balance

      const TransfernewBalance = TransferpreviousBalance + amount

      const credit_transfered_to = await db('useraccount').insert({
        transaction_type: transactiontype,
        transaction_reference: transactionRef,
        user_id: transfer_to,
        amount: amount,
        wallet_balance: TransfernewBalance,
        previous_wallet_balance: TransferpreviousBalance,
        account_status: 'active',
      })

      res.status(200).json({ message: 'successfully transferred' })
    } catch (error) {
      res.status(500).json(error.message)
    }
  },
}
