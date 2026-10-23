import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChatbotController } from '../src/chatbot/chatbot.controller';

test('chatbot processing receives JWT identity instead of client-supplied identity', async () => {
  let receivedUser: any;
  const controller = new ChatbotController({
    processQuery: async (_message: string, _history: any[], _context: any, user: any) => {
      receivedUser = user;
      return { answer: 'ok' };
    },
  } as any);
  const authenticatedUser = { id: 'verified-user', role: 'STUDENT' };

  await controller.query(authenticatedUser, {
    message: 'question',
    history: [],
    context: {},
    user: { id: 'forged-user', role: 'SUPER_ADMIN' },
  } as any);

  assert.equal(receivedUser, authenticatedUser);
});
