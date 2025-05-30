import prisma from '@/lib/prisma';

async function processAI(taskType, brief) {
  // Replace with actual AI integration
  return `AI-generated result for ${taskType}: ${brief}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { userId, brief, taskType } = req.body;

  if (!userId || !brief || !taskType) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const result = await processAI(taskType, brief);

  const task = await prisma.task.create({
    data: {
      userId,
      brief,
      taskType,
      result,
    },
  });

  res.status(200).json({ result });
}