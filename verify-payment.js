import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { session_id, userId } = req.query;

  if (!session_id || !userId) {
    return res.status(400).json({ verified: false, error: 'Missing parameters' });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { sessionId: session_id },
    });

    if (!payment || payment.userId !== userId) {
      return res.status(404).json({ verified: false, error: 'Payment not found or user mismatch' });
    }

    if (!payment.paid) return res.status(200).json({ verified: false });

    const task = await prisma.task.findFirst({
      where: { userId, createdAt: { gt: payment.createdAt } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ verified: true, result: task?.result || null });
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(500).json({ verified: false });
  }
}