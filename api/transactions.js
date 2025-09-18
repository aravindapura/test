const transactions = [
  {
    id: 'txn_001',
    amount: 125.5,
    currency: 'USD',
    status: 'completed',
    createdAt: '2024-01-07T12:34:56Z',
    description: 'Subscription renewal'
  },
  {
    id: 'txn_002',
    amount: 78.99,
    currency: 'EUR',
    status: 'pending',
    createdAt: '2024-01-08T08:15:30Z',
    description: 'In-app purchase'
  }
];

module.exports = (req, res) => {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  res.status(200).json({ transactions });
};
